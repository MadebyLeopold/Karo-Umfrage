<?php
class LogModel {
    private $db;

    public function __construct($db) {
        $this->db = $db;
    }

    public function logLogin($userType, $ipAddress, $status) {
        $stmt = $this->db->prepare("
            INSERT INTO login_logs (user_type, ip_address, status) 
            VALUES (:type, :ip, :status)
        ");
        
        return $stmt->execute([
            'type' => $userType,
            'ip' => $ipAddress,
            'status' => $status
        ]);
    }

    public function logRequest($ipAddress) {
        $stmt = $this->db->prepare("
            INSERT INTO request_logs (ip_address) 
            VALUES (:ip)
        ");
        
        return $stmt->execute(['ip' => $ipAddress]);
    }

    public function cleanOldLogs($days = 30) {
        $stmt = $this->db->prepare("
            DELETE FROM login_logs 
            WHERE timestamp < DATE_SUB(NOW(), INTERVAL :days DAY)
        ");
        $stmt->execute(['days' => $days]);

        $stmt = $this->db->prepare("
            DELETE FROM request_logs 
            WHERE timestamp < DATE_SUB(NOW(), INTERVAL 1 DAY)
        ");
        $stmt->execute();
    }
}
