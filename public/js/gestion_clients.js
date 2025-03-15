document.addEventListener("DOMContentLoaded", function () {
    console.log("✅ DOM entièrement chargé et analysé");
    fetchClients();

    // Ajout d'un écouteur d'événements pour la recherche
    document.getElementById("searchClient").addEventListener("input", function () {
        const searchValue = this.value.toLowerCase();
        filterClients(searchValue);
    });
});

// 1. Récupérer la liste des clients depuis l'API
function fetchClients() {
    fetch("/api/clients")
        .then(response => response.json())
        .then(data => {
            console.log("📌 Clients récupérés :", data); // Vérification des données reçues
            displayClients(data);
        })
        .catch(error => console.error("❌ Erreur lors du chargement des clients:", error));
}

// 2. Afficher les clients dans le tableau
function displayClients(clients) {
    const tbody = document.getElementById("clientTableBody");
    tbody.innerHTML = ""; // Réinitialiser le tableau

    clients.forEach(client => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${client.username || "Non défini"}</td>
            <td>${client.email || "Non défini"}</td>
            <td>${client.cityAddress || "Non défini"}</td>
            <td>
                <button class="delete-btn" onclick="deleteClient('${client._id}')">Supprimer</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// 3. Fonction de recherche dynamique
function filterClients(searchValue) {
    const rows = document.querySelectorAll("#clientTableBody tr");

    rows.forEach(row => {
        const name = row.children[0].textContent.toLowerCase();
        const address = row.children[2].textContent.toLowerCase();

        if (name.includes(searchValue) || address.includes(searchValue)) {
            row.style.display = "";
        } else {
            row.style.display = "none";
        }
    });
}

// 4. Supprimer un client
function deleteClient(clientId) {
    if (confirm("Voulez-vous vraiment supprimer ce client ?")) {
        fetch(`/api/clients/${clientId}`, {
            method: "DELETE",
        })
        .then(response => {
            if (response.ok) {
                fetchClients(); // Recharger la liste après suppression
            } else {
                console.error("❌ Erreur lors de la suppression du client.");
            }
        })
        .catch(error => console.error("❌ Erreur lors de la suppression:", error));
    }
}
