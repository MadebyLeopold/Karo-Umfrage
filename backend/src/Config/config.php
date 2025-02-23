<?php
return [
    'host' => 'localhost',  // Remove https:// prefix
    'dbname' => 'school_surveys.sql',
    'username' => 'root',
    'password' => '',
    'charset' => 'utf8mb4',
    
    // Additional configuration options
    'jwt_secret' => 'your-secret-key-here',
    'password_pepper' => 'your-pepper-here',
    'session_lifetime' => 3600,
    
    // Rate limiting
    'rate_limit' => [
        'max_attempts' => 20,
        'window' => 100
    ],
    
    // CORS settings
    'allowed_origins' => [
        'http://localhost',
        'http://your-production-domain.com'
    ]
];
