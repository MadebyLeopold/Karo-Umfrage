document.addEventListener('DOMContentLoaded', () => {
    const adminLoginForm = document.getElementById('adminLoginForm');
    const errorMessage = document.getElementById('errorMessage');

    // Check if already logged in
    if (sessionStorage.getItem('isAdmin') === 'true') {
        window.location.href = '/admin/dashboard.html';
        return;
    }

    if (!adminLoginForm || !errorMessage) {
        console.error('Required elements not found');
        return;
    }

    adminLoginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        try {
            const result = await api.adminLogin(username, password);
            if (result.success) {
                sessionStorage.setItem('isAdmin', 'true');
                sessionStorage.setItem('adminUsername', username);
                window.location.href = '/admin/dashboard.html';
            } else {
                errorMessage.textContent = result.error || 'Login fehlgeschlagen';
                errorMessage.classList.add('visible');
            }
        } catch (error) {
            console.error('Admin login error:', error);
            errorMessage.textContent = error.message || 'Ein Fehler ist aufgetreten';
            errorMessage.classList.add('visible');
        }
    });

    // Clear error message when input changes
    document.querySelectorAll('input').forEach(element => {
        element.addEventListener('input', () => {
            errorMessage.classList.remove('visible');
        });
    });
});