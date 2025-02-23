<?php

class AdminController {
    private $db;
    private $auth;

    public function __construct() {
        try {
            $database = Database::getInstance();
            $this->db = $database->getConnection();
            $this->auth = new AuthMiddleware($this->db);
        } catch (Exception $e) {
            error_log("AdminController initialization error: " . $e->getMessage());
            throw new Exception("Failed to initialize admin controller");
        }
    }

    public function login() {
        try {
            $data = json_decode(file_get_contents('php://input'), true);

            if (!$data || !isset($data['username']) || !isset($data['password'])) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'error' => 'Missing required fields'
                ]);
                return;
            }

            // Verify admin credentials
            $stmt = $this->db->prepare('SELECT id, password_hash FROM admins WHERE username = ?');
            $stmt->execute([$data['username']]);
            $admin = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$admin || !password_verify($data['password'], $admin['password_hash'])) {
                http_response_code(401);
                echo json_encode([
                    'success' => false,
                    'error' => 'Invalid credentials'
                ]);
                return;
            }

            // Start session
            if (session_status() === PHP_SESSION_NONE) {
                session_start();
            }

            $_SESSION['admin_id'] = $admin['id'];
            $_SESSION['is_admin'] = true;

            echo json_encode([
                'success' => true,
                'message' => 'Login successful'
            ]);
        } catch (Exception $e) {
            error_log("Admin login error: " . $e->getMessage());
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => 'Login failed'
            ]);
        }
    }
}