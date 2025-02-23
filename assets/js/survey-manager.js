class SurveyManager {
    constructor() {
        if (window.surveyManagerInstance) {
            return window.surveyManagerInstance;
        }

        this.api = new Api();
        this.setupEventListeners();
        this.loadSurveys();
        window.surveyManagerInstance = this;
    }

    setupEventListeners() {
        const modal = document.getElementById('createSurveyModal');
        const createBtn = document.getElementById('createSurveyBtn');
        const closeBtn = document.querySelector('.close-btn');
        const cancelBtn = document.querySelector('.cancel-btn');
        const form = document.getElementById('createSurveyForm');

        if (!modal || !createBtn || !form) {
            console.error('Required elements not found');
            return;
        }

        // Modal handlers
        const openModal = () => {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        };

        const closeModal = () => {
            modal.classList.remove('active');
            document.body.style.overflow = '';
            form.reset();
        };

        // Form submission handler
        const handleSubmit = async (e) => {
            e.preventDefault();
            
            try {
                const title = document.getElementById('surveyTitle').value.trim();
                const description = document.getElementById('surveyDescription').value.trim();

                if (!title || !description) {
                    throw new Error('Titel und Beschreibung sind erforderlich');
                }

                const response = await this.api.createSurvey(title, description);
                
                if (response.success) {
                    this.showMessage('Umfrage wurde erfolgreich erstellt', 'success');
                    closeModal();
                    await this.loadSurveys();
                } else {
                    throw new Error(response.error || 'Fehler beim Erstellen der Umfrage');
                }
            } catch (error) {
                this.showMessage(error.message, 'error');
                console.error('Survey creation error:', error);
            }
        };

        // Event listeners
        createBtn.addEventListener('click', openModal);
        closeBtn?.addEventListener('click', closeModal);
        cancelBtn?.addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
        form.addEventListener('submit', handleSubmit);
    }

    showMessage(message, type = 'info') {
        const container = document.getElementById('messageContainer');
        if (!container) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.textContent = message;
        
        container.appendChild(messageDiv);

        setTimeout(() => {
            messageDiv.classList.add('fade-out');
            setTimeout(() => messageDiv.remove(), 300);
        }, 3000);
    }

    removeEventListeners() {
        const createBtn = document.getElementById('createSurveyBtn');
        const surveyForm = document.getElementById('surveyForm');

        createBtn?.removeEventListener('click', this.handleCreateClick);
        surveyForm?.removeEventListener('submit', this.handleSubmit);
    }

    async createSurvey(form) {
        try {
            const title = form.querySelector('#surveyTitle')?.value.trim();
            const description = form.querySelector('#surveyDescription')?.value.trim();

            if (!title || !description) {
                throw new Error('Titel und Beschreibung sind erforderlich');
            }

            console.log('Creating survey:', { title, description });
            await this.api.createSurvey(title, description);
            this.handleClose();
            await this.loadSurveys();
            this.showMessage('Umfrage erfolgreich erstellt', 'success');
        } catch (error) {
            console.error('Survey creation error:', error);
            this.showMessage('Fehler beim Erstellen der Umfrage: ' + error.message, 'error');
        }
    }

    async loadSurveys() {
        try {
            const surveys = await this.api.getSurveys();
            this.renderSurveys(surveys);
        } catch (error) {
            this.showMessage('Fehler beim Laden der Umfragen', 'error');
        }
    }

    renderSurveys(surveys) {
        const grid = document.getElementById('surveysGrid');
        grid.innerHTML = surveys.map(survey => `
            <div class="survey-card" data-id="${survey.id}">
                <h3>${survey.title}</h3>
                <p>${survey.description}</p>
                <div class="survey-status">Status: ${survey.status}</div>
                <div class="survey-actions">
                    ${this.getStatusButtons(survey)}
                    <button onclick="surveyManager.deleteSurvey(${survey.id})" class="delete-btn">Löschen</button>
                </div>
            </div>
        `).join('');
    }

    getStatusButtons(survey) {
        if (survey.status === 'pending') {
            return `<button onclick="surveyManager.updateStatus(${survey.id}, 'active')" class="activate-btn">Aktivieren</button>`;
        } else if (survey.status === 'active') {
            return `<button onclick="surveyManager.updateStatus(${survey.id}, 'completed')" class="complete-btn">Abschließen</button>`;
        }
        return '';
    }

    async updateStatus(surveyId, status) {
        try {
            await this.api.updateSurveyStatus(surveyId, status);
            await this.loadSurveys();
            this.showMessage('Status erfolgreich aktualisiert', 'success');
        } catch (error) {
            this.showMessage('Fehler beim Aktualisieren des Status', 'error');
        }
    }
}

// Clean initialization
document.addEventListener('DOMContentLoaded', () => {
    window.surveyManagerInstance = null;
    window.surveyManager = new SurveyManager();
});