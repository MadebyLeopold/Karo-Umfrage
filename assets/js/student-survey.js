class StudentSurveyHandler {
    constructor() {
        this.modal = document.getElementById('submitSurveyModal');
        this.form = document.getElementById('submitSurveyForm');
        this.submitBtn = document.getElementById('submitSurveyBtn');
        this.api = new Api(); // Add API instance
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
            tag: 'student'
        };

        try {
            await this.api.submitStudentSurvey(formData);
            this.closeModal();
            showMessage('Umfrage erfolgreich eingereicht', 'success');
            // Reload surveys after submission
            if (window.surveyHandler) {
                await window.surveyHandler.loadSurveys();
            }
        } catch (error) {
            console.error('Error submitting survey:', error);
            showMessage('Fehler beim Einreichen der Umfrage', 'error');
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new StudentSurveyHandler();
});