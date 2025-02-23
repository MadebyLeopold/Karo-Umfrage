document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');

    if (!loginForm || !errorMessage) {
        console.error('Required elements not found');
        return;
    }

    async function handleLogin(event) {
        event.preventDefault();
        
        const userType = document.getElementById('userType').value;
        const password = document.getElementById('password').value;

        try {
            const result = await api.login(userType, password);
            if (result.success) {
                sessionStorage.setItem('userType', userType);
                window.location.href = `../${userType}/surveys.html`; // Redirect to serveys page
            } else {
                errorMessage.textContent = result.error || 'Login fehlgeschlagen';
                errorMessage.classList.add('visible');
            }
        } catch (error) {
            console.error('Login error:', error);
            errorMessage.textContent = error.message || 'Ein Fehler ist aufgetreten';
            errorMessage.classList.add('visible');
        }
    }

    loginForm.addEventListener('submit', handleLogin);

    // Clear error message when input changes
    document.querySelectorAll('input, select').forEach(element => {
        element.addEventListener('input', () => {
            errorMessage.classList.remove('visible');
        });
    });

    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.body.setAttribute('data-theme', 'dark');
    } else {
        document.body.setAttribute('data-theme', 'light');
    }
});
