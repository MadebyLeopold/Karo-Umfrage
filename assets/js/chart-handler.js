let currentChart = null;

function showChartModal(surveyId) {
    const modal = document.getElementById('chartModal');
    modal.dataset.surveyId = surveyId; // Store the survey ID
    modal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
    loadChartData(surveyId, 'pie'); // Default to pie chart
}

async function loadChartData(surveyId, chartType) {
    const chartContainer = document.querySelector('.chart-container');
    
    try {
        // Reset chart container with canvas
        if (chartContainer) {
            chartContainer.innerHTML = `
                <canvas id="resultsChart"></canvas>
                <div class="loading">
                    <div class="spinner"></div>
                    <p>Lade Umfrageergebnisse...</p>
                </div>`;
        }

        const surveyData = await api.getSurveyResults(surveyId);
        
        if (!surveyData || !surveyData.success) {
            throw new Error('Keine Daten verfügbar');
        }

        // Remove loading state
        const loadingElement = chartContainer.querySelector('.loading');
        if (loadingElement) {
            loadingElement.remove();
        }

        updateChart({
            yesVotes: surveyData.yesVotes,
            noVotes: surveyData.noVotes,
            title: surveyData.title
        }, chartType);
    } catch (error) {
        console.error('Error loading chart data:', error);
        
        if (chartContainer) {
            chartContainer.innerHTML = `
                <div class="chart-error">
                    <svg class="error-icon" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                    </svg>
                    <p>${error.message}</p>
                    <button onclick="retryLoadChart()" class="retry-btn">
                        <span>↻</span> Erneut versuchen
                    </button>
                </div>
            `;
        }
    }
}

// Add retry function
function retryLoadChart() {
    const modal = document.getElementById('chartModal');
    const surveyId = modal.dataset.surveyId;
    const activeChartType = document.querySelector('.chart-type-btn.active')?.dataset.type || 'pie';
    loadChartData(surveyId, activeChartType);
}

function updateChart(data, type) {
    const canvas = document.getElementById('resultsChart');
    if (!canvas) {
        console.error('Chart canvas not found');
        return;
    }

    // Get the container dimensions
    const container = canvas.parentElement;
    canvas.width = container.offsetWidth;
    canvas.height = container.offsetHeight;

    // Destroy existing chart if it exists
    if (currentChart) {
        currentChart.destroy();
    }

    const ctx = canvas.getContext('2d');
    const isDarkMode = document.documentElement.classList.contains('dark-mode');
    const textColor = isDarkMode ? '#F2F2F7' : '#1C1C1E';

    const config = {
        type: type,
        data: {
            labels: ['Ja', 'Nein'],
            datasets: [{
                label: 'Abstimmungen', // Add this line to show proper legend
                data: [data.yesVotes, data.noVotes],
                backgroundColor: [
                    'rgba(52, 199, 89, 0.8)',   // Green for Yes
                    'rgba(255, 59, 48, 0.8)'    // Red for No
                ],
                borderColor: [
                    'rgba(52, 199, 89, 1)',
                    'rgba(255, 59, 48, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    onClick: function(e, legendItem, legend) {
                        const index = legendItem.datasetIndex;
                        const ci = legend.chart;
                        const meta = ci.getDatasetMeta(0);
                        
                        // Toggle visibility of the clicked item
                        const alreadyHidden = meta.data[legendItem.index].hidden;
                        meta.data[legendItem.index].hidden = !alreadyHidden;
                        
                        // Update the chart
                        ci.update();
                    },
                    labels: {
                        color: textColor,
                        font: {
                            size: 14,
                            weight: '500'  // Added for better visibility
                        },
                        usePointStyle: true,
                        padding: 15,  // Added for better spacing
                        generateLabels: function(chart) {
                            const datasets = chart.data.datasets;
                            return chart.data.labels.map((label, i) => ({
                                text: label,
                                fillStyle: datasets[0].backgroundColor[i],
                                strokeStyle: datasets[0].borderColor[i],
                                lineWidth: 1,
                                hidden: chart.getDatasetMeta(0).data[i].hidden || false,
                                index: i,
                                textColor: textColor,  // Ensure the text color is explicitly set
                                fontColor: textColor // Force text color for legend items
                            }));
                        }
                    }
                },
                
                title: {
                    display: true,
                    text: data.title || 'Umfrageergebnisse', // Add fallback title
                    color: textColor,
                    font: {
                        size: 16,
                        weight: 'bold'
                    },
                    padding: 20
                }
            }
        }
    };

    // Specific options for different chart types
    if (type === 'bar') {
        config.options.scales = {
            y: {
                beginAtZero: true,
                ticks: {
                    color: textColor
                },
                grid: {
                    color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                }
            },
            x: {
                ticks: {
                    color: textColor
                },
                grid: {
                    display: false
                }
            }
        };
    } else if (type === 'line') {
        config.data.datasets[0].tension = 0.4;
        config.data.datasets[0].fill = true;
    }

    // Create new chart
    try {
        currentChart = new Chart(ctx, config);
    } catch (error) {
        console.error('Failed to create chart:', error);
        const chartContainer = document.querySelector('.chart-container');
        if (chartContainer) {
            chartContainer.innerHTML = `
                <div class="chart-error">
                    <p>Fehler beim Erstellen des Diagramms</p>
                </div>
            `;
        }
    }
}

// Initialize event listeners
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('chartModal');
    const closeBtn = modal.querySelector('.close-btn');
    const chartButtons = document.querySelectorAll('.chart-type-btn');

    closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
        document.body.style.overflow = ''; // Restore scrolling
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    });

    chartButtons.forEach(button => {
        button.addEventListener('click', () => {
            const surveyId = modal.dataset.surveyId;
            const chartType = button.dataset.type;
            
            // Update active button state
            chartButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            loadChartData(surveyId, chartType);
        });
    });
});

function showMessage(message, type = 'info') {
    const container = document.getElementById('messageContainer');
    if (!container) return;

    const messageElement = document.createElement('div');
    messageElement.className = `message ${type}`;
    messageElement.textContent = message;
    
    container.appendChild(messageElement);
    setTimeout(() => messageElement.remove(), 3000);
}

function formatDate(dateString) {
    if (!dateString) return 'Nicht verfügbar';
    
    try {
        // Parse the MySQL datetime format
        const [datePart, timePart] = dateString.split(' ');
        const [year, month, day] = datePart.split('-');
        const [hours, minutes, seconds] = timePart.split(':');
        
        const date = new Date(year, month - 1, day, hours, minutes, seconds);
        
        return new Intl.DateTimeFormat('de-DE', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    } catch (error) {
        console.error('Date formatting error:', error, dateString);
        return 'Nicht verfügbar';
    }
}

function displaySurveys(surveys) {
    const completedContainer = document.getElementById('completed-surveys-container');
    if (!completedContainer) return;

    const completedSurveys = surveys.filter(survey => survey.status === 'completed');
    
    completedContainer.innerHTML = completedSurveys.map(survey => `
        <div class="survey-card" data-id="${survey.id}">
            <h3>${survey.title}</h3>
            <p>${survey.description}</p>
            <div class="survey-meta">
                <span class="date-info">
                    <i class="far fa-calendar"></i> Erstellt: ${formatDate(survey.created_at)}
                </span>
                ${survey.updated_at ? `
                    <span class="date-info">
                        <i class="far fa-clock"></i> Aktualisiert: ${formatDate(survey.updated_at)}
                    </span>
                ` : ''}
                ${survey.completed_at ? `
                    <span class="date-info completed">
                        <i class="fas fa-check-circle"></i> Abgeschlossen: ${formatDate(survey.completed_at)}
                    </span>
                ` : ''}
            </div>
            <div class="survey-results">
                <div class="vote-counts">
                    <span>Ja: ${survey.yes_votes || 0}</span>
                    <span>Nein: ${survey.no_votes || 0}</span>
                </div>
            </div>
            <div class="survey-actions">
                <button onclick="showChartModal(${survey.id})" class="chart-btn">
                    <span class="chart-icon">📊</span> Ergebnisse visualisieren
                </button>
            </div>
        </div>
    `).join('') || '<p class="no-surveys">Keine abgeschlossenen Umfragen verfügbar</p>';
}