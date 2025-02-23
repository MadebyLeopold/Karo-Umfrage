<?php
require_once '../../config/config.php';
require_once '../../models/SurveyModel.php';

header('Content-Type: application/json');

session_start();

if (!isset($_SESSION['admin_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

$surveyModel = new SurveyModel($db);

switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        $surveys = $surveyModel->getAllSurveys();
        echo json_encode(['success' => true, 'surveys' => $surveys]);
        break;

    case 'PUT':
        $data = json_decode(file_get_contents('php://input'), true);
        $success = $surveyModel->updateStatus($data['id'], $data['status']);
        echo json_encode(['success' => $success]);
        break;

    case 'DELETE':
        $id = $_GET['id'];
        $success = $surveyModel->deleteSurvey($id);
        echo json_encode(['success' => $success]);
        break;
}
