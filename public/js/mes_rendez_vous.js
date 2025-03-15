document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    
    if (!token || !username) {
        window.location.href = '/login.html';
        return;
    }

    // Charger les rendez-vous existants
    await loadRendezVous();

    // Connexion Socket.io
    const socket = io();

    // Écouter les mises à jour des rendez-vous
    socket.on('maj_rendezvous', (data) => {
        if (data.clientName === username) {
            // Mettre à jour le statut dans le tableau
            const rows = document.querySelectorAll('#rendezVousTableBody tr');
            rows.forEach(row => {
                if (row.dataset.professionnel === data.professionnelName) {
                    const statutCell = row.querySelector('.statut');
                    statutCell.textContent = data.reponse;
                    statutCell.className = `statut ${data.reponse === 'accepté' ? 'text-success' : 'text-danger'}`;
                    
                    // Afficher une notification
                    showNotification(data.professionnelName, data.reponse);
                }
            });
        }
    });

    // Écouter les nouvelles réservations
    socket.on('nouvelle_reservation', (data) => {
        if (data.clientName === username) {
            addRendezVousToTable(data);
        }
    });

    // Gérer la déconnexion
    document.getElementById('logout').addEventListener('click', () => {
        localStorage.clear();
        window.location.href = '/login.html';
    });
});

async function loadRendezVous() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/mes-rendez-vous', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error('Erreur lors du chargement des rendez-vous');

        const rendezVous = await response.json();
        const tableBody = document.getElementById('rendezVousTableBody');
        tableBody.innerHTML = '';

        rendezVous.forEach(rdv => {
            addRendezVousToTable(rdv);
        });
    } catch (error) {
        console.error('Erreur:', error);
    }
}

function addRendezVousToTable(rdv) {
    const tableBody = document.getElementById('rendezVousTableBody');
    const row = document.createElement('tr');
    row.dataset.professionnel = rdv.professionnelName;
    
    const statutClass = getStatutClass(rdv.status || 'en_attente');
    
    row.innerHTML = `
        <td>${rdv.professionnelName}</td>
        <td>${rdv.date}</td>
        <td>${rdv.time}</td>
        <td class="statut ${statutClass}">${rdv.status || 'en_attente'}</td>
    `;
    
    tableBody.appendChild(row);
}

function getStatutClass(statut) {
    switch(statut) {
        case 'accepté':
            return 'text-success';
        case 'refusé':
            return 'text-danger';
        default:
            return 'text-warning';
    }
}

function showNotification(professionnelName, reponse) {
    const notification = document.createElement('div');
    notification.className = `alert alert-${reponse === 'accepté' ? 'success' : 'danger'} position-fixed top-0 end-0 m-3`;
    notification.style.zIndex = '1000';
    notification.innerHTML = `
        <strong>${professionnelName}</strong> a ${reponse} votre rendez-vous
    `;
    
    document.body.appendChild(notification);
    
    // Supprimer la notification après 5 secondes
    setTimeout(() => {
        notification.remove();
    }, 5000);
} 