<?php
require_once '../../config/config.php';
require_once '../../models/SurveyModel.php';

header('Content-Type: application/json');

session_start();

if (!isset($_SESSION['user_type'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['survey_id']) || !isset($data['answer'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required fields']);
    exit;
}

$surveyModel = new SurveyModel($db);

try {
    // Check if user has already voted
    if ($surveyModel->hasUserVoted($data['survey_id'], session_id())) {
        http_response_code(400);
        echo json_encode(['error' => 'You have already voted on this survey']);
        exit;
    }

    // Record the vote
    $success = $surveyModel->recordResponse(
        $data['survey_id'],
        session_id(),
        $data['answer']
    );

    if ($success) {
        // Get updated results
        $results = $surveyModel->getSurveyResults($data['survey_id']);
        echo json_encode([
            'success' => true,
            'results' => $results
        ]);
    } else {
        throw new Exception('Failed to record vote');
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}