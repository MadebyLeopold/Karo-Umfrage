<?php
require_once '../../config/config.php';
require_once '../../models/AdminModel.php';

header('Content-Type: application/json');

session_start();

if (isset($_SESSION['admin_id'])) {
    echo json_encode(['success' => true]);
} else {
    http_response_code(401);
    echo json_encode(['success' => false]);
}
