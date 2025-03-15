document.addEventListener("DOMContentLoaded", async () => {
    console.log('Initialisation du dashboard...');
    
    // Vérification de Chart.js
    if (typeof Chart === 'undefined') {
        console.error('Chart.js n\'est pas chargé !');
        return;
    }
    console.log('Chart.js est bien chargé');

    try {
        console.log('Chargement des statistiques...');
        const response = await fetch('/api/stats');
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Erreur HTTP ${response.status}: ${errorData.message || 'Erreur inconnue'}`);
        }

        const stats = await response.json();
        console.log('Statistiques reçues:', stats);

        if (!stats || typeof stats !== 'object') {
            throw new Error('Format de données invalide');
        }

        // Vérification et initialisation des valeurs par défaut
        const safeStats = {
            clients: Number(stats.clients) || 0,
            professionnels: Number(stats.professionnels) || 0,
            reservations: {
                total: Number(stats.reservations?.total) || 0,
                en_attente: Number(stats.reservations?.en_attente) || 0,
                acceptees: Number(stats.reservations?.acceptees) || 0,
                refusees: Number(stats.reservations?.refusees) || 0
            },
            clientStats: Array.isArray(stats.clientStats) ? stats.clientStats : [0, 0, 0, 0, 0, 0, 0]
        };

        console.log('Statistiques sécurisées:', safeStats);

        // Mise à jour des compteurs
        const elements = {
            clientCount: document.getElementById('clientCount'),
            proCount: document.getElementById('proCount'),
            reservationCount: document.getElementById('reservationCount')
        };

        // Vérification de l'existence des éléments
        Object.entries(elements).forEach(([key, element]) => {
            if (!element) {
                console.error(`Élément ${key} non trouvé dans le DOM`);
            }
        });

        if (elements.clientCount) elements.clientCount.textContent = safeStats.clients;
        if (elements.proCount) elements.proCount.textContent = safeStats.professionnels;
        if (elements.reservationCount) elements.reservationCount.textContent = safeStats.reservations.total;

        // Ajout des statistiques détaillées des réservations
        if (elements.reservationCount?.parentElement) {
            const reservationDetails = document.createElement('div');
            reservationDetails.className = 'mt-3';
            reservationDetails.innerHTML = `
                <div class="alert alert-info">
                    <h6 class="mb-2">Détails des réservations :</h6>
                    <div class="d-flex justify-content-around">
                        <span class="badge bg-warning">En attente : ${safeStats.reservations.en_attente}</span>
                        <span class="badge bg-success">Acceptées : ${safeStats.reservations.acceptees}</span>
                        <span class="badge bg-danger">Refusées : ${safeStats.reservations.refusees}</span>
                    </div>
                </div>
            `;
            elements.reservationCount.parentElement.appendChild(reservationDetails);
        }

        // Mise à jour des graphiques avec délai pour assurer le rendu DOM
        setTimeout(() => {
            console.log('Rendu des graphiques...');
            renderDoughnutChart(safeStats);
            renderLineChart(safeStats);
        }, 100);

    } catch (error) {
        console.error('Erreur lors du chargement des statistiques:', error);
        const container = document.querySelector('.container');
        if (container) {
            container.innerHTML += `
                <div class="alert alert-danger mt-3">
                    <h5>Erreur lors du chargement des statistiques</h5>
                    <p>${error.message}</p>
                    <small class="text-muted">Consultez la console pour plus de détails.</small>
                </div>
            `;
        }
    }
});

// Graphique en anneau (Doughnut)
function renderDoughnutChart(data) {
    console.log('Rendu du graphique en anneau...');
    const canvas = document.getElementById("doughnutChart");
    if (!canvas) {
        console.error('Canvas doughnutChart non trouvé');
        return;
    }

    // Définir explicitement les dimensions du canvas
    canvas.style.width = '100%';
    canvas.style.height = '100%';

    const ctx = canvas.getContext("2d");
    if (!ctx) {
        console.error('Contexte 2D non disponible');
        return;
    }

    // Destruction du graphique existant s'il y en a un
    if (window.doughnutChart instanceof Chart) {
        window.doughnutChart.destroy();
    }

    console.log('Création du graphique en anneau avec les données:', data);
    window.doughnutChart = new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: ["Clients", "Professionnels", "Réservations"],
            datasets: [{
                data: [data.clients, data.professionnels, data.reservations.total],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.8)',
                    'rgba(54, 162, 235, 0.8)',
                    'rgba(255, 205, 86, 0.8)'
                ],
                borderColor: [
                    'rgb(255, 99, 132)',
                    'rgb(54, 162, 235)',
                    'rgb(255, 205, 86)'
                ],
                borderWidth: 1,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        padding: 20,
                        font: {
                            size: 14
                        }
                    }
                },
                title: {
                    display: true,
                    text: 'Répartition des utilisateurs et réservations',
                    padding: {
                        top: 10,
                        bottom: 30
                    },
                    font: {
                        size: 16,
                        weight: 'bold'
                    }
                }
            }
        }
    });
}

// Graphique en ligne (Line)
function renderLineChart(data) {
    console.log('Rendu du graphique en ligne...');
    const canvas = document.getElementById("lineChart");
    if (!canvas) {
        console.error('Canvas lineChart non trouvé');
        return;
    }

    // Définir explicitement les dimensions du canvas
    canvas.style.width = '100%';
    canvas.style.height = '100%';

    const ctx = canvas.getContext("2d");
    if (!ctx) {
        console.error('Contexte 2D non disponible');
        return;
    }

    // Destruction du graphique existant s'il y en a un
    if (window.lineChart instanceof Chart) {
        window.lineChart.destroy();
    }

    // Création des données pour l'évolution sur 7 mois
    const currentDate = new Date();
    const labels = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date(currentDate);
        date.setMonth(currentDate.getMonth() - i);
        labels.push(date.toLocaleString('fr-FR', { month: 'short' }));
    }

    console.log('Création du graphique en ligne avec les données:', data);
    window.lineChart = new Chart(ctx, {
        type: "line",
        data: {
            labels: labels,
            datasets: [{
                label: "Évolution des Clients",
                data: data.clientStats || [0, 0, 0, 0, 0, 0, 0],
                fill: true,
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                tension: 0.3,
                borderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6,
                pointBackgroundColor: 'rgb(75, 192, 192)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgb(75, 192, 192)'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        padding: 20,
                        font: {
                            size: 14
                        }
                    }
                },
                title: {
                    display: true,
                    text: 'Évolution du nombre de clients',
                    padding: {
                        top: 10,
                        bottom: 30
                    },
                    font: {
                        size: 16,
                        weight: 'bold'
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        drawBorder: false,
                        color: 'rgba(0, 0, 0, 0.1)'
                    },
                    ticks: {
                        font: {
                            size: 12
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        font: {
                            size: 12
                        }
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            }
        }
    });
}

// Gestion de la déconnexion
document.getElementById('logout').addEventListener('click', () => {
    localStorage.clear();
    window.location.href = '/login.html';
});