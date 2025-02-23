function logout() {
    // Clear session storage
    sessionStorage.clear();

    // Remove any session cookies
    document.cookie.split(";").forEach(function(cookie) {
        document.cookie = cookie
            .replace(/^ +/, "")
            .replace(/=.*/, "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/");
    });

    // Make an API call to destroy the server-side session
    fetch(`${CONFIG.API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include'
    }).finally(() => {
        // Redirect to login page
        window.location.href = '../../login.html';
    });
}

// Add event listener for any logout buttons
document.addEventListener('DOMContentLoaded', () => {
    const logoutButtons = document.querySelectorAll('.logout-btn');
    logoutButtons.forEach(button => {
        button.addEventListener('click', logout);
    });
});