<?php
require_once '../../config/config.php';
require_once '../../models/VoteModel.php';

header('Content-Type: application/json');

session_start();

if (!isset($_SESSION['admin_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

$voteModel = new VoteModel($db);
$surveyId = $_GET['id'];

$results = $voteModel->getSurveyResults($surveyId);
echo json_encode([
    'success' => true,
    'results' => $results
]);
