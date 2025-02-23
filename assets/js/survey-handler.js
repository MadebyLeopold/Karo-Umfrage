class SurveyHandler {
    constructor() {
        this.api = new Api();
        this.loadSurveys();
    }

    async loadSurveys() {
        try {
            const response = await this.api.getSurveys();
            if (response.success) {
                const activeSurveys = response.data.filter(s => s.status === 'active');
                const completedSurveys = response.data.filter(s => s.status === 'completed');
                
                this.renderActiveSurveys(activeSurveys);
                this.renderCompletedSurveys(completedSurveys);
                
                // Initialize charts after rendering
                setTimeout(() => this.initializeCharts(), 100);
            } else {
                this.showMessage('Fehler beim Laden der Umfragen', 'error');
            }
        } catch (error) {
            console.error('Error loading surveys:', error);
            this.showMessage('Fehler beim Laden der Umfragen', 'error');
        }
    }

    renderActiveSurveys(surveys) {
        const container = document.getElementById('surveys-container');
        if (!container) return;

        container.innerHTML = surveys.map(survey => `
            <div class="survey-card ${survey.has_voted ? 'voted' : ''}" data-id="${survey.id}">
                <h3 class="survey-title">${this.escapeHtml(survey.title)}</h3>
                <div class="survey-meta">
                    <span class="meta-item">
                        <i class="far fa-clock"></i>
                        ${formatDate(survey.created_at)}
                    </span>
                    <span class="meta-item">
                        <i class="far fa-user"></i>
                        ${survey.tag === 'student' ? 'Schüler' : 'Lehrer'}
                    </span>
                </div>
                <p class="survey-description">${this.escapeHtml(survey.description)}</p>
                ${survey.has_voted 
                    ? `<div class="voted-message">
                        <i class="fas fa-check-circle"></i>
                        Sie haben bereits abgestimmt
                       </div>`
                    : `<div class="vote-buttons">
                        <button onclick="surveyHandler.submitVote(${survey.id}, true)" class="vote-btn vote-yes">
                            <i class="fas fa-thumbs-up"></i>
                            Ja
                        </button>
                        <button onclick="surveyHandler.submitVote(${survey.id}, false)" class="vote-btn vote-no">
                            <i class="fas fa-thumbs-down"></i>
                            Nein
                        </button>
                       </div>`
                }
            </div>
        `).join('');
    }

    renderCompletedSurveys(surveys) {
        const container = document.getElementById('completed-surveys-container');
        if (!container) return;

        container.innerHTML = surveys.map(survey => `
            <div class="survey-card completed" data-id="${survey.id}">
                <div class="card-header">
                    <h3>${this.escapeHtml(survey.title)}</h3>
                    <button type="button" class="minimize-btn" data-survey-id="${survey.id}" aria-label="Minimize">
                        <i class="fas fa-minus"></i>
                    </button>
                </div>
                <div class="card-content">
                    <div class="survey-meta">
                        <span class="meta-item">
                            <i class="far fa-calendar-alt"></i>
                            Erstellt: ${formatDate(survey.created_at)}
                        </span>
                        <span class="meta-item">
                            <i class="fas fa-user-tag"></i>
                            ${survey.tag === 'student' ? 'Schüler' : 'Lehrer'}
                        </span>
                    </div>
                    <p class="survey-description">${this.escapeHtml(survey.description)}</p>
                    <div class="completion-date">
                        <i class="fas fa-check-circle"></i>
                        Abgeschlossen am ${formatDate(survey.completed_at)}
                    </div>
                    <div class="results-section">
                        ${this.renderVoteResults(survey)}
                        <div class="survey-actions">
                            <button onclick="showChartModal(${survey.id})" class="chart-btn">
                                <i class="fas fa-chart-pie"></i>
                                Detaillierte Ergebnisse
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('') || '<p class="no-surveys">Keine abgeschlossenen Umfragen verfügbar</p>';

        // Add event listeners after rendering
        this.setupMinimizeButtons();
    }

    setupMinimizeButtons() {
        console.log('Setting up minimize buttons'); // Debug log
        
        const buttons = document.querySelectorAll('.minimize-btn');
        console.log('Found buttons:', buttons.length); // Debug log
    
        buttons.forEach(button => {
            // Remove any existing listeners
            button.removeEventListener('click', this.minimizeClickHandler);
            
            // Add new click handler
            button.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const surveyId = button.dataset.surveyId;
                console.log('Minimize button clicked for survey:', surveyId); // Debug log
                this.toggleMinimize(surveyId);
            });
        });
    }

    renderVoteResults(survey) {
        if (!survey) return '<div class="error-message">Keine Umfragedaten verfügbar</div>';

        const yesVotes = Number(survey.yes_votes) || 0;
        const noVotes = Number(survey.no_votes) || 0;
        const totalVotes = yesVotes + noVotes;

        if (totalVotes === 0) {
            return '<div class="no-votes-message">Noch keine Stimmen abgegeben</div>';
        }

        const yesPercentage = this.calculatePercentage(yesVotes, totalVotes);
        const noPercentage = this.calculatePercentage(noVotes, totalVotes);

        return `
            <div class="vote-results">
                <div class="result-bars">
                    <div class="result-bar-container">
                        <div class="bar-label">
                            <span>Ja</span>
                            <span>${yesVotes} Stimmen (${yesPercentage.toFixed(1)}%)</span>
                        </div>
                        <div class="result-bar">
                            <div class="yes-bar" style="width: ${yesPercentage}%">
                                ${yesPercentage > 10 ? `${yesPercentage.toFixed(1)}%` : ''}
                            </div>
                        </div>
                    </div>
                    <div class="result-bar-container">
                        <div class="bar-label">
                            <span>Nein</span>
                            <span>${noVotes} Stimmen (${noPercentage.toFixed(1)}%)</span>
                        </div>
                        <div class="result-bar">
                            <div class="no-bar" style="width: ${noPercentage}%">
                                ${noPercentage > 10 ? `${noPercentage.toFixed(1)}%` : ''}
                            </div>
                        </div>
                    </div>
                </div>
                <div class="total-votes">
                    Gesamte Stimmen: ${totalVotes}
                </div>
            </div>
        `;
    }

    renderVoteButtons(survey) {
        return `
            <button onclick="surveyHandler.submitVote(${survey.id}, true)" class="vote-btn yes-btn">
                Ja <span class="vote-count">${survey.yes_votes || 0}</span>
            </button>
            <button onclick="surveyHandler.submitVote(${survey.id}, false)" class="vote-btn no-btn">
                Nein <span class="vote-count">${survey.no_votes || 0}</span>
            </button>
        `;
    }

    calculatePercentage(value, total) {
        if (!total) return 0;
        return Math.round((value / total) * 100 * 10) / 10; // Round to 1 decimal place
    }

    async submitVote(surveyId, vote) {
        try {
            const response = await this.api.submitVote(surveyId, vote);
            if (response.success) {
                this.showMessage('Stimme erfolgreich abgegeben', 'success');
                await this.loadSurveys(); // Reload to update counts
            } else {
                this.showMessage(response.message || 'Fehler beim Abstimmen', 'error');
            }
        } catch (error) {
            console.error('Error submitting vote:', error);
            this.showMessage('Fehler beim Abstimmen', 'error');
        }
    }

    showMessage(message, type = 'info') {
        const container = document.getElementById('messageContainer');
        if (!container) return;

        const messageElement = document.createElement('div');
        messageElement.className = `message ${type}`;
        messageElement.textContent = message;
        
        container.appendChild(messageElement);
        setTimeout(() => messageElement.remove(), 3000);
    }

    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    initializeCharts() {
        const surveys = document.querySelectorAll('.survey-card');
        const isDarkMode = document.documentElement.classList.contains('dark-mode');
        const textColor = isDarkMode ? '#F2F2F7' : '#1C1C1E';
        
        surveys.forEach(surveyCard => {
            const surveyId = surveyCard.dataset.id;
            const canvas = document.getElementById(`pieChart-${surveyId}`);
            if (!canvas) return;

            const yesVotes = parseInt(surveyCard.querySelector('.yes-bar .bar-value')?.textContent) || 0;
            const noVotes = parseInt(surveyCard.querySelector('.no-bar .bar-value')?.textContent) || 0;

            if (yesVotes === 0 && noVotes === 0) return;

            new Chart(canvas, {
                type: 'pie',
                data: {
                    labels: ['Ja', 'Nein'],
                    datasets: [{
                        data: [yesVotes, noVotes],
                        backgroundColor: ['#4CAF50', '#f44336']
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                color: textColor,
                                font: {
                                    size: 14
                                }
                            }
                        },
                        title: {
                            display: true,
                            color: textColor,
                            font: {
                                size: 16
                            }
                        }
                    }
                }
            });
        });
    }

    toggleMinimize(surveyId) {
        console.log('Toggling minimize for survey:', surveyId); // Debug log

        const card = document.querySelector(`.survey-card[data-id="${surveyId}"]`);
        const minimizedContainer = document.getElementById('minimized-surveys');
        const normalContainer = document.getElementById('completed-surveys-container');
        
        if (!card) {
            console.error('Card not found:', surveyId);
            return;
        }
        if (!minimizedContainer) {
            console.error('Minimized container not found');
            return;
        }
        if (!normalContainer) {
            console.error('Normal container not found');
            return;
        }

        const minimizeBtn = card.querySelector('.minimize-btn i');
        if (!minimizeBtn) {
            console.error('Minimize button not found');
            return;
        }

        try {
            if (card.classList.contains('minimized')) {
                // Maximize
                console.log('Maximizing card');
                card.classList.remove('minimized');
                minimizeBtn.classList.remove('fa-plus');
                minimizeBtn.classList.add('fa-minus');
                normalContainer.appendChild(card);
            } else {
                // Minimize
                console.log('Minimizing card');
                card.classList.add('minimized');
                minimizeBtn.classList.remove('fa-minus');
                minimizeBtn.classList.add('fa-plus');
                minimizedContainer.appendChild(card);
            }

            // Update container visibility
            minimizedContainer.style.display = 
                minimizedContainer.children.length > 0 ? 'flex' : 'none';

        } catch (error) {
            console.error('Error during minimize toggle:', error);
        }
    }

    getOrCreateMinimizedContainer() {
        let section = document.querySelector('.minimized-section');
        if (!section) {
            section = document.createElement('section');
            section.className = 'surveys-section minimized-section';
            section.innerHTML = `
                <h2>Minimierte Umfragen</h2>
                <div class="minimized-surveys-container"></div>
            `;
            document.querySelector('main').appendChild(section);
        }
        
        section.style.display = 'none'; // Hide initially
        return section.querySelector('.minimized-surveys-container');
    }
}

// Initialize handler when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.surveyHandler = new SurveyHandler();
});

async function submitSurvey(surveyId, answer) {
    if (!checkAuth()) return;

    try {
        const response = await fetch(`${CONFIG.API_BASE_URL}/api/surveys/respond`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                survey_id: surveyId,
                answer: answer
            }),
            credentials: 'include'
        });

        const data = await response.json();

        if (data.success) {
            // Update the UI to show the vote was recorded
            updateSurveyCard(surveyId, data.results);
        } else {
            throw new Error(data.error || 'Failed to submit vote');
        }
    } catch (error) {
        showError('Failed to submit your vote. Please try again.');
    }
}

function updateSurveyCard(surveyId, results) {
    const card = document.querySelector(`[data-survey-id="${surveyId}"]`);
    if (!card) return;

    // Disable voting buttons
    const voteButtons = card.querySelectorAll('.vote-btn');
    voteButtons.forEach(btn => btn.disabled = true);

    // Update results display
    const resultsContainer = card.querySelector('.results-container');
    const totalVotes = results.yes_votes + (results.total_votes - results.yes_votes);
    const yesPercentage = totalVotes > 0 ? (results.yes_votes / results.total_votes) * 100 : 0;
    
    resultsContainer.innerHTML = `
        <p>Ergebnisse:</p>
        <div class="results-bar">
            <div class="results-fill" style="width: ${yesPercentage}%"></div>
        </div>
        <p>Ja: ${results.yes_votes} (${Math.round(yesPercentage)}%) | 
           Nein: ${results.total_votes - results.yes_votes} (${Math.round(100 - yesPercentage)}%)</p>
    `;
    
    // Show success message
    showSuccess('Ihre Stimme wurde erfolgreich gespeichert!');
}

function showError(message) {
    const container = document.querySelector('.container');
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    container.insertBefore(errorDiv, container.firstChild);
    setTimeout(() => errorDiv.remove(), 5000);
}

function showSuccess(message) {
    const container = document.querySelector('.container');
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    container.insertBefore(successDiv, container.firstChild);
    setTimeout(() => successDiv.remove(), 5000);
}

// Check authentication state
function checkAuth() {
    const userType = sessionStorage.getItem('userType');
    if (!userType) {
        window.location.href = '../../login.html';
        return false;
    }
    return true;
}

// Add auth check when page loads
document.addEventListener('DOMContentLoaded', () => {
    if (!checkAuth()) return;

    // Update user type display
    const userTypeDisplay = document.getElementById('userTypeDisplay');
    const overlayUserType = document.getElementById('overlayUserType');
    const overlay = document.getElementById('overlay');

    if (userTypeDisplay && overlayUserType && overlay) {
        const userType = sessionStorage.getItem('userType');
        const userTypeText = userType === 'student' ? 'Schüler' : 'Lehrer';
        userTypeDisplay.textContent = userTypeText;
        
        let timeLeft = 3;
        overlayUserType.innerHTML = `
            <div class="overlay-text">Angemeldet als: ${userTypeText}</div>
            <div id="countdown">${timeLeft}</div>
            <div class="overlay-text">Sekunden verbleibend</div>
        `;
        
        overlay.style.display = 'flex';
        
        const countdownInterval = setInterval(() => {
            timeLeft--;
            const countdownElement = document.getElementById('countdown');
            if (countdownElement) {
                countdownElement.textContent = timeLeft;
                
                if (timeLeft <= 0) {
                    clearInterval(countdownInterval);
                    overlay.style.opacity = '0';
                    overlay.style.transition = 'opacity 0.5s';
                    setTimeout(() => {
                        overlay.style.display = 'none';
                    }, 500);
                }
            }
        }, 1000);
    }

    // Überprüfung des Benutzertyps für die Seite
    const userType = sessionStorage.getItem('userType');
    const isTeacherPage = window.location.pathname.includes('/teacher/');
    const isStudentPage = window.location.pathname.includes('/student/');

    if ((isTeacherPage && userType !== 'teacher') || (isStudentPage && userType !== 'student')) {
        window.location.href = '../../login.html';
    }
});

// Helper function to escape HTML and prevent XSS
function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/<//g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function formatDate(dateString) {
    if (!dateString) return 'Nicht verfügbar';
    
    try {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('de-DE', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    } catch (error) {
        console.error('Date formatting error:', error, 'for date:', dateString);
        return 'Nicht verfügbar';
    }
}