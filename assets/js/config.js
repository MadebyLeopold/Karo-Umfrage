const CONFIG = {
    API_BASE_URL: 'http://localhost/backend/public/',
    API_ENDPOINTS: {
        LOGIN: '/api/auth/login',
        LOGOUT: '/api/auth/logout',  // Add this line
        ADMIN_LOGIN: '/api/admin/login',
        SURVEYS: '/api/surveys',
        VOTES: '/api/votes',
        ADMIN_SURVEYS: '/api/admin/surveys',
        ADMIN_RESULTS: '/api/admin/results'
    },
    REFRESH_INTERVAL: 30000, // 30 Sekunden
    MAX_RETRIES: 3
};

// Prevent configuration changes
Object.freeze(CONFIG);
