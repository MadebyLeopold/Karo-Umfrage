<?php
class SurveyModel {
    private $db;

    public function __construct($db) {
        $this->db = $db;
    }

    public function getActiveSurveys($userType) {
        $stmt = $this->db->prepare("
            SELECT * FROM surveys 
            WHERE status = 'active' 
            AND (user_type = :user_type OR user_type = 'all')
            ORDER BY created_at DESC
        ");
        $stmt->execute(['user_type' => $userType]);
        return $stmt->fetchAll();
    }

    public function createSurvey($title, $question, $userType) {
        $stmt = $this->db->prepare("
            INSERT INTO surveys (title, question_text, user_type, status) 
            VALUES (:title, :question, :user_type, 'pending')
        ");
        
        $stmt->execute([
            'title' => $title,
            'question' => $question,
            'user_type' => $userType
        ]);

        return $this->db->lastInsertId();
    }

    public function updateStatus($id, $status) {
        $stmt = $this->db->prepare("
            UPDATE surveys 
            SET status = :status 
            WHERE id = :id
        ");
        
        return $stmt->execute([
            'id' => $id,
            'status' => $status
        ]);
    }

    public function deleteSurvey($id) {
        $stmt = $this->db->prepare("
            DELETE FROM surveys 
            WHERE id = :id
        ");
        
        return $stmt->execute(['id' => $id]);
    }

    public function getAllSurveys() {
        $stmt = $this->db->prepare("
            SELECT 
                s.*, 
                COUNT(r.id) as total_votes,
                SUM(CASE WHEN r.answer = 1 THEN 1 ELSE 0 END) as yes_votes
            FROM surveys s
            LEFT JOIN responses r ON s.id = r.survey_id
            GROUP BY s.id
            ORDER BY s.created_at DESC
        ");
        $stmt->execute();
        return $stmt->fetchAll();
    }

    public function hasUserVoted($surveyId, $sessionId) {
        $stmt = $this->db->prepare("
            SELECT COUNT(*) FROM responses 
            WHERE survey_id = :survey_id AND session_id = :session_id
        ");
        $stmt->execute([
            'survey_id' => $surveyId,
            'session_id' => $sessionId
        ]);
        return $stmt->fetchColumn() > 0;
    }

    public function recordResponse($surveyId, $sessionId, $answer) {
        $stmt = $this->db->prepare("
            INSERT INTO responses (survey_id, session_id, answer) 
            VALUES (:survey_id, :session_id, :answer)
        ");
        return $stmt->execute([
            'survey_id' => $surveyId,
            'session_id' => $sessionId,
            'answer' => $answer ? 1 : 0
        ]);
    }

    public function getSurveyResults($surveyId) {
        $stmt = $this->db->prepare("
            SELECT 
                COUNT(*) as total_votes,
                SUM(CASE WHEN answer = 1 THEN 1 ELSE 0 END) as yes_votes
            FROM responses 
            WHERE survey_id = :survey_id
        ");
        $stmt->execute(['survey_id' => $surveyId]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
}
