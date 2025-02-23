<?php

class RateLimiter {
    private $db;
    private $config;

    public function __construct($db) {
        $this->db = $db;
        $this->config = require __DIR__ . '/../Config/config.php';

        // Create rate_limits table if it doesn't exist
        $this->createTable();
    }

    private function createTable() {
        $sql = "CREATE TABLE IF NOT EXISTS rate_limits (
            id INT AUTO_INCREMENT PRIMARY KEY,
            ip VARCHAR(45) NOT NULL,
            action VARCHAR(32) NOT NULL,
            timestamp INT NOT NULL,
            INDEX idx_ip_action (ip, action),
            INDEX idx_timestamp (timestamp)
        )";
        
        try {
            $this->db->exec($sql);
        } catch (PDOException $e) {
            error_log("Failed to create rate_limits table: " . $e->getMessage());
        }
    }

    public function checkLimit($ip, $action = 'login') {
        try {
            // Clean up old entries
            $this->cleanup();
            
            // Count recent attempts
            $stmt = $this->db->prepare(
                'SELECT COUNT(*) as attempts FROM rate_limits 
                WHERE ip = ? AND action = ? AND timestamp > ?'
            );
            
            $window = $this->config['rate_limit']['window'] ?? 900; // Default 15 minutes
            $stmt->execute([$ip, $action, time() - $window]);
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            
            $maxAttempts = $this->config['rate_limit']['max_attempts'] ?? 5;
            if ($result['attempts'] >= $maxAttempts) {
                throw new Exception('Too many attempts. Please try again later.');
            }

            // Log this attempt
            $stmt = $this->db->prepare(
                'INSERT INTO rate_limits (ip, action, timestamp) VALUES (?, ?, ?)'
            );
            $stmt->execute([$ip, $action, time()]);

            return true;
        } catch (PDOException $e) {
            error_log("Rate limiter error: " . $e->getMessage());
            throw new Exception("Rate limiting failed");
        }
    }

    private function cleanup() {
        try {
            $window = $this->config['rate_limit']['window'] ?? 900;
            $stmt = $this->db->prepare('DELETE FROM rate_limits WHERE timestamp <= ?');
            $stmt->execute([time() - $window]);
        } catch (PDOException $e) {
            error_log("Rate limiter cleanup error: " . $e->getMessage());
        }
    }
}