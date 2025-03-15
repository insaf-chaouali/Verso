document.addEventListener("DOMContentLoaded", function () {
    console.log("✅ DOM entièrement chargé et analysé");
    fetchProfessionnels();

    // Écouteur d'événements pour la recherche
    document.getElementById("searchPro").addEventListener("input", function () {
        const searchValue = this.value.toLowerCase();
        filterProfessionnel(searchValue);
    });
});

// Récupérer la liste des professionnels depuis l'API
function fetchProfessionnels() {
    console.log("🔄 Chargement des professionnels...");
    fetch("/api/professionnels")
    .then(response => response.json())
    .then(data => {
        console.log("✅ Données reçues :", data); // Vérifie le type de données
        if (Array.isArray(data)) {
            displayProfessionnel(data);
        } else {
            console.error("❌ Données inattendues :", data);
        }
    })
    .catch(error => console.error("❌ Erreur lors du chargement des professionnels:", error));
}

// Afficher les professionnels dans le tableau
function displayProfessionnel(professionnels) {
    console.log("🔄 Affichage des professionnels...");
    const tbody = document.getElementById("proTableBody");
    if (!tbody) {
        console.error("❌ Élément avec l'ID 'proTableBody' non trouvé.");
        return;
    }
    tbody.innerHTML = ""; // Réinitialiser le tableau

    professionnels.forEach(professionnel => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${professionnel.username}</td>
            <td>${professionnel.email}</td>
            <td>${professionnel.job}</td>
            <td>${professionnel.cityAddress}</td>
            <td>
                <button class="delete-btn" onclick="deleteProfessionnel('${professionnel._id}')">Supprimer</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Fonction de recherche dynamique
function filterProfessionnel(searchValue) {
    const rows = document.querySelectorAll("#proTableBody tr");

    rows.forEach(row => {
        const name = row.children[0].textContent.toLowerCase();
        const metier = row.children[2].textContent.toLowerCase();
        const address = row.children[3].textContent.toLowerCase();

        if (name.includes(searchValue) || metier.includes(searchValue) || address.includes(searchValue)) {
            row.style.display = "";
        } else {
            row.style.display = "none";
        }
    });
}

// Supprimer un professionnel
function deleteProfessionnel(proId) {
    if (confirm("Voulez-vous vraiment supprimer ce professionnel ?")) {
        fetch(`/api/professionnels/${proId}`, {
            method: "DELETE",
        })
        .then(response => {
            if (response.ok) {
                fetchProfessionnels(); // ✅ Recharger la liste après suppression
            } else {
                console.error("❌ Erreur lors de la suppression du professionnel.");
            }
        })
        .catch(error => console.error("❌ Erreur lors de la suppression:", error));
    }
}