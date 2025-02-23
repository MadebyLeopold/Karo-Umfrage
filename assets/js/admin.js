class AdminPanel {
    constructor() {
        this.api = new Api();
        this.checkInitialAuth();
    }

    checkInitialAuth() {
        if (!this.checkAuth()) {
            window.location.href = '../admin/login.html';
            return;
        }
        this.init();
    }

    async init() {
        this.setupLogout();
        await this.loadDashboardData();
        this.setupEventListeners();
    }

    checkAuth() {
        return sessionStorage.getItem('isAdmin') === 'true';
    }

    setupLogout() {
        window.logout = () => {
            sessionStorage.removeItem('isAdmin');
            sessionStorage.removeItem('adminUsername');
            window.location.href = '../admin/login.html';
        };
    }

    async loadDashboardData() {
        try {
            // Check if we're on the dashboard page
            const isDashboardPage = document.querySelector('.dashboard-stats');
            if (!isDashboardPage) {
                console.log('Not on dashboard page, skipping stats update');
                return;
            }

            // Fetch surveys
            const surveysResponse = await this.api.getSurveys();
            console.log('Surveys fetched:', surveysResponse);

            if (surveysResponse.success && surveysResponse.data) {
                // Calculate stats
                const stats = {
                    active: surveysResponse.data.filter(s => s.status === 'active').length,
                    pending: surveysResponse.data.filter(s => s.status === 'pending').length,
                    completed: surveysResponse.data.filter(s => s.status === 'completed').length,
                    totalVotes: surveysResponse.data.reduce((acc, s) => acc + (s.votes_count || 0), 0)
                };

                // Update dashboard counters with validation
                const elements = {
                    'active-count': stats.active,
                    'pending-count': stats.pending,
                    'completed-count': stats.completed,
                    'total-votes': stats.totalVotes
                };

                Object.entries(elements).forEach(([id, value]) => {
                    const element = document.getElementById(id);
                    if (element) {
                        element.textContent = value;
                    } else {
                        console.warn(`Dashboard element not found: ${id}`);
                    }
                });

                // Display surveys if grid exists
                const surveysGrid = document.getElementById('surveysGrid');
                if (surveysGrid) {
                    await this.displaySurveys(surveysResponse.data);
                }
            }
        } catch (error) {
            console.error('Dashboard loading error:', error);
            this.showError('Fehler beim Laden der Dashboard-Daten');
        }
    }

    showError(message) {
        const container = document.getElementById('messageContainer');
        if (!container) {
            console.error('Message container not found');
            return;
        }

        // Remove any existing error messages
        const existingError = container.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }

        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        container.appendChild(errorDiv);

        // Auto-remove after 5 seconds
        setTimeout(() => errorDiv.remove(), 5000);
    }

    showMessage(message, type = 'info') {
        let container = document.getElementById('messageContainer');
        if (!container) {
            container = document.createElement('div');
            container.id = 'messageContainer';
            document.body.appendChild(container);
        }

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        
        // Add icon based on message type
        let icon = '';
        switch(type) {
            case 'success':
                icon = '✓';
                break;
            case 'error':
                icon = '✕';
                break;
            case 'info':
            default:
                icon = 'ℹ';
                break;
        }
        
        messageDiv.innerHTML = `
            <span class="message-icon">${icon}</span>
            <span class="message-text">${message}</span>
        `;
        
        container.appendChild(messageDiv);

        // Trigger show animation on next frame
        requestAnimationFrame(() => {
            messageDiv.classList.add('show');
        });

        // Remove message after delay
        setTimeout(() => {
            messageDiv.classList.add('hide');
            messageDiv.addEventListener('transitionend', () => {
                if (messageDiv.parentElement) {
                    messageDiv.remove();
                }
            }, { once: true });
        }, 3000);
    }

    updateDashboardStats(stats) {
        const elements = {
            'active-count': stats.activeSurveys,
            'pending-count': stats.pendingSurveys,
            'completed-count': stats.completedSurveys,
            'total-votes': stats.totalVotes
        };

        for (const [id, value] of Object.entries(elements)) {
            const element = document.getElementById(id);
            if (element) element.textContent = value;
        }
    }

    async displaySurveys(surveys) {
        const grid = document.getElementById('surveysGrid');
        if (!grid) {
            console.error('Survey grid element not found');
            return;
        }

        grid.innerHTML = surveys.map(survey => `
            <div class="survey-card ${survey.status}" data-id="${survey.id}">
                <div class="card-content">
                    <h3>${this.escapeHtml(survey.title)}</h3>
                    <p>${this.escapeHtml(survey.description || '')}</p>
                    <div class="survey-meta">
                        <span class="status-badge ${survey.status}">${this.getStatusLabel(survey.status)}</span>
                        <span class="date">${new Date(survey.created_at).toLocaleDateString('de-DE')}</span>
                    </div>
                    <div class="card-actions">
                        ${this.getStatusButtons(survey)}
                        <button class="button-icon" onclick="adminPanel.deleteSurvey(${survey.id})" title="Löschen">
                            <svg width="16" height="16" viewBox="0 0 16 16">
                                <path d="M2 4h12m-9 0v8a2 2 0 002 2h4a2 2 0 002-2V4M5.33 4V2.67c0-.37.3-.67.67-.67h4c.37 0 .67.3.67.67V4"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

        // Setup filter functionality
        this.setupSurveyEventListeners();
    }

    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    getStatusLabel(status) {
        const labels = {
            pending: 'Ausstehend',
            active: 'Aktiv',
            completed: 'Abgeschlossen'
        };
        return labels[status] || status;
    }

    getStatusButtons(survey) {
        const buttons = [];
        switch(survey.status) {
            case 'pending':
                buttons.push(`<button class="button button-primary" onclick="adminPanel.updateSurveyStatus(${survey.id}, 'active')">Aktivieren</button>`);
                break;
            case 'active':
                buttons.push(`<button class="button button-warning" onclick="adminPanel.updateSurveyStatus(${survey.id}, 'completed')">Beenden</button>`);
                break;
            case 'completed':
                buttons.push(`<button class="button button-secondary" onclick="adminPanel.updateSurveyStatus(${survey.id}, 'pending')">Neu starten</button>`);
                break;
        }
        return buttons.join('');
    }

    async updateSurveyStatus(surveyId, status) {
        try {
            console.log(`Updating survey ${surveyId} to status: ${status}`);
            const result = await this.api.updateSurveyStatus(surveyId, status);
            console.log('Update result:', result);
            
            if (result.success) {
                await this.loadDashboardData();
                this.showMessage(`Status erfolgreich auf "${this.getStatusLabel(status)}" geändert`, 'success');
            } else {
                throw new Error(result.message || 'Update failed');
            }
        } catch (error) {
            console.error('Error updating status:', error);
            this.showMessage(`Fehler beim Ändern des Status: ${error.message}`, 'error');
        }
    }

    async deleteSurvey(surveyId) {
        try {
            if (!confirm('Sind Sie sicher, dass Sie diese Umfrage löschen möchten?')) {
                return;
            }

            await this.api.deleteSurvey(surveyId);
            await this.loadDashboardData();
            this.showMessage('Umfrage erfolgreich gelöscht', 'success');
        } catch (error) {
            console.error('Error deleting survey:', error);
            this.showMessage('Fehler beim Löschen der Umfrage', 'error');
        }
    }

    setupSurveyEventListeners() {
        const statusFilter = document.getElementById('statusFilter');
        if (statusFilter) {
            statusFilter.addEventListener('change', () => this.filterSurveys(statusFilter.value));
        }
    }

    filterSurveys(status) {
        const cards = document.querySelectorAll('.survey-card');
        cards.forEach(card => {
            if (status === 'all' || card.classList.contains(status)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }

    setupEventListeners() {
        // Nur Logout-Handler behalten
        window.logout = () => {
            sessionStorage.removeItem('isAdmin');
            sessionStorage.removeItem('adminUsername');
            window.location.href = '../admin/login.html';
        };
    }
}

// Initialize admin panel only after DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.adminPanel = new AdminPanel();
});

// Add CSS for error messages
const style = document.createElement('style');
style.textContent = `
    .error-message {
        background-color: #fee;
        border: 1px solid #faa;
        color: #c00;
        padding: 10px;
        margin: 10px 0;
        border-radius: 4px;
    }
`;
document.head.appendChild(style);