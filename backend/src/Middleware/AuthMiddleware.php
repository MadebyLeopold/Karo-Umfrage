<?php
class AuthMiddleware {
    private $db;
    private $rateLimiter;

    public function __construct($db) {
        $this->db = $db;
        $this->rateLimiter = new RateLimiter($db);
    }

    public function validateRequest() {
        session_start();
        
        // Check if user is logged in
        if (!isset($_SESSION['user_type'])) {
            $this->sendUnauthorizedResponse();
            return false;
        }

        // Check rate limiting
        if (!$this->rateLimiter->checkLimit($_SERVER['REMOTE_ADDR'])) {
            $this->sendTooManyRequestsResponse();
            return false;
        }

        return true;
    }

    public function validateAdminRequest() {
        session_start();
        
        if (!isset($_SESSION['admin_id'])) {
            $this->sendUnauthorizedResponse();
            return false;
        }

        return true;
    }

    private function sendUnauthorizedResponse() {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized']);
        exit;
    }

    private function sendTooManyRequestsResponse() {
        http_response_code(429);
        echo json_encode(['error' => 'Too many requests']);
        exit;
    }

    public function authenticate($userType, $password) {
        try {
            // Validate input
            if (!in_array($userType, ['student', 'teacher'])) {
                throw new Exception('Invalid user type');
            }

            // Check rate limiting
            $ip = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
            if (!$this->rateLimiter->checkLimit($ip, 'login')) {
                throw new Exception('Too many login attempts');
            }

            // Query user
            $stmt = $this->db->prepare('SELECT id, password_hash FROM users WHERE user_type = ?');
            $stmt->execute([$userType]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$user) {
                error_log("User not found: $userType");
                return false;
            }

            // Verify password
            if (!password_verify($password, $user['password_hash'])) {
                error_log("Invalid password for user type: $userType");
                return false;
            }

            // Start session and store user data
            if (session_status() === PHP_SESSION_NONE) {
                session_start();
            }
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['user_type'] = $userType;

            return $user['id'];
        } catch (PDOException $e) {
            error_log("Database error during authentication: " . $e->getMessage());
            throw new Exception("Authentication failed");
        }
    }

    public function verifySession() {
        if (!isset($_SESSION['user_id'])) {
            throw new Exception("Unauthorized");
        }
        return $_SESSION['user_id'];
    }

    public function logout() {
        session_destroy();
    }
}
