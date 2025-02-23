<?php
class VoteModel {
    private $db;

    public function __construct($db) {
        $this->db = $db;
    }

    public function hasVoted($surveyId, $sessionId) {
        $stmt = $this->db->prepare("
            SELECT id 
            FROM responses 
            WHERE survey_id = :survey_id 
            AND session_id = :session_id
        ");
        
        $stmt->execute([
            'survey_id' => $surveyId,
            'session_id' => $sessionId
        ]);

        return $stmt->rowCount() > 0;
    }

    public function submitVote($surveyId, $sessionId, $answer) {
        $stmt = $this->db->prepare("
            INSERT INTO responses (survey_id, session_id, answer) 
            VALUES (:survey_id, :session_id, :answer)
        ");
        
        return $stmt->execute([
            'survey_id' => $surveyId,
            'session_id' => $sessionId,
            'answer' => $answer
        ]);
    }

    public function getSurveyResults($surveyId) {
        $stmt = $this->db->prepare("
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN answer = 1 THEN 1 ELSE 0 END) as yes_votes,
                SUM(CASE WHEN answer = 0 THEN 1 ELSE 0 END) as no_votes
            FROM responses 
            WHERE survey_id = :survey_id
        ");
        
        $stmt->execute(['survey_id' => $surveyId]);
        return $stmt->fetch();
    }
}
