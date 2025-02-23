async function login() {
    const userType = document.getElementById('userType').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('errorMessage');

    try {
        const result = await api.login(userType, password);
        if (result.success) {
            document.getElementById('loginForm').style.display = 'none';
            document.getElementById('surveyContainer').style.display = 'block';
            await loadSurveys();
        } else {
            errorMessage.textContent = result.error || 'Login fehlgeschlagen';
            errorMessage.classList.add('visible');
        }
    } catch (error) {
        console.error('Login error:', error);
        errorMessage.textContent = 'Ein Fehler ist aufgetreten';
        errorMessage.classList.add('visible');
    }
}

async function loadSurveys() {
    try {
        const result = await api.getSurveys();
        const container = document.getElementById('surveyContainer');
        container.innerHTML = '';

        result.surveys.forEach(survey => {
            container.innerHTML += `
                <div class="survey-card">
                    <h3>${survey.title}</h3>
                    <p>${survey.question_text}</p>
                    <button onclick="submitVote(${survey.id}, true)">Ja</button>
                    <button onclick="submitVote(${survey.id}, false)">Nein</button>
                </div>
            `;
        });
    } catch (error) {
        alert('Fehler beim Laden der Umfragen');
    }
}

async function submitVote(surveyId, vote) {
    try {
        const result = await api.submitVote(surveyId, vote);
        if (result.success) {
            alert('Abstimmung erfolgreich');
            loadSurveys();
        }
    } catch (error) {
        alert('Fehler bei der Abstimmung');
    }
}

function updateUserTypeDisplay() {
    const userType = sessionStorage.getItem('userType');
    const display = document.getElementById('userTypeDisplay');
    
    if (display) {
        let label = 'Unbekannt';
        switch(userType) {
            case 'teacher':
                label = 'Lehrer';
                break;
            case 'student':
                label = 'Schüler';
                break;
            case 'admin':
                label = 'Administrator';
                break;
        }
        display.textContent = `Angemeldet als: ${label}`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    updateUserTypeDisplay();
});
