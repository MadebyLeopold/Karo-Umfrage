<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', '0');
ini_set('log_errors', '1');
ini_set('error_log', __DIR__ . '/../logs/error.log');

// CORS headers
header('Access-Control-Allow-Origin: http://localhost');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json');

// Custom error handler
set_exception_handler(function ($e) {
    error_log($e->getMessage() . "\n" . $e->getTraceAsString());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Internal Server Error',
        'error' => $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine()
    ]);
    exit;
});

set_exception_handler(function($exception) {
    global $controller;
    $controller->logError($exception);
});

set_error_handler(function($errno, $errstr, $errfile, $errline) {
    global $controller;
    
    $severity = match($errno) {
        E_ERROR, E_USER_ERROR => 'error',
        E_WARNING, E_USER_WARNING => 'warning',
        E_NOTICE, E_USER_NOTICE => 'notice',
        default => 'info'
    };
    
    $controller->logError(new ErrorException($errstr, 0, $errno, $errfile, $errline), $severity);
});

// Add this near the top of the file
error_log("Requested URI: " . $_SERVER['REQUEST_URI']);
error_log("Request Method: " . $_SERVER['REQUEST_METHOD']);

// Verify files exist before requiring them
$requiredFiles = [
    '../src/Config/Database.php',
    '../src/Controllers/ApiController.php',
    '../src/Controllers/AdminController.php', // Add this line
    '../src/Middleware/AuthMiddleware.php',
    '../src/Middleware/ValidationMiddleware.php',
    '../src/Middleware/RateLimiter.php'
];

foreach ($requiredFiles as $file) {
    if (!file_exists(__DIR__ . '/' . $file)) {
        throw new Exception("Required file not found: $file");
    }
    require_once __DIR__ . '/' . $file;
}

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../src/Config/init.php';

try {
    // Start session if not already started
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }

    // Route handling with better debugging
    $uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    error_log("Incoming request: " . $_SERVER['REQUEST_METHOD'] . " " . $uri);

    // Adjust base path - make it configurable
    $basePath = '/backend/public';
    $uri = preg_replace('#^' . preg_quote($basePath) . '#', '', $uri);
    $method = $_SERVER['REQUEST_METHOD'];

    error_log("Processed URI after base path removal: " . $uri);

    $controller = new ApiController();
    $adminController = new AdminController(); // Add this line

    // Enhanced router with better method handling
    switch (true) {
        case $uri === '/' || $uri === '':
            // Handle root path
            echo json_encode([
                'success' => true,
                'message' => 'Survey API',
                'version' => '1.0',
                'Welcome' => 'Hi there! Nice that you found our API.'
            ]);
            break;

        case $uri === '/api/login' && $method === 'POST':
            $controller->login();
            break;
            
        case $uri === '/api/surveys':
            switch ($method) {
                case 'GET':
                    $controller->getSurveys();
                    break;
                case 'POST':
                    $controller->createSurvey();
                    break;
                default:
                    throw new Exception("Method not allowed for /api/surveys");
            }
            break;
            
        case $uri === '/api/votes' && $method === 'POST':
            $controller->submitVote();
            break;

        case $uri === '/api/admin/login' && $method === 'POST':
            $adminController->login();
            break;

        case $uri === '/api/admin/dashboard/stats':
            if ($method === 'GET') {
                $controller->getDashboardStats();
            }
            break;
        
        case $uri === '/api/admin/activity-log':
            if ($method === 'GET') {
                $controller->getActivityLog();
            }
            break;

        case $uri === '/api/admin/surveys/list' && $method === 'GET':
            header('Content-Type: application/json');
            require_once __DIR__ . '/../src/Controllers/ApiController.php';
            $controller = new ApiController();
            $controller->getSurveys();
            exit;
            
        case $_SERVER['REQUEST_METHOD'] === 'POST' && $uri === '/api/admin/surveys':
            header('Content-Type: application/json');
            require_once __DIR__ . '/../src/Controllers/ApiController.php';
            $controller = new ApiController();
            $controller->createSurvey();
            exit;

        case $_SERVER['REQUEST_METHOD'] === 'PUT' && preg_match('/^\/api\/admin\/surveys\/(\d+)\/status$/', $uri, $matches):
            header('Content-Type: application/json');
            $surveyId = $matches[1];
            
            // Get PUT data
            $putData = json_decode(file_get_contents('php://input'), true);
            $status = $putData['status'] ?? null;
            
            if (!$status) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'message' => 'Status parameter is required'
                ]);
                exit;
            }
            
            require_once __DIR__ . '/../src/Controllers/ApiController.php';
            $controller = new ApiController();
            $controller->updateSurveyStatus($surveyId, $status);
            exit;

        case $_SERVER['REQUEST_METHOD'] === 'DELETE' && preg_match('/^\/api\/admin\/surveys\/(\d+)$/', $uri, $matches):
            header('Content-Type: application/json');
            $surveyId = $matches[1];
            require_once __DIR__ . '/../src/Controllers/ApiController.php';
            $controller = new ApiController();
            $controller->deleteSurvey($surveyId);
            exit;

        case preg_match('/^\/api\/admin\/logs$/', $uri) && $_SERVER['REQUEST_METHOD'] === 'GET':
            header('Content-Type: application/json');
            $controller = new ApiController();
            $params = [
                'page' => $_GET['page'] ?? 1,
                'source' => $_GET['source'] ?? 'activity',
                'type' => $_GET['type'] ?? null,
                'date' => $_GET['date'] ?? null,
                'severity' => $_GET['severity'] ?? null,
                'logFile' => $_GET['logFile'] ?? null
            ];
            $controller->getLogs($params);
            exit;

        // Add this to your route handling section
        case $_SERVER['REQUEST_METHOD'] === 'POST' && preg_match('/^\/api\/surveys\/(\d+)\/vote$/', $uri, $matches):
            header('Content-Type: application/json');
            $surveyId = $matches[1];
            require_once __DIR__ . '/../src/Controllers/ApiController.php';
            $controller = new ApiController();
            $controller->submitVote($surveyId);
            exit;

        // Add this to your route handling section
        case $_SERVER['REQUEST_METHOD'] === 'GET' && $uri === '/api/surveys':
            header('Content-Type: application/json');
            require_once __DIR__ . '/../src/Controllers/ApiController.php';
            $controller = new ApiController();
            $controller->getActiveSurveys();
            exit;

        // Add this route to your existing routes
        case $_SERVER['REQUEST_METHOD'] === 'GET' && preg_match('/^\/api\/surveys\/(\d+)$/', $uri, $matches):
            header('Content-Type: application/json');
            $surveyId = $matches[1];
            require_once __DIR__ . '/../src/Controllers/ApiController.php';
            $controller = new ApiController();
            $controller->getSurveyById($surveyId);
            exit;

        // Add this route with your other routes
        case $_SERVER['REQUEST_METHOD'] === 'POST' && $uri === '/api/surveys/student':
            header('Content-Type: application/json');
            require_once __DIR__ . '/../src/Controllers/ApiController.php';
            $controller = new ApiController();
            $controller->createStudentSurvey();
            exit;

        default:
            error_log("No route found for URI: " . $uri);
            http_response_code(404);
            echo json_encode([
                'success' => false, 
                'message' => 'Not found',
                'requested_uri' => $uri,
                'method' => $method
            ]);
            break;
    }
} catch (Exception $e) {
    error_log("Error processing request: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Internal Server Error',
        'error' => $e->getMessage()
    ]);
}