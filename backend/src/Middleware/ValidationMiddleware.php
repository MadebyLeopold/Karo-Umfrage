<?php
class ValidationMiddleware {
    public static function validateSurveyInput($data) {
        $errors = [];

        if (empty($data['title'])) {
            $errors['title'] = 'Title is required';
        } elseif (strlen($data['title']) > 100) {
            $errors['title'] = 'Title must be less than 100 characters';
        }

        if (empty($data['question'])) {
            $errors['question'] = 'Question is required';
        }

        if (!in_array($data['user_type'] ?? '', ['student', 'teacher'])) {
            $errors['user_type'] = 'Invalid user type';
        }

        return $errors;
    }

    public static function validateVoteInput($data) {
        $errors = [];

        if (!isset($data['survey_id']) || !is_numeric($data['survey_id'])) {
            $errors['survey_id'] = 'Invalid survey ID';
        }

        if (!isset($data['vote']) || !is_bool($data['vote'])) {
            $errors['vote'] = 'Invalid vote value';
        }

        return $errors;
    }

    public static function sanitizeInput($data) {
        $sanitized = [];
        foreach ($data as $key => $value) {
            if (is_string($value)) {
                $sanitized[$key] = htmlspecialchars(trim($value), ENT_QUOTES, 'UTF-8');
            } else {
                $sanitized[$key] = $value;
            }
        }
        return $sanitized;
    }
}
