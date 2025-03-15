// Initialisation de Socket.io
const socket = io();

// Fonction pour charger les rendez-vous existants
async function loadExistingAppointments() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/professionnel/rendez-vous', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error('Erreur de chargement des rendez-vous');

        const appointments = await response.json();
        const appointmentList = document.getElementById('appointmentList');
        appointmentList.innerHTML = ''; // Nettoyer la liste avant d'ajouter les rendez-vous
        
        appointments.forEach(rdv => {
            const newRow = document.createElement('tr');
            newRow.innerHTML = `
                <td>${rdv.clientName}</td>
                <td>${rdv.date || 'Date non spécifiée'}</td>
                <td>${rdv.time || 'Heure non spécifiée'}</td>
                <td>
                    ${rdv.status === 'en_attente' ? 
                        `<button class="btn btn-success" onclick="repondreReservation('${rdv.clientName}', 'accepté')">Accepter</button>
                         <button class="btn btn-danger" onclick="repondreReservation('${rdv.clientName}', 'refusé')">Refuser</button>` :
                        `<button class="btn btn-${rdv.status === 'accepté' ? 'success' : 'danger'}" disabled>
                            Rendez-vous ${rdv.status} avec ${rdv.clientName}
                         </button>`
                    }
                </td>
            `;
            appointmentList.appendChild(newRow);
        });

        // Sauvegarder les rendez-vous dans le localStorage
        localStorage.setItem('appointments', JSON.stringify(appointments));
    } catch (error) {
        console.error('Erreur lors du chargement des rendez-vous:', error);
        // En cas d'erreur, charger les rendez-vous depuis le localStorage
        const savedAppointments = JSON.parse(localStorage.getItem('appointments') || '[]');
        displayAppointments(savedAppointments);
    }
}

// Fonction pour afficher les rendez-vous
function displayAppointments(appointments) {
    const appointmentList = document.getElementById('appointmentList');
    appointmentList.innerHTML = '';
    
    appointments.forEach(rdv => {
        const newRow = document.createElement('tr');
        newRow.innerHTML = `
            <td>${rdv.clientName}</td>
            <td>${rdv.date || 'Date non spécifiée'}</td>
            <td>${rdv.time || 'Heure non spécifiée'}</td>
            <td>
                ${rdv.status === 'en_attente' ? 
                    `<button class="btn btn-success" onclick="repondreReservation('${rdv.clientName}', 'accepté')">Accepter</button>
                     <button class="btn btn-danger" onclick="repondreReservation('${rdv.clientName}', 'refusé')">Refuser</button>` :
                    `<button class="btn btn-${rdv.status === 'accepté' ? 'success' : 'danger'}" disabled>
                        Rendez-vous ${rdv.status} avec ${rdv.clientName}
                     </button>`
                }
            </td>
        `;
        appointmentList.appendChild(newRow);
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    // Charger les rendez-vous au démarrage
    await loadExistingAppointments();

    const token = localStorage.getItem('token');
    if (!token) {
        // Si pas de token, charger les rendez-vous depuis le localStorage
        const savedAppointments = JSON.parse(localStorage.getItem('appointments') || '[]');
        displayAppointments(savedAppointments);
        return;
    }

    try {
        const response = await fetch('/auth/me', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Erreur de chargement');
        
        const user = await response.json();
        
        // Remplissage des données
        document.getElementById('name').value = user.username;
        document.getElementById('job').value = user.job;
        document.getElementById('location').value = user.cityAddress;
        document.getElementById('email').value = user.email;

    } catch (error) {
        console.error('Erreur:', error);
        // Ne pas rediriger vers login.html en cas d'erreur
        const savedAppointments = JSON.parse(localStorage.getItem('appointments') || '[]');
        displayAppointments(savedAppointments);
    }


    document.getElementById('logout').addEventListener('click', () => {
        localStorage.removeItem('token');
        window.location.href = '/login.html';
    });

    document.getElementById('editProfileBtn').addEventListener('click', function() {
        document.getElementById('name').removeAttribute('readonly');
        document.getElementById('email').removeAttribute('readonly');
        document.getElementById('job').removeAttribute('readonly');
        document.getElementById('location').removeAttribute('readonly');
        document.getElementById('saveProfileBtn').classList.remove('d-none');
        document.getElementById('editProfileBtn').classList.add('d-none');
    });

    document.getElementById('profileForm').addEventListener('submit', async function (e) {
        e.preventDefault();

        const username = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const job = document.getElementById('job').value;
        const cityAddress = document.getElementById('location').value;
        const token = localStorage.getItem('token');
    // Gestion des événements de connexion et d'erreur
    socket.on('connect', () => {
        console.log('Connecté au serveur Socket.io');
    });

    socket.on('connect_error', (error) => {
        console.error('Erreur de connexion à Socket.io:', error);
    });

    // Recevoir une nouvelle réservation
    socket.on('nouvelle_reservation', (data) => {
        console.log('Nouvelle réservation reçue :', data);
        const appointmentList = document.getElementById('appointmentList');
        
        // Vérification des données reçues
        if (!data.clientName) {
            console.error('Erreur: Nom du client manquant dans la réservation');
            return;
        }

        // Vérifier si c'est une réservation pour ce professionnel
        const currentProfName = document.getElementById('name').value;
        if (data.professionnelName !== currentProfName) {
            console.log('Cette réservation n\'est pas pour ce professionnel');
            return;
        }

        const newRow = document.createElement('tr');
        newRow.innerHTML = `
            <td>${data.clientName}</td>
            <td>${data.date || 'Date non spécifiée'}</td>
            <td>${data.time || 'Heure non spécifiée'}</td>
            <td>
                <button class="btn btn-success" onclick="repondreReservation('${data.clientName}', 'accepté')">Accepter</button>
                <button class="btn btn-danger" onclick="repondreReservation('${data.clientName}', 'refusé')">Refuser</button>
            </td>
        `;
        appointmentList.appendChild(newRow);
    });

    // Gestion du formulaire de profil
    document.getElementById('editProfileBtn').addEventListener('click', function() {
        document.getElementById('name').removeAttribute('readonly');
        document.getElementById('email').removeAttribute('readonly');
        document.getElementById('job').removeAttribute('readonly');
        document.getElementById('location').removeAttribute('readonly');
        document.getElementById('saveProfileBtn').classList.remove('d-none');
        document.getElementById('editProfileBtn').classList.add('d-none');
    });

    document.getElementById('profileForm').addEventListener('submit', async function(e) {
        e.preventDefault();

        const username = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const job = document.getElementById('job').value;
        const cityAddress = document.getElementById('location').value;
        const token = localStorage.getItem('token');

        try {
            console.log('Données envoyées :', { username, email, job, cityAddress });

            const response = await fetch('/auth/Update', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, email, job, cityAddress })
            });

            const text = await response.text();
            console.log("Réponse brute du serveur :", text);

            let result;
            try {
                result = JSON.parse(text);
            } catch (e) {
                throw new Error('La réponse du serveur n\'est pas un JSON valide');
            }

            console.log("Réponse serveur :", result);

            if (!response.ok) {
                throw new Error(result.message || 'Erreur de mise à jour');
            }

            alert(result.message);
            // Mise à jour de l'affichage
            document.getElementById('name').value = username;
            document.getElementById('email').value = email;
            document.getElementById('job').value = job;
            document.getElementById('location').value = cityAddress;

            document.getElementById('name').setAttribute('readonly', 'readonly');
            document.getElementById('email').setAttribute('readonly', 'readonly');
            document.getElementById('job').setAttribute('readonly', 'readonly');
            document.getElementById('location').setAttribute('readonly', 'readonly');
            document.getElementById('saveProfileBtn').classList.add('d-none');
            document.getElementById('editProfileBtn').classList.remove('d-none');
        } catch (error) {
            console.error('Erreur :', error);
            alert(error.message || 'Erreur lors de la mise à jour du profil');
        }
    
    });

    const socket = io();

    // Gestion des événements de connexion et d'erreur
    socket.on('connect', () => {
        console.log('Connecté au serveur Socket.io');
    });

    socket.on('connect_error', (error) => {
        console.error('Erreur de connexion à Socket.io:', error);
    });

    // Recevoir une nouvelle réservation
    socket.on("nouvelle_reservation", (data) => {
        console.log("Nouvelle réservation reçue :", data);
        const appointmentList = document.getElementById("appointmentList");
        const newRow = document.createElement("tr");
        newRow.innerHTML = `
            <td>${data.clientName || 'Nom non disponible'}</td>
            <td>${data.date}</td>
            <td>${data.time}</td>
            <td>
                <button class="btn btn-success" onclick="repondreReservation('${data.reservationId}', 'accepté')">Accepter</button>
                <button class="btn btn-danger" onclick="repondreReservation('${data.reservationId}', 'refusé')">Refuser</button>
            </td>
        `;
        appointmentList.appendChild(newRow);
    });

    // Envoyer la réponse du professionnel
    function repondreReservation(reservationId, reponse) {
        const data = {
            reservationId: reservationId,
            reponse: reponse,
        };
        console.log("Réponse envoyée :", data);
        socket.emit("reponse_professionnel", data, (ack) => {
            if (ack && ack.status === 'success') {
                alert('Réponse envoyée avec succès');
            } else {
                alert('Erreur lors de l\'envoi de la réponse');
            }
        });
    }

    // Déconnexion
    document.getElementById('logout').addEventListener('click', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        localStorage.removeItem('userId');
        window.location.href = '/login.html';
    });
});
    });

    // Déconnexion
    document.getElementById('logout').addEventListener('click', () => {
        localStorage.clear();
        window.location.href = '/login.html';
    });

// Fonction pour répondre à une réservation
function repondreReservation(clientName, reponse) {
    const professionnelName = document.getElementById('name').value;
    const data = {
        clientName: clientName,
        professionnelName: professionnelName,
        reponse: reponse
    };
    
    // Trouver la ligne du rendez-vous
    const rows = document.querySelectorAll('#appointmentList tr');
    rows.forEach(row => {
        if (row.querySelector('td')?.textContent === clientName) {
            const actionCell = row.querySelector('td:last-child');
            // Mettre à jour les boutons selon la réponse
            if (reponse === 'accepté') {
                actionCell.innerHTML = `<button class="btn btn-success" disabled>Rendez-vous accepté avec ${clientName}</button>`;
            } else {
                actionCell.innerHTML = `<button class="btn btn-danger" disabled>Rendez-vous refusé avec ${clientName}</button>`;
            }
        }
    });

    // Mettre à jour le localStorage
    const savedAppointments = JSON.parse(localStorage.getItem('appointments') || '[]');
    const updatedAppointments = savedAppointments.map(rdv => {
        if (rdv.clientName === clientName) {
            return { ...rdv, status: reponse };
        }
        return rdv;
    });
    localStorage.setItem('appointments', JSON.stringify(updatedAppointments));

    console.log("Réponse envoyée :", data);
    socket.emit("reponse_professionnel", data);
    alert(`Vous avez ${reponse} le rendez-vous avec ${clientName}`);
}

