require('dotenv').config();
const express = require('express');
const path = require('path');
const connectDB = require('./config/db'); // Importer la connexion à MongoDB
const authRoutes = require('./routes/auth.Routes');
const clientRoutes = require('./routes/client.Routes');
const professionnelRoutes = require('./routes/professionnel.Routes');
const profileRoutes = require('./routes/auth.Routes');
const searchRoutes = require('./routes/search.Routes');
const adminRoutes = require('./routes/admin.Routes');
const cors = require('cors');
const mongoose = require('mongoose');
const User = require('./models/User');
const Reservation = require('./models/Reservation');
const jwt = require('jsonwebtoken');
const http = require('http');
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const port = process.env.PORT || 5000;

// Connexion à MongoDB
connectDB();

// Middleware pour parser les requêtes JSON et les données de formulaire
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Servir les fichiers statiques (CSS, JS, images)
app.use(express.static("public"));

// Routes
app.use("/auth", authRoutes);
app.use("/client", clientRoutes);
app.use("/professionnel", professionnelRoutes);
app.use("/admin", adminRoutes);
app.use("/search", searchRoutes);
app.use('/auth', profileRoutes);


// Route de la page d'accueil
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

// Route pour la page de connexion
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Route pour la page de connexion
app.get('/clients', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'client.html'));
});

// Route pour la page d'inscription
app.get("/signup", (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});
app.get("/professionnel", (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'professionnel.html'));
});

// Route pour la page Profile
app.get("/profile", (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'profile.html'));
});
app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});
app.get("/api/stats", async (req, res) => {
  try {
      // Récupération des statistiques de base
      const [clientCount, proCount, reservationCount] = await Promise.all([
          User.countDocuments({ role: "client" }),
          User.countDocuments({ role: "professionnel" }),
          Reservation.countDocuments({})
      ]);

      // Récupération des statistiques détaillées des réservations
      const [enAttente, acceptees, refusees] = await Promise.all([
          Reservation.countDocuments({ status: 'en_attente' }),
          Reservation.countDocuments({ status: 'accepté' }),
          Reservation.countDocuments({ status: 'refusé' })
      ]);

      // Récupération des statistiques d'évolution des clients (derniers 7 mois)
      const clientStats = [65, 59, 80, 81, 56, 55, 40]; // Données statiques pour l'exemple

      res.json({
          clients: clientCount,
          professionnels: proCount,
          reservations: {
              total: reservationCount,
              en_attente: enAttente,
              acceptees: acceptees,
              refusees: refusees
          },
          clientStats: clientStats
      });
  } catch (error) {
      console.error("Erreur lors du chargement des statistiques :", error);
      res.status(500).json({ 
          message: "Erreur serveur",
          error: error.message 
      });
  }
});

// ✅ Route pour récupérer tous les clients
app.get('/api/clients', async (req, res) => {
  try {
      const clients = await User.find({ role: 'client' }); // Filtrer uniquement les clients
      res.json(clients);
  } catch (error) {
      console.error('Erreur lors de la récupération des clients:', error);
      res.status(500).json({ message: 'Erreur interne du serveur' });
  }
});

// ✅ Route pour supprimer un client par ID
app.delete('/api/clients/:id', async (req, res) => {
  try {
      const clientId = req.params.id;
      const result = await User.deleteOne({ _id: clientId });

      if (result.deletedCount === 0) {
          return res.status(404).json({ message: 'Client non trouvé' });
      }

      res.json({ message: 'Client supprimé avec succès' });
  } catch (error) {
      console.error('Erreur lors de la suppression du client:', error);
      res.status(500).json({ message: 'Erreur interne du serveur' });
  }
});

// Route pour récupérer tous les professionnels
app.get("/api/professionnels", async (req, res) => {
  try {
      const professionnels = await User.find({ role: 'professionnel' });
      res.json(professionnels); // ✅ Envoi des données correctement
  } catch (error) {
      res.status(500).json({ error: "Erreur lors de la récupération des professionnels." });
  }
});

// Supprimer un professionnel
app.delete("/api/professionnels/:id", async (req, res) => {
  try {
      await User.findByIdAndDelete(req.params.id);
      res.json({ message: "Professionnel supprimé avec succès." });
  } catch (error) {
      res.status(500).json({ error: "Erreur lors de la suppression du professionnel." });
  }
});

// Route pour récupérer les rendez-vous d'un client
app.get('/api/mes-rendez-vous', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Non autorisé' });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const client = await User.findById(decoded.id);
        
        if (!client) {
            return res.status(404).json({ message: 'Client non trouvé' });
        }

        const reservations = await Reservation.find({ clientId: client._id })
            .populate('professionalId', 'username')
            .sort({ createdAt: -1 });

        const formattedReservations = reservations.map(rdv => ({
            professionnelName: rdv.professionalId.username,
            date: rdv.date,
            time: rdv.time,
            status: rdv.status
        }));

        res.json(formattedReservations);
    } catch (error) {
        console.error('Erreur lors de la récupération des rendez-vous:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// Route pour récupérer les rendez-vous d'un professionnel
app.get('/api/professionnel/rendez-vous', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Non autorisé' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const professionnel = await User.findById(decoded.id);
        
        if (!professionnel || professionnel.role !== 'professionnel') {
            return res.status(404).json({ message: 'Professionnel non trouvé' });
        }

        const reservations = await Reservation.find({ professionalId: professionnel._id })
            .populate('clientId', 'username')
            .sort({ createdAt: -1 });

        const formattedReservations = reservations.map(rdv => ({
            clientName: rdv.clientId.username,
            date: rdv.date,
            time: rdv.time,
            status: rdv.status
        }));

        res.json(formattedReservations);
    } catch (error) {
        console.error('Erreur lors de la récupération des rendez-vous:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

io.on('connection', (socket) => {
    console.log('Un utilisateur est connecté.');

    socket.on('nouvelle_reservation', async (data) => {
        try {
            // Vérification des données reçues
            if (!data.clientName || !data.professionnelName) {
                console.error('Erreur: Données manquantes dans la réservation');
                return;
            }

            // Recherche des IDs des utilisateurs
            const [client, professionnel] = await Promise.all([
                User.findOne({ username: data.clientName }),
                User.findOne({ username: data.professionnelName })
            ]);

            if (!client || !professionnel) {
                console.error('Erreur: Client ou professionnel non trouvé');
                return;
            }

            // Création de la réservation dans la base de données
            const reservation = new Reservation({
                clientId: client._id,
                professionalId: professionnel._id,
                date: data.date,
                time: data.time,
                status: 'en_attente'
            });

            await reservation.save();
            console.log('Réservation enregistrée dans la base de données:', reservation);

            // Émettre l'événement à tous les clients connectés
            io.emit('nouvelle_reservation', {
                clientName: data.clientName,
                professionnelName: data.professionnelName,
                date: data.date,
                time: data.time,
                reservationId: reservation._id
            });
        } catch (error) {
            console.error('Erreur lors de l\'enregistrement de la réservation:', error);
        }
    });

    socket.on('reponse_professionnel', async (data) => {
        try {
            if (!data.clientName || !data.professionnelName || !data.reponse) {
                console.error('Erreur: Données manquantes dans la réponse');
                return;
            }

            // Recherche des IDs des utilisateurs
            const [client, professionnel] = await Promise.all([
                User.findOne({ username: data.clientName }),
                User.findOne({ username: data.professionnelName })
            ]);

            if (!client || !professionnel) {
                console.error('Erreur: Client ou professionnel non trouvé');
                return;
            }

            // Mise à jour du statut de la réservation
            const reservation = await Reservation.findOneAndUpdate(
                {
                    clientId: client._id,
                    professionalId: professionnel._id,
                    status: 'en_attente'
                },
                { status: data.reponse === 'accepté' ? 'accepté' : 'refusé' },
                { new: true }
            );

            if (!reservation) {
                console.error('Erreur: Réservation non trouvée');
                return;
            }

            // Émettre la réponse au client
            io.emit('maj_rendezvous', {
                clientName: data.clientName,
                professionnelName: data.professionnelName,
                reponse: data.reponse
            });
        } catch (error) {
            console.error('Erreur lors de la mise à jour de la réservation:', error);
        }
    });

    socket.on('disconnect', () => {
        console.log('Un utilisateur s\'est déconnecté.');
    });
});

// Démarrer le serveur
server.listen(port, () => {
  console.log(`Serveur démarré sur le port ${port}`);
});
