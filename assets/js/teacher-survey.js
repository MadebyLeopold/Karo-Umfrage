class TeacherSurveyHandler {
    constructor() {
        this.modal = document.getElementById('submitSurveyModal');
        this.form = document.getElementById('submitSurveyForm');
        this.submitBtn = document.getElementById('submitSurveyBtn');
        this.api = new Api();
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.submitBtn.addEventListener('click', () => this.openModal());
        this.modal.querySelector('.close-btn').addEventListener('click', () => this.closeModal());
        this.modal.querySelector('.cancel-btn').addEventListener('click', () => this.closeModal());
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    openModal() {
        this.modal.classList.add('active');
    }

    closeModal() {
        this.modal.classList.remove('active');
        this.form.reset();
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        const formData = {
            title: this.form.querySelector('#surveyTitle').value,
            description: this.form.querySelector('#surveyDescription').value,
            type: 'yes-no',
            tag: 'teacher' // Set tag as teacher
        };

        try {
            await this.api.submitTeacherSurvey(formData);
            this.closeModal();
            showMessage('Umfrage erfolgreich erstellt', 'success');
            // Reload surveys after submission
            if (window.surveyHandler) {
                await window.surveyHandler.loadSurveys();
            }
        } catch (error) {
            console.error('Error creating survey:', error);
            showMessage('Fehler beim Erstellen der Umfrage', 'error');
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TeacherSurveyHandler();
});