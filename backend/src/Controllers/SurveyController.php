<?php
class SurveyController extends ApiController {
    private $surveyModel;

    public function __construct() {
        parent::__construct();
        $this->surveyModel = new SurveyModel($this->db);
    }

    public function index() {
        if (!$this->auth->validateRequest()) {
            return;
        }

        try {
            $surveys = $this->surveyModel->getActiveSurveys($_SESSION['user_type']);
            $this->sendResponse(['success' => true, 'data' => $surveys]);
        } catch (Exception $e) {
            $this->sendError('Failed to fetch surveys', 500);
        }
    }

    public function create() {
        if (!$this->auth->validateRequest()) {
            return;
        }

        $data = $this->getRequestData();
        $errors = $this->validator->validateSurveyInput($data);

        if (!empty($errors)) {
            $this->sendError($errors);
            return;
        }

        try {
            $surveyId = $this->surveyModel->createSurvey(
                $data['title'],
                $data['question'],
                $_SESSION['user_type']
            );
            $this->sendResponse([
                'success' => true,
                'data' => ['id' => $surveyId]
            ], 201);
        } catch (Exception $e) {
            $this->sendError('Failed to create survey', 500);
        }
    }

    public function update($id) {
        if (!$this->auth->validateAdminRequest()) {
            return;
        }

        $data = $this->getRequestData();
        
        try {
            $success = $this->surveyModel->updateStatus($id, $data['status']);
            $this->sendResponse(['success' => $success]);
        } catch (Exception $e) {
            $this->sendError('Failed to update survey', 500);
        }
    }

    public function delete($id) {
        if (!$this->auth->validateAdminRequest()) {
            return;
        }

        try {
            $success = $this->surveyModel->deleteSurvey($id);
            $this->sendResponse(['success' => $success]);
        } catch (Exception $e) {
            $this->sendError('Failed to delete survey', 500);
        }
    }
}
