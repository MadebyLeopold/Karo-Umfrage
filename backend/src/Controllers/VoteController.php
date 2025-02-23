<?php
class VoteController extends ApiController {
    private $voteModel;

    public function __construct() {
        parent::__construct();
        $this->voteModel = new VoteModel($this->db);
    }

    public function submit() {
        if (!$this->auth->validateRequest()) {
            return;
        }

        $data = $this->getRequestData();
        $errors = $this->validator->validateVoteInput($data);

        if (!empty($errors)) {
            $this->sendError($errors);
            return;
        }

        try {
            if ($this->voteModel->hasVoted($data['survey_id'], session_id())) {
                $this->sendError('Already voted', 400);
                return;
            }

            $success = $this->voteModel->submitVote(
                $data['survey_id'],
                session_id(),
                $data['vote']
            );
            $this->sendResponse(['success' => $success]);
        } catch (Exception $e) {
            $this->sendError('Failed to submit vote', 500);
        }
    }

    public function getResults($surveyId) {
        if (!$this->auth->validateAdminRequest()) {
            return;
        }

        try {
            $results = $this->voteModel->getSurveyResults($surveyId);
            $this->sendResponse(['success' => true, 'data' => $results]);
        } catch (Exception $e) {
            $this->sendError('Failed to fetch results', 500);
        }
    }
}
