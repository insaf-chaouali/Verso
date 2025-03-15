  // Script pour l'effet de scroll sur la navbar
  window.addEventListener('scroll', function() {
    if (window.scrollY > 50) {
        document.querySelector('.navbar').classList.add('scrolled');
    } else {
        document.querySelector('.navbar').classList.remove('scrolled');
    }
});

// Script pour afficher le formulaire d'édition de profil
document.getElementById('editProfileBtn').addEventListener('click', function() {
    document.querySelector('.profile-container').style.display = 'none';
    document.querySelector('.edit-profile-container').style.display = 'block';
});

// Script pour annuler l'édition de profil
document.getElementById('cancelEditBtn').addEventListener('click', function() {
    document.querySelector('.profile-container').style.display = 'block';
    document.querySelector('.edit-profile-container').style.display = 'none';
});

// Script pour soumettre le formulaire d'édition de profil
document.getElementById('editProfileForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const username = document.getElementById('editUsername').value;
    const email = document.getElementById('editEmail').value;
    const city = document.getElementById('editCity').value;
    const status = document.getElementById('editStatus').value;
    const cityAddress = document.getElementById('editCityAddress').value;
    const job = document.getElementById('editJob').value;
    const dateOfBirth = document.getElementById('editDateOfBirth').value;
    const token = localStorage.getItem('token');

    try {
        const response = await fetch('/auth/update', {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, email, city, status, cityAddress, job, dateOfBirth })
        });

        if (!response.ok) throw new Error('Erreur de mise à jour');

        const result = await response.json();

        // Mettez à jour les informations affichées
        document.getElementById('username').innerText = username;
        document.getElementById('email').innerText = email;
        document.getElementById('city').innerText = city;
        document.getElementById('status').innerText = status;
        document.getElementById('cityAddress').innerText = cityAddress;
        document.getElementById('job').innerText = job;
        document.getElementById('dateOfBirth').innerText = dateOfBirth;

        // Cachez le formulaire d'édition et affichez les détails du profil
        document.querySelector('.profile-container').style.display = 'block';
        document.querySelector('.edit-profile-container').style.display = 'none';
    } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors de la mise à jour du profil');
    }
});

document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
        window.location.href = '/login.html';
        return;
    }

    try {
        const response = await fetch('/auth/me', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Erreur de chargement');
        
        const user = await response.json();
        
        // Remplissage des données
        document.getElementById('username').textContent = user.username;
        document.getElementById('email').textContent = user.email;
        document.getElementById('city').textContent = user.city;
        document.getElementById('dateOfBirth').textContent = user.dateOfBirth;
        document.getElementById('status').textContent = user.status;
        document.getElementById('cityAddress').textContent = user.cityAddress;
        document.getElementById('job').textContent = user.job;

        // Pré-remplir le formulaire d'édition
        document.getElementById('editUsername').value = user.username;
        document.getElementById('editEmail').value = user.email;
        document.getElementById('editCity').value = user.city;
        document.getElementById('editStatus').value = user.status;
        document.getElementById('editCityAddress').value = user.cityAddress;
        document.getElementById('editJob').value = user.job;
        document.getElementById('editDateOfBirth').value = user.dateOfBirth;
    } catch (error) {
        console.error('Erreur:', error);
        window.location.href = '/login.html';
    }
});