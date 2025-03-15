document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || 'Login failed');
        }

        // Store token, clientName, and userId in the local storage
        localStorage.setItem('token', result.token);
        localStorage.setItem('username', result.username);
        localStorage.setItem('userId', result.userId);

        const role = result.role;
        if (role === 'admin') {
            window.location.href = '/admin';
        } else if (role === 'client') {
            window.location.href = '/clients';
        } else if (role === 'professionnel') {
            window.location.href = '/professionnel';
        } else {
            window.location.href = '/profile';
        }
    } catch (error) {
        console.error('Error during login:', error);
        alert(error.message || 'Login failed');
    }
});