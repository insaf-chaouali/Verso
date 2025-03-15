function toggleJobField() {
    const role = document.getElementById('role').value;
    const jobField = document.getElementById('jobField');
    if (role === 'professionnel') {
        jobField.classList.remove('d-none');
    } else {
        jobField.classList.add('d-none');
    }
}

document.getElementById('signupForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    console.log('Formulaire soumis');

    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const role = document.getElementById('role').value;
    const job = role === 'professionnel' ? document.getElementById('job').value : null;
    const dateOfBirth = document.getElementById('dateOfBirth').value;
    const status = document.getElementById('status').value;
    const cityAddress = document.getElementById('cityAddress').value;

    const errorMessageElement = document.getElementById('error-message');
    errorMessageElement.innerText = ''; // Réinitialiser le message d'erreur

    try {
        const response = await fetch('/auth/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, email, password, role, job, dateOfBirth, status, cityAddress })
        });

        //const result = await response.json(); // Récupérer la réponse JSON/
        console.log(response.ok)
        if (response.ok) {
            window.location.href = '/login';
        } else {
            errorMessageElement.innerText = result.message || 'Échec de l’inscription. Veuillez vérifier vos informations.';
        }
    } catch (error) {
        console.error('Erreur lors de l’inscription:', error);
        errorMessageElement.innerText = 'Erreur serveur, veuillez réessayer plus tard.';
    }
});
