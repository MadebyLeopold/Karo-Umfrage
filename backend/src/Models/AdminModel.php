<?php
class AdminModel {
    private $db;

    public function __construct($db) {
        $this->db = $db;
    }

    public function verifyAdmin($username, $password) {
        $stmt = $this->db->prepare("
            SELECT id, password 
            FROM admins 
            WHERE username = :username
        ");
        
        $stmt->execute(['username' => $username]);
        $admin = $stmt->fetch();

        if ($admin && password_verify($password, $admin['password'])) {
            return $admin;
        }
        return false;
    }

    public function getStatistics() {
        $stats = [];

        // Total surveys
        $stmt = $this->db->query("
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
                SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed
            FROM surveys
        ");
        $stats['surveys'] = $stmt->fetch();

        // Total votes
        $stmt = $this->db->query("
            SELECT COUNT(*) as total_votes 
            FROM responses
        ");
        $stats['votes'] = $stmt->fetch();

        // User participation
        $stmt = $this->db->query("
            SELECT 
                COUNT(DISTINCT session_id) as unique_voters,
                COUNT(DISTINCT survey_id) as voted_surveys
            FROM responses
        ");
        $stats['participation'] = $stmt->fetch();

        return $stats;
    }

    public function updateAccessCodes($studentPass, $teacherPass) {
        try {
            $this->db->beginTransaction();

            $stmt = $this->db->prepare("
                UPDATE access_codes 
                SET password_hash = :hash 
                WHERE user_type = :type
            ");

            $stmt->execute([
                'hash' => password_hash($studentPass, PASSWORD_DEFAULT),
                'type' => 'student'
            ]);

            $stmt->execute([
                'hash' => password_hash($teacherPass, PASSWORD_DEFAULT),
                'type' => 'teacher'
            ]);

            $this->db->commit();
            return true;
        } catch (Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }

    public function getLoginLogs($limit = 100) {
        $stmt = $this->db->prepare("
            SELECT * FROM login_logs 
            ORDER BY timestamp DESC 
            LIMIT :limit
        ");
        
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll();
    }
}
