<?php
class UserModel {
    private $db;
    
    public function __construct($db) {
        $this->db = $db;
    }
    
    public function validateUser($userType, $password) {
        $stmt = $this->db->prepare("SELECT password_hash FROM access_codes WHERE user_type = ?");
        $stmt->execute([$userType]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        return $result && password_verify($password, $result['password_hash']);
    }
}
