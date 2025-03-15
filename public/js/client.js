const socket = io();

// Définition de rechercherProfessionnel
   const rechercherProfessionnel = async () => {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    try {
        document.getElementById('loadingSpinner').classList.remove('d-none');
        const response = await fetch(`/search/search-professionals?job=${searchTerm}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        const professionals = await response.json();
        document.getElementById('loadingSpinner').classList.add('d-none');
        const resultsBody = document.getElementById('resultsBody');
        if (professionals.length === 0) {
            resultsBody.innerHTML = `<tr><td colspan="4" class="text-center">Aucun professionnel trouvé</td></tr>`;
        } else {
            resultsBody.innerHTML = professionals.map(prof => `
                <tr>
                    <td>${prof.username}</td>
                    <td>${prof.job}</td>
                    <td>${prof.cityAddress}</td>
                    <td><button class="btn btn-primary" onclick="reserver('${prof.username}')">Réserver</button></td>
                </tr>
            `).join('');
        }
        document.getElementById('resultsSection').classList.remove('d-none');
    } catch (error) {
        console.error('Erreur lors de la recherche :', error);
        alert('Une erreur est survenue lors de la recherche.');
        document.getElementById('loadingSpinner').classList.add('d-none');
    }

.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Erreur:', error));
// Définition de rechercherProfessionnel
const rechercherProfessionnel = async () => {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    try {
        document.getElementById('loadingSpinner').classList.remove('d-none');
        const response = await fetch(`/search/search-professionals?job=${searchTerm}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        const professionals = await response.json();
        document.getElementById('loadingSpinner').classList.add('d-none');
        const resultsBody = document.getElementById('resultsBody');
        if (professionals.length === 0) {
            resultsBody.innerHTML = `<tr><td colspan="4" class="text-center">Aucun professionnel trouvé</td></tr>`;
        } else {
            resultsBody.innerHTML = professionals.map(prof => `
                <tr>
                    <td>${prof.username}</td>
                    <td>${prof.job}</td>
                    <td>${prof.cityAddress}</td>
                    <td><button class="btn btn-primary" onclick="reserver('${prof.username}')">Réserver</button></td>
                </tr>
            `).join('');
        }
        document.getElementById('resultsSection').classList.remove('d-none');
    } catch (error) {
        console.error('Erreur lors de la recherche :', error);
        alert('Une erreur est survenue lors de la recherche.');
        document.getElementById('loadingSpinner').classList.add('d-none');
    }
};

// Déconnexion
document.getElementById('logout').addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('userId');
    window.location.href = '/login.html';
});


function reserver(professionnelName) {
    // Vérification de l'authentification
    const token = localStorage.getItem('token');
    const clientName = localStorage.getItem('username');
    
    console.log('État de l\'authentification:', {
        token: !!token,
        clientName: clientName
    });

    if (!token || !clientName) {
        console.error('Données d\'authentification manquantes:', {
            token: !!token,
            clientName: clientName
        });
        alert('Erreur : Vous devez être connecté pour faire une réservation');
        window.location.href = '/login.html';
        return;
    }

    // Vérification supplémentaire du nom du client
    if (clientName === 'undefined' || clientName === null) {
        console.error('Nom du client invalide');
        alert('Erreur : Votre session semble être corrompue. Veuillez vous reconnecter.');
        localStorage.clear();
        window.location.href = '/login.html';
        return;
    }

    const data = {
        clientName: clientName,
        professionnelName: professionnelName,
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString()
    };
    
    // Changer la couleur du bouton et le désactiver
    const button = event.target;
    button.classList.remove('btn-primary');
    button.classList.add('btn-success');
    button.disabled = true;
    button.textContent = 'Réservé';
    
    console.log('Données de réservation à envoyer:', data);
    socket.emit("nouvelle_reservation", data);
    
    // Rediriger vers la page des rendez-vous après 2 secondes
    setTimeout(() => {
        window.location.href = '/mes_rendez_vous.html';
    }, 2000);
}

// Recevoir la réponse du professionnel
socket.on("maj_rendezvous", (data) => {
    const clientName = localStorage.getItem('username');
    if (data.clientName === clientName) {
        alert(`Votre réservation a été ${data.reponse} par ${data.professionnelName}`);
    }
});

document.addEventListener("DOMContentLoaded", () => {
    // Vérifier si l'utilisateur est connecté
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    
    if (!token || !username) {
        window.location.href = '/login.html';
        return;
    }

    document.querySelector("button").addEventListener("click", rechercherProfessionnel);
});
    // Déconnexion
    document.getElementById('logout').addEventListener('click', () => {
        localStorage.clear();
        window.location.href = '/login.html';
    });
