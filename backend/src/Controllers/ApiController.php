<?php

class ApiController {
    protected $db;
    protected $auth;

    public function __construct() {
        try {
            error_log("Initializing ApiController...");
            
            // Try to get database instance
            $database = Database::getInstance();
            if (!$database) {
                throw new Exception("Failed to get database instance");
            }
            
            // Try to get connection
            $this->db = $database->getConnection();
            if (!$this->db) {
                throw new Exception("Failed to get database connection");
            }
            
            // Initialize auth middleware
            $this->auth = new AuthMiddleware($this->db);
            if (!$this->auth) {
                throw new Exception("Failed to initialize auth middleware");
            }

            error_log("ApiController initialized successfully");
        } catch (Exception $e) {
            error_log("ApiController initialization error: " . $e->getMessage());
            error_log("Stack trace: " . $e->getTraceAsString());
            $this->sendErrorResponse("Failed to initialize API controller: " . $e->getMessage(), 500);
            exit;
        }
    }

    private function sendErrorResponse($message, $code = 500) {
        if (headers_sent()) {
            error_log("Headers already sent, cannot set response code");
        } else {
            http_response_code($code);
            header('Content-Type: application/json');
        }
        
        echo json_encode([
            'success' => false,
            'message' => 'Internal Server Error',
            'error' => $message
        ]);
    }

    public function login() {
        try {
            // Get JSON input
            $data = json_decode(file_get_contents('php://input'), true);
            
            // Validate input
            if (!$data || !isset($data['userType']) || !isset($data['password'])) {
                $this->sendError('Missing required fields', 400);
                return;
            }

            // Validate user type
            if (!in_array($data['userType'], ['student', 'teacher'])) {
                $this->sendError('Invalid user type', 400);
                return;
            }

            // Attempt authentication
            $userId = $this->auth->authenticate($data['userType'], $data['password']);
            
            if (!$userId) {
                $this->sendError('Invalid credentials', 401);
                return;
            }

            // Start session if not already started
            if (session_status() === PHP_SESSION_NONE) {
                session_start();
            }

            $_SESSION['user_id'] = $userId;
            $_SESSION['user_type'] = $data['userType'];

            $this->sendResponse([
                'success' => true,
                'message' => 'Login successful',
                'user' => [
                    'id' => $userId,
                    'type' => $data['userType']
                ]
            ]);
        } catch (Exception $e) {
            error_log("Login error: " . $e->getMessage());
            $this->sendError('Login failed: ' . $e->getMessage(), 500);
        }
    }

    public function getSurveys() {
        try {
            $db = Database::getInstance()->getConnection();
            $userIp = $_SERVER['REMOTE_ADDR'];
            
            $query = "SELECT 
                s.*,
                (SELECT COUNT(*) FROM votes WHERE survey_id = s.id AND vote = 1) as yes_votes,
                (SELECT COUNT(*) FROM votes WHERE survey_id = s.id AND vote = 0) as no_votes,
                (SELECT COUNT(*) FROM votes WHERE survey_id = s.id) as total_votes,
                (SELECT COUNT(*) > 0 FROM votes WHERE survey_id = s.id AND ip_address = ?) as has_voted
                FROM surveys s
                ORDER BY s.created_at DESC";
            
            $stmt = $db->prepare($query);
            $stmt->execute([$userIp]);
            
            $surveys = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Debug log
            error_log("Fetched surveys with votes: " . json_encode($surveys));
            
            echo json_encode([
                'success' => true,
                'data' => $surveys
            ]);
        } catch (Exception $e) {
            error_log("Error fetching surveys: " . $e->getMessage());
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Error fetching surveys'
            ]);
        }
    }

    public function getDashboardStats() {
        try {
            $db = Database::getInstance()->getConnection();
            
            // Debug logging
            error_log("Fetching dashboard stats...");
            
            // Get active surveys count
            $activeQuery = "SELECT COUNT(*) as count FROM surveys WHERE status = 'active'";
            $activeResult = $db->query($activeQuery)->fetch(PDO::FETCH_ASSOC);
            error_log("Active surveys: " . $activeResult['count']);
            
            // Get pending surveys count
            $pendingQuery = "SELECT COUNT(*) as count FROM surveys WHERE status = 'pending'";
            $pendingResult = $db->query($pendingQuery)->fetch(PDO::FETCH_ASSOC);
            error_log("Pending surveys: " . $pendingResult['count']);
            
            // Get completed surveys count
            $completedQuery = "SELECT COUNT(*) as count FROM surveys WHERE status = 'completed'";
            $completedResult = $db->query($completedQuery)->fetch(PDO::FETCH_ASSOC);
            error_log("Completed surveys: " . $completedResult['count']);
            
            // Get total votes
            $votesQuery = "SELECT COUNT(*) as count FROM votes";
            $votesResult = $db->query($votesQuery)->fetch(PDO::FETCH_ASSOC);
            error_log("Total votes: " . $votesResult['count']);
            
            $response = [
                'success' => true,
                'data' => [
                    'active' => (int)$activeResult['count'],
                    'pending' => (int)$pendingResult['count'],
                    'completed' => (int)$completedResult['count'],
                    'totalVotes' => (int)$votesResult['count']
                ]
            ];
            
            error_log("Sending response: " . json_encode($response));
            echo json_encode($response);
            
        } catch (Exception $e) {
            error_log("Error in getDashboardStats: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => 'Fehler beim Abrufen der Dashboard-Statistiken']);
        }
    }

    public function getActivityLog() {
        try {
            $db = Database::getInstance()->getConnection();
            $query = "SELECT * FROM activity_log ORDER BY timestamp DESC LIMIT 10";
            $stmt = $db->query($query);
            $activities = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode([
                'success' => true,
                'data' => $activities
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Fehler beim Abrufen der Aktivitäten']);
        }
    }

    public function createSurvey() {
        try {
            $data = json_decode(file_get_contents('php://input'), true);

            if (!isset($data['title']) || !isset($data['description'])) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Title and description are required']);
                return;
            }

            $title = trim($data['title']);
            $description = trim($data['description']);

            if (empty($title) || empty($description)) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Title and description cannot be empty']);
                return;
            }

            $db = Database::getInstance()->getConnection();
            $query = "INSERT INTO surveys (title, description, status) VALUES (:title, :description, 'pending')";
            $stmt = $db->prepare($query);
            $stmt->bindParam(':title', $title);
            $stmt->bindParam(':description', $description);
            $stmt->execute();

            echo json_encode(['success' => true, 'message' => 'Survey created successfully']);
        } catch (Exception $e) {
            error_log("Error creating survey: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Error creating survey']);
        }
    }

    public function createStudentSurvey() {
        try {
            // Get and validate input data
            $data = json_decode(file_get_contents('php://input'), true);
            
            // Debug log
            error_log("Received student survey data: " . json_encode($data));

            if (!isset($data['title']) || !isset($data['description'])) {
                $this->sendError('Title and description are required', 400);
                return;
            }

            $title = trim($data['title']);
            $description = trim($data['description']);

            if (empty($title) || empty($description)) {
                $this->sendError('Title and description cannot be empty', 400);
                return;
            }

            $db = Database::getInstance()->getConnection();
            
            // Start transaction
            $db->beginTransaction();

            try {
                // Debug log
                error_log("Attempting to insert student survey with title: $title");

                // Insert the survey with explicit column names
                $query = "INSERT INTO surveys 
                         (title, description, status, type, tag, created_at) 
                         VALUES 
                         (:title, :description, :status, :type, :tag, NOW())";
                
                $stmt = $db->prepare($query);
                $stmt->execute([
                    ':title' => $title,
                    ':description' => $description,
                    ':status' => 'pending',
                    ':type' => 'yes-no',
                    ':tag' => 'student'
                ]);

                $surveyId = $db->lastInsertId();

                // Log the activity
                $this->logActivity(
                    'survey_creation',
                    "Student survey created: '$title'",
                    'info'
                );

                $db->commit();

                // Debug log
                error_log("Successfully created student survey with ID: $surveyId");

                $this->sendResponse([
                    'success' => true,
                    'message' => 'Survey created successfully',
                    'data' => [
                        'id' => $surveyId,
                        'title' => $title,
                        'description' => $description,
                        'status' => 'pending',
                        'type' => 'yes-no',
                        'tag' => 'student'
                    ]
                ]);
            } catch (Exception $e) {
                $db->rollBack();
                error_log("Database error creating student survey: " . $e->getMessage());
                throw $e;
            }
        } catch (Exception $e) {
            error_log("Error creating student survey: " . $e->getMessage());
            error_log("Stack trace: " . $e->getTraceAsString());
            $this->sendError('Error creating survey: ' . $e->getMessage(), 500);
        }
    }

    public function updateSurveyStatus($surveyId, $status) {
        try {
            if (!$surveyId || !$status) {
                throw new Exception('Survey ID and status are required');
            }

            // Validate status
            $validStatuses = ['pending', 'active', 'completed'];
            if (!in_array($status, $validStatuses)) {
                throw new Exception('Invalid status value');
            }

            $db = Database::getInstance()->getConnection();
            
            // Start transaction
            $db->beginTransaction();
            
            // Update the query to explicitly name each parameter
            $query = "UPDATE surveys 
                      SET status = :new_status, 
                          completed_at = CASE 
                              WHEN :check_status = 'completed' THEN CURRENT_TIMESTAMP
                              ELSE NULL 
                          END,
                          updated_at = CURRENT_TIMESTAMP 
                      WHERE id = :survey_id";
            
            $stmt = $db->prepare($query);
            $stmt->execute([
                ':new_status' => $status,
                ':check_status' => $status,
                ':survey_id' => $surveyId
            ]);

            // Log the activity
            $this->logActivity(
                'status_update',
                "Survey #{$surveyId} status updated to {$status}",
                'info'
            );

            $db->commit();
            
            // Return success response
            $this->sendResponse([
                'success' => true,
                'message' => 'Survey status updated successfully',
                'data' => [
                    'id' => $surveyId,
                    'status' => $status
                ]
            ]);
        } catch (Exception $e) {
            if (isset($db) && $db->inTransaction()) {
                $db->rollBack();
            }
            error_log("Error updating survey status: " . $e->getMessage());
            $this->sendError('Error updating survey status: ' . $e->getMessage(), 500);
        }
    }

    public function deleteSurvey($surveyId) {
        try {
            $db = Database::getInstance()->getConnection();
            
            // Start transaction
            $db->beginTransaction();
            
            // Delete related votes first
            $deleteVotesQuery = "DELETE FROM votes WHERE survey_id = :survey_id";
            $stmt = $db->prepare($deleteVotesQuery);
            $stmt->bindParam(':survey_id', $surveyId);
            $stmt->execute();
            
            // Then delete the survey
            $deleteSurveyQuery = "DELETE FROM surveys WHERE id = :id";
            $stmt = $db->prepare($deleteSurveyQuery);
            $stmt->bindParam(':id', $surveyId);
            $stmt->execute();
            
            // Log the activity
            $activityQuery = "INSERT INTO activity_log (description) VALUES (:description)";
            $activityStmt = $db->prepare($activityQuery);
            $description = "Survey #$surveyId has been deleted";
            $activityStmt->bindParam(':description', $description);
            $activityStmt->execute();
            
            // Commit transaction
            $db->commit();
    
            echo json_encode([
                'success' => true,
                'message' => 'Survey deleted successfully'
            ]);
        } catch (Exception $e) {
            // Rollback transaction on error
            $db->rollBack();
            error_log("Error deleting survey: " . $e->getMessage());
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Error deleting survey'
            ]);
        }
    }

    public function getLogs($params = []) {
        try {
            $response = null;
            switch ($params['source']) {
                case 'php':
                    $response = $this->getPhpLogs($params);
                    break;
                case 'error':
                    $response = $this->getErrorLogs($params);
                    break;
                default:
                    $response = $this->getActivityLogs($params);
            }
            
            // Ensure proper JSON response
            header('Content-Type: application/json');
            echo json_encode($response);
            return;
            
        } catch (Exception $e) {
            header('Content-Type: application/json');
            echo json_encode([
                'success' => false,
                'error' => $e->getMessage()
            ]);
            return;
        }
    }

    private function getActivityLogs($params) {
        try {
            $page = max(1, intval($params['page']));
            $limit = 20;
            $offset = ($page - 1) * $limit;
            
            $query = "SELECT * FROM activity_log";
            $countQuery = "SELECT COUNT(*) as total FROM activity_log";
            $whereConditions = [];
            $queryParams = [];

            if ($params['type']) {
                $whereConditions[] = "type = ?";
                $queryParams[] = $params['type'];
            }

            if ($params['date']) {
                $whereConditions[] = "DATE(timestamp) = ?";
                $queryParams[] = $params['date'];
            }

            if (!empty($whereConditions)) {
                $query .= " WHERE " . implode(" AND ", $whereConditions);
                $countQuery .= " WHERE " . implode(" AND ", $whereConditions);
            }

            // Update the query to sort by timestamp in descending order
            $query .= " ORDER BY timestamp DESC LIMIT ? OFFSET ?";
            $queryParams[] = $limit;
            $queryParams[] = $offset;

            $stmt = $this->db->prepare($query);
            $stmt->execute($queryParams);
            $logs = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $countStmt = $this->db->prepare($countQuery);
            $countStmt->execute(array_slice($queryParams, 0, -2));
            $total = $countStmt->fetch(PDO::FETCH_ASSOC)['total'];

            return [
                'success' => true,
                'data' => [
                    'logs' => $logs,
                    'total' => $total
                ]
            ];
        } catch (Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    private function getPhpLogs($params) {
        try {
            $logFile = __DIR__ . '/../../logs/error.log';
            if (!file_exists($logFile)) {
                throw new Exception('Log file not found');
            }

            $logs = [];
            // Reverse the array to get newest logs first
            $lines = array_reverse(file($logFile));
            $totalLines = count($lines);

            // Calculate pagination
            $page = isset($params['page']) ? (int)$params['page'] : 1;
            $perPage = 20;
            $offset = ($page - 1) * $perPage;

            // Apply filters and process log entries
            $filteredLines = array_values(array_filter($lines, function($line) use ($params) {
                if (empty($line)) return false;
                
                // Date filter
                if (!empty($params['date'])) {
                    if (preg_match('/\[(.*?)\]/', $line, $matches)) {
                        $logDate = date('Y-m-d', strtotime($matches[1]));
                        if ($logDate !== $params['date']) return false;
                    }
                }
                
                // Severity filter
                if (!empty($params['severity']) && $params['severity'] !== 'all') {
                    $severity = strtolower($params['severity']);
                    if (stripos($line, $severity) === false) return false;
                }
                
                return true;
            }));

            $totalFilteredLines = count($filteredLines);
            $paginatedLines = array_slice($filteredLines, $offset, $perPage);

            $logs = array_map(function($line) {
                if (preg_match('/\[(.*?)\] (.+)/', $line, $matches)) {
                    return [
                        'timestamp' => $matches[1],
                        'message' => $matches[2],
                        'severity' => $this->determineLogSeverity($matches[2]),
                        'source' => 'PHP',
                        'details' => ''
                    ];
                }
                return null;
            }, $paginatedLines);

            // Filter out null values
            $logs = array_values(array_filter($logs));

            return [
                'success' => true,
                'data' => [
                    'logs' => $logs,
                    'total' => $totalFilteredLines
                ]
            ];
        } catch (Exception $e) {
            error_log("Error reading PHP logs: " . $e->getMessage());
            return [
                'success' => false,
                'error' => 'Error reading PHP logs: ' . $e->getMessage()
            ];
        }
    }

    private function getErrorLogs($params) {
        try {
            $page = max(1, intval($params['page']));
            $limit = 20;
            $offset = ($page - 1) * $limit;
            
            $query = "SELECT * FROM error_log";
            $countQuery = "SELECT COUNT(*) as total FROM error_log";
            $whereConditions = [];
            $queryParams = [];

            if (!empty($params['severity']) && $params['severity'] !== 'all') {
                $whereConditions[] = "severity = ?";
                $queryParams[] = $params['severity'];
            }

            if (!empty($params['date'])) {
                $whereConditions[] = "DATE(timestamp) = ?";
                $queryParams[] = $params['date'];
            }

            if (!empty($whereConditions)) {
                $query .= " WHERE " . implode(" AND ", $whereConditions);
                $countQuery .= " WHERE " . implode(" AND ", $whereConditions);
            }

            $query .= " ORDER BY timestamp DESC LIMIT ? OFFSET ?";
            $queryParams[] = $limit;
            $queryParams[] = $offset;

            $stmt = $this->db->prepare($query);
            $stmt->execute($queryParams);
            $logs = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $countStmt = $this->db->prepare($countQuery);
            $countStmt->execute(array_slice($queryParams, 0, -2));
            $total = $countStmt->fetch(PDO::FETCH_ASSOC)['total'];

            return [
                'success' => true,
                'data' => [
                    'logs' => $logs,
                    'total' => $total
                ]
            ];
        } catch (Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    private function determineLogSeverity($message) {
        $message = strtolower($message);
        if (strpos($message, 'error') !== false) return 'error';
        if (strpos($message, 'warning') !== false) return 'warning';
        if (strpos($message, 'notice') !== false) return 'notice';
        return 'info';
    }

    public function submitVote($surveyId) {
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            $db = Database::getInstance()->getConnection();
            
            // Start transaction
            $db->beginTransaction();
            
            // Insert vote
            $insertQuery = "INSERT INTO votes (survey_id, vote, ip_address) 
                           VALUES (?, ?, ?)";
            $stmt = $db->prepare($insertQuery);
            $stmt->execute([
                $surveyId,
                $data['vote'] ? 1 : 0,
                $_SERVER['REMOTE_ADDR']
            ]);
            
            // Get updated vote counts
            $countQuery = "SELECT 
                (SELECT COUNT(*) FROM votes WHERE survey_id = ? AND vote = 1) as yes_votes,
                (SELECT COUNT(*) FROM votes WHERE survey_id = ? AND vote = 0) as no_votes";
            $countStmt = $db->prepare($countQuery);
            $countStmt->execute([$surveyId, $surveyId]);
            $counts = $countStmt->fetch(PDO::FETCH_ASSOC);
            
            $db->commit();
            
            echo json_encode([
                'success' => true,
                'data' => [
                    'yes_votes' => (int)$counts['yes_votes'],
                    'no_votes' => (int)$counts['no_votes']
                ]
            ]);
            
        } catch (Exception $e) {
            if ($db->inTransaction()) {
                $db->rollBack();
            }
            error_log("Vote submission error: " . $e->getMessage());
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Error submitting vote'
            ]);
        }
    }

    public function getActiveSurveys() {
        try {
            $db = Database::getInstance()->getConnection();
            $userIp = $_SERVER['REMOTE_ADDR'];
            
            $query = "SELECT 
                        s.*, 
                        COALESCE(s.yes_votes, 0) as yes_votes,
                        COALESCE(s.no_votes, 0) as no_votes,
                        CASE WHEN v.id IS NOT NULL THEN TRUE ELSE FALSE END as has_voted
                      FROM surveys s
                      LEFT JOIN votes v ON s.id = v.survey_id AND v.ip_address = ?
                      WHERE s.status = 'active'
                      ORDER BY s.created_at DESC";
            
            $stmt = $db->prepare($query);
            $stmt->execute([$userIp]);
            
            $surveys = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Debug logging
            error_log('Fetched surveys: ' . json_encode($surveys));
            
            echo json_encode([
                'success' => true,
                'data' => $surveys
            ]);
        } catch (Exception $e) {
            error_log("Error fetching active surveys: " . $e->getMessage());
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Error fetching surveys'
            ]);
        }
    }

    public function getSurveyById($surveyId) {
        try {
            $db = Database::getInstance()->getConnection();
            
            $query = "SELECT 
                s.*,
                (SELECT COUNT(*) FROM votes WHERE survey_id = s.id AND vote = 1) as yes_votes,
                (SELECT COUNT(*) FROM votes WHERE survey_id = s.id AND vote = 0) as no_votes,
                (SELECT COUNT(*) FROM votes WHERE survey_id = s.id) as total_votes,
                s.created_at,
                s.updated_at,
                s.completed_at
                FROM surveys s
                WHERE s.id = :id";
            
            $stmt = $db->prepare($query);
            $stmt->execute(['id' => $surveyId]);
            
            $survey = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$survey) {
                http_response_code(404);
                echo json_encode([
                    'success' => false,
                    'message' => 'Umfrage nicht gefunden'
                ]);
                return;
            }

            // Format dates properly
            $formattedSurvey = [
                'id' => $survey['id'],
                'title' => $survey['title'],
                'description' => $survey['description'],
                'status' => $survey['status'],
                'yes_votes' => (int)$survey['yes_votes'],
                'no_votes' => (int)$survey['no_votes'],
                'total_votes' => (int)$survey['total_votes'],
                'created_at' => $survey['created_at'] ? date('Y-m-d H:i:s', strtotime($survey['created_at'])) : null,
                'updated_at' => $survey['updated_at'] ? date('Y-m-d H:i:s', strtotime($survey['updated_at'])) : null,
                'completed_at' => $survey['completed_at'] ? date('Y-m-d H:i:s', strtotime($survey['completed_at'])) : null
            ];

            echo json_encode([
                'success' => true,
                'survey' => $formattedSurvey
            ]);

        } catch (Exception $e) {
            error_log("Error getting survey: " . $e->getMessage());
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Fehler beim Laden der Umfrage'
            ]);
        }
    }

    protected function getRequestData() {
        $input = file_get_contents('php://input');
        return json_decode($input, true);
    }

    protected function sendError($message, $code = 400) {
        http_response_code($code);
        echo json_encode([
            'success' => false,
            'error' => $message
        ]);
    }

    protected function sendResponse($data, $code = 200) {
        http_response_code($code);
        echo json_encode($data);
    }

    protected function logActivity($type, $description, $status = 'info') {
        try {
            $db = Database::getInstance()->getConnection();
            $query = "INSERT INTO activity_log (type, description, ip_address, status) VALUES (:type, :description, :ip, :status)";
            $stmt = $db->prepare($query);
            
            $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
            
            $stmt->execute([
                ':type' => $type,
                ':description' => $description,
                ':ip' => $ip,
                ':status' => $status
            ]);
            
            return true;
        } catch (Exception $e) {
            error_log("Error logging activity: " . $e->getMessage());
            return false;
        }
    }

    private function logError($error, $severity = 'error') {
        try {
            $stmt = $this->db->prepare("
                INSERT INTO error_log 
                (severity, message, file, line, trace) 
                VALUES (?, ?, ?, ?, ?)
            ");
            
            $stmt->execute([
                $severity,
                $error->getMessage(),
                $error->getFile(),
                $error->getLine(),
                $error->getTraceAsString()
            ]);
        } catch (Exception $e) {
            // Fallback to PHP error log if database logging fails
            error_log("Failed to log to database: " . $e->getMessage());
        }
    }
}