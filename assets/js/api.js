const API_URL = 'http://localhost/backend/public';

class Api {
    async login(userType, password) {
        try {
            if (!userType || !password) {
                throw new Error('Benutzername und Passwort sind erforderlich');
            }

            const response = await fetch(`${API_URL}/api/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    userType: userType.trim(),
                    password: password
                })
            });

            return await this.handleResponse(response);
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    async adminLogin(username, password) {
        try {
            if (!username || !password) {
                throw new Error('Benutzername und Passwort sind erforderlich');
            }

            const response = await fetch(`${API_URL}/api/admin/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ username, password })
            });

            return await this.handleResponse(response);
        } catch (error) {
            console.error('Admin login error:', error);
            throw error;
        }
    }

    async handleResponse(response) {
        const contentType = response.headers.get('content-type');
        
        try {
            const responseText = await response.text();
            
            if (!response.ok) {
                // Try to parse as JSON first
                try {
                    const errorData = JSON.parse(responseText);
                    throw new Error(errorData.error || errorData.message || 'Request failed');
                } catch (e) {
                    // If not JSON or parsing fails, use text
                    throw new Error(responseText || `HTTP Error: ${response.status}`);
                }
            }

            // Ensure valid JSON response
            if (!contentType?.includes('application/json')) {
                throw new Error('Invalid response format');
            }

            const data = JSON.parse(responseText);
            return data;
        } catch (error) {
            console.error('Response handling error:', error);
            throw error;
        }
    }

    async getSurveys() {
        try {
            const response = await fetch(`${API_URL}/api/surveys`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });
            return await this.handleResponse(response);
        } catch (error) {
            console.error('Get surveys error:', error);
            throw error;
        }
    }

    async submitVote(surveyId, vote) {
        try {
            const response = await fetch(`${API_URL}/api/surveys/${surveyId}/vote`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ vote })
            });

            return await this.handleResponse(response);
        } catch (error) {
            console.error('Submit vote error:', error);
            throw error;
        }
    }

    async getAdminStats() {
        const response = await fetch(`${API_URL}/api/admin/stats`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            },
            credentials: 'include'
        });
        return await this.handleResponse(response);
    }

    async createSurvey(title, description) {
        try {
            if (!title || !description) {
                throw new Error('Titel und Beschreibung sind erforderlich');
            }

            const response = await fetch(`${API_URL}/api/admin/surveys`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                },
                credentials: 'include',
                body: JSON.stringify({
                    title: title.trim(),
                    description: description.trim()
                })
            });

            const data = await this.handleResponse(response);
            return data;
        } catch (error) {
            console.error('Create survey error:', error);
            throw error;
        }
    }

    async updateSurveyStatus(surveyId, status) {
        try {
            if (!surveyId || !status) {
                throw new Error('Survey ID and status are required');
            }

            const allowedStatuses = ['pending', 'active', 'completed'];
            if (!allowedStatuses.includes(status)) {
                throw new Error('Invalid status');
            }

            const response = await fetch(`${API_URL}/api/admin/surveys/${surveyId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                },
                credentials: 'include',
                body: JSON.stringify({ status })
            });

            const data = await this.handleResponse(response);
            console.log('Status update successful:', data);
            return data;
        } catch (error) {
            console.error('Update survey status error:', error);
            throw error;
        }
    }

    async deleteSurvey(surveyId) {
        try {
            if (!surveyId) {
                throw new Error('Survey ID is required');
            }

            const response = await fetch(`${API_URL}/api/admin/surveys/${surveyId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                },
                credentials: 'include'
            });

            return await this.handleResponse(response);
        } catch (error) {
            console.error('Delete survey error:', error);
            throw error;
        }
    }

    async getLogs(params = {}) {
        try {
            const queryParams = new URLSearchParams({
                page: params.page || 1,
                source: params.source || 'activity',
                ...(params.type && { type: params.type }),
                ...(params.date && { date: params.date }),
                ...(params.severity && { severity: params.severity })
            }).toString();

            const response = await fetch(`${API_URL}/api/admin/logs?${queryParams}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                },
                credentials: 'include'
            });

            return await this.handleResponse(response);
        } catch (error) {
            console.error('Get logs error:', error);
            throw error;
        }
    }

    async getErrorLogs(params = {}) {
        return this.getLogs({
            ...params,
            source: 'error'
        });
    }

    async getPhpLogs(params = {}) {
        return this.getLogs({
            ...params,
            source: 'php'
        });
    }

    async downloadLogs(source = 'activity') {
        try {
            const response = await fetch(`${API_URL}/api/admin/logs/download?source=${source}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                },
                credentials: 'include'
            });

            return await this.handleResponse(response);
        } catch (error) {
            console.error('Download logs error:', error);
            throw error;
        }
    }

    async getSurveyResults(surveyId) {
        try {
            if (!surveyId) {
                throw new Error('Survey ID is required');
            }

            const response = await fetch(`${API_URL}/api/surveys/${surveyId}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });

            const data = await this.handleResponse(response);
            
            if (!data.success || !data.survey) {
                throw new Error(data.message || 'Umfrage nicht gefunden');
            }

            // Parse dates directly from MySQL formatted strings
            return {
                success: true,
                yesVotes: parseInt(data.survey.yes_votes) || 0,
                noVotes: parseInt(data.survey.no_votes) || 0,
                title: data.survey.title || 'Umfrageergebnisse',
                totalVotes: parseInt(data.survey.total_votes) || 0,
                createdAt: data.survey.created_at,
                updatedAt: data.survey.updated_at,
                completedAt: data.survey.completed_at
            };
        } catch (error) {
            console.error('Get survey results error:', error);
            throw new Error('Umfrage konnte nicht geladen werden');
        }
    }

    async submitStudentSurvey(surveyData) {
        try {
            const response = await fetch(`${API_URL}/api/surveys/student`, {  // Added /api/ to match other endpoints
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                credentials: 'include',  // Added credentials
                body: JSON.stringify({
                    title: surveyData.title,
                    description: surveyData.description,
                    type: 'yes-no',
                    tag: 'student',
                    status: 'pending'
                })
            });

            return await this.handleResponse(response);  // Use existing response handler
        } catch (error) {
            console.error('Error submitting student survey:', error);
            throw error;
        }
    }

    async submitTeacherSurvey(surveyData) {
        try {
            const response = await fetch(`${API_URL}/api/surveys`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(surveyData)
            });

            return await this.handleResponse(response);
        } catch (error) {
            console.error('Submit teacher survey error:', error);
            throw error;
        }
    }
}

const api = new Api();