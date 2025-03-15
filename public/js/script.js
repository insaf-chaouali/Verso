function toggleJobField() {
    console.log('toggleJobField called');
    const roleElement = document.getElementById('role');
    const jobField = document.getElementById('jobField');

    if (roleElement && jobField) {
        const role = roleElement.value;
        console.log('Role:', role);
        if (role === 'professionnel') {
            jobField.classList.remove('d-none'); // Afficher le champ
        } else {
            jobField.classList.add('d-none'); // Cacher le champ
        }
    } else {
        console.error('Role or jobField element not found');
    }
}

// Exécuter la fonction une fois la page chargée pour vérifier la valeur initiale
document.addEventListener('DOMContentLoaded', () => {
    const roleElement = document.getElementById('role');
    if (roleElement) {
        roleElement.addEventListener('change', toggleJobField);
        toggleJobField(); // Vérifier la valeur au chargement
    } else {
        console.error('Role element not found');
    }
});