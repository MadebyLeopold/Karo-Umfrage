/* filepath: /c:/Users/Admin/Documents/GitHub/Umfrage-Seite/assets/js/dark-mode.js */
function toggleDarkMode() {
    const htmlElement = document.documentElement;
    const isDark = htmlElement.classList.contains('dark-mode');
    
    // Toggle classes and data-theme
    if (isDark) {
        htmlElement.classList.remove('dark-mode');
        htmlElement.setAttribute('data-theme', 'light');
    } else {
        htmlElement.classList.add('dark-mode');
        htmlElement.setAttribute('data-theme', 'dark');
    }
    
    // Update theme toggle button icon
    const themeToggleIcon = document.querySelector('.theme-toggle-btn i');
    if (themeToggleIcon) {
        themeToggleIcon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
        themeToggleIcon.style.color = isDark ? '#FDB813' : '#FDB813';
    }

    // Save theme preference
    localStorage.setItem('theme', isDark ? 'light' : 'dark');
}

// Initialize theme on page load
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    const htmlElement = document.documentElement;
    
    // Set initial theme
    if (savedTheme === 'dark') {
        htmlElement.classList.add('dark-mode');
        htmlElement.setAttribute('data-theme', 'dark');
    } else {
        htmlElement.classList.remove('dark-mode');
        htmlElement.setAttribute('data-theme', 'light');
    }
    
    // Set initial icon
    const themeToggleIcon = document.querySelector('.theme-toggle-btn i');
    if (themeToggleIcon) {
        themeToggleIcon.className = savedTheme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
        themeToggleIcon.style.color = '#FDB813';
    }

    // Initialize logout button icon
    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn && !logoutBtn.querySelector('i')) {
        const icon = document.createElement('i');
        icon.className = 'fas fa-sign-out-alt';
        logoutBtn.insertBefore(icon, logoutBtn.firstChild);
    }
});