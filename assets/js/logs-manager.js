function formatDate(timestamp) {
    // Handle different timestamp formats
    try {
        // If timestamp is already a Date object
        if (timestamp instanceof Date) {
            return new Intl.DateTimeFormat('de-DE', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            }).format(timestamp);
        }

        // Handle PHP log format (e.g. "19-Feb-2025 11:11:44")
        if (typeof timestamp === 'string' && timestamp.includes('-')) {
            const [datePart, timePart] = timestamp.split(' ');
            const [day, month, year] = datePart.split('-');
            
            // Convert month name to number
            const months = {
                'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
                'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
            };
            
            const [hours, minutes, seconds] = timePart ? timePart.split(':') : [0, 0, 0];
            const date = new Date(year, months[month], parseInt(day), 
                                parseInt(hours), parseInt(minutes), parseInt(seconds));
            
            if (!isNaN(date.getTime())) {
                return new Intl.DateTimeFormat('de-DE', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                }).format(date);
            }
        }

        // Handle MySQL/ISO timestamp (e.g. "2025-02-19 11:11:44")
        if (typeof timestamp === 'string') {
            const date = new Date(timestamp.replace(' ', 'T'));
            if (!isNaN(date.getTime())) {
                return new Intl.DateTimeFormat('de-DE', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                }).format(date);
            }
        }

        throw new Error('Invalid date format');
    } catch (error) {
        console.warn('Date formatting error:', error, 'for timestamp:', timestamp);
        return 'Ungültiges Datum';
    }
}

class LogsManager {
    constructor() {
        this.api = new Api();
        this.currentPage = 1;
        this.itemsPerPage = 20;
        this.currentSource = 'activity';
        this.setupEventListeners();
        this.setupSourceDependendElements();
        this.loadLogs();
    }

    setupEventListeners() {
        document.getElementById('logType')?.addEventListener('change', () => this.loadLogs());
        document.getElementById('dateFilter')?.addEventListener('change', () => this.loadLogs());
        document.getElementById('clearFilters')?.addEventListener('click', () => this.clearFilters());
        document.getElementById('refreshLogs')?.addEventListener('click', () => this.loadLogs());
        document.getElementById('prevPage')?.addEventListener('click', () => this.changePage(-1));
        document.getElementById('nextPage')?.addEventListener('click', () => this.changePage(1));
        document.getElementById('logSource')?.addEventListener('change', () => this.handleSourceChange());
        document.getElementById('severityFilter')?.addEventListener('change', () => this.loadLogs());
        document.getElementById('downloadLogs')?.addEventListener('click', () => this.downloadCurrentLogs());
    }

    setupSourceDependendElements() {
        const source = document.getElementById('logSource').value;
        const typeFilter = document.getElementById('logType');
        const severityFilter = document.getElementById('severityFilter');
        
        if (source === 'activity') {
            typeFilter.style.display = 'inline-block';
            severityFilter.style.display = 'none';
        } else {
            typeFilter.style.display = 'none';
            severityFilter.style.display = 'inline-block';
        }
    }

    handleSourceChange() {
        this.currentSource = document.getElementById('logSource').value;
        this.setupSourceDependendElements();
        this.currentPage = 1;
        this.loadLogs();
    }

    async loadLogs() {
        try {
            const source = document.getElementById('logSource').value;
            const type = document.getElementById('logType')?.value || 'all';
            const date = document.getElementById('dateFilter')?.value || '';
            const severity = document.getElementById('severityFilter')?.value || 'all';

            this.updateTableHeaders(source);

            let response;
            switch (source) {
                case 'activity':
                    response = await this.api.getLogs({
                        page: this.currentPage,
                        type: type === 'all' ? null : type,
                        date: date || null
                    });
                    break;
                case 'error':
                    response = await this.api.getLogs({
                        page: this.currentPage,
                        source: 'error',
                        severity: severity === 'all' ? null : severity,
                        date: date || null
                    });
                    break;
                case 'php':
                    response = await this.api.getLogs({
                        page: this.currentPage,
                        source: 'php',
                        severity: severity === 'all' ? null : severity,
                        date: date || null,
                        logFile: 'error.log'  // Specify the log file to read
                    });
                    break;
            }

            if (response?.success) {
                this.renderLogs(response.data.logs || []);
                this.updatePagination(response.data.total || 0);
            } else {
                this.showError('Fehler beim Laden der Logs: ' + (response?.error || 'Unbekannter Fehler'));
            }
        } catch (error) {
            console.error('Error loading logs:', error);
            this.showError('Fehler beim Laden der Logs');
        }
    }

    async downloadCurrentLogs() {
        try {
            const source = document.getElementById('logSource').value;
            const response = await this.api.downloadLogs(source);
            
            if (response.success) {
                const blob = new Blob([response.data], { type: 'text/plain' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${source}-logs-${new Date().toISOString().split('T')[0]}.txt`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            } else {
                this.showError('Fehler beim Herunterladen der Logs');
            }
        } catch (error) {
            console.error('Error downloading logs:', error);
            this.showError('Fehler beim Herunterladen der Logs');
        }
    }

    renderLogs(logs) {
        const tbody = document.getElementById('logsBody');
        if (!tbody) return;

        // Sort logs by timestamp in descending order (newest first)
        const sortedLogs = [...logs].sort((a, b) => {
            const dateA = new Date(a.timestamp);
            const dateB = new Date(b.timestamp);
            return dateB - dateA;
        });

        tbody.innerHTML = sortedLogs.map(log => {
            switch (this.currentSource) {
                case 'activity':
                    return this.renderActivityLogRow(log);
                case 'error':
                    return this.renderErrorLogRow(log);
                case 'php':
                    return this.renderPhpLogRow(log);
            }
        }).join('');
    }

    renderErrorLogRow(log) {
        if (!log) return '';
        
        const severity = log.severity?.toLowerCase() || 'error';
        return `
            <tr class="severity-${severity}">
                <td>${formatDate(log.timestamp || new Date())}</td>
                <td>${this.escapeHtml(log.severity || 'Error')}</td>
                <td>${this.escapeHtml(log.message || '')}</td>
                <td>${this.escapeHtml(log.file || '')}${log.line ? `:${log.line}` : ''}</td>
                <td>${this.escapeHtml(log.trace || '')}</td>
            </tr>
        `;
    }

    renderPhpLogRow(log) {
        if (!log) return '';
        
        const severity = log.severity?.toLowerCase() || 'info';
        try {
            let formattedDate;
            try {
                formattedDate = formatDate(log.timestamp);
            } catch (dateError) {
                console.warn('Error formatting date:', dateError);
                formattedDate = 'Ungültiges Datum';
            }

            return `
                <tr class="severity-${severity}">
                    <td>${formattedDate}</td>
                    <td class="severity-${severity}">${this.escapeHtml(log.severity)}</td>
                    <td>${this.escapeHtml(log.message)}</td>
                    <td>${this.escapeHtml(log.source)}</td>
                    <td>${this.escapeHtml(log.details)}</td>
                </tr>
            `;
        } catch (error) {
            console.error('Error rendering PHP log row:', error);
            return `
                <tr class="severity-error">
                    <td colspan="5">Fehler beim Anzeigen des Log-Eintrags: ${this.escapeHtml(error.message)}</td>
                </tr>
            `;
        }
    }

    renderActivityLogRow(log) {
        if (!log) return '';
        
        let formattedDate;
        try {
            formattedDate = formatDate(log.timestamp);
        } catch (error) {
            console.warn('Error formatting activity log date:', error);
            formattedDate = 'Ungültiges Datum';
        }
        
        return `
            <tr>
                <td>${formattedDate}</td>
                <td>${this.escapeHtml(log.type || '')}</td>
                <td>${this.escapeHtml(log.description || '')}</td>
                <td>${this.escapeHtml(log.ip_address || '')}</td>
                <td class="${getStatusClass(log.status || 'info')}">${this.escapeHtml(log.status || '')}</td>
            </tr>
        `;
    }

    getLogTypeLabel(type) {
        const labels = {
            auth: 'Auth',
            survey: 'Umfrage',
            votes: 'Abstimmung',
            system: 'System'
        };
        return labels[type] || type;
    }

    getStatusLabel(status) {
        const labels = {
            success: 'Erfolgreich',
            error: 'Fehler',
            warning: 'Warnung',
            info: 'Info'
        };
        return labels[status] || status;
    }

    escapeHtml(unsafe) {
        if (!unsafe) return '';
        return unsafe
            .toString()
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    clearFilters() {
        document.getElementById('logType').value = 'all';
        document.getElementById('dateFilter').value = '';
        this.loadLogs();
    }

    changePage(delta) {
        this.currentPage += delta;
        this.loadLogs();
    }

    updatePagination(total) {
        const totalPages = Math.ceil(total / this.itemsPerPage);
        document.getElementById('pageInfo').textContent = `Seite ${this.currentPage} von ${totalPages}`;
        document.getElementById('prevPage').disabled = this.currentPage <= 1;
        document.getElementById('nextPage').disabled = this.currentPage >= totalPages;
    }

    showError(message) {
        const container = document.getElementById('messageContainer');
        if (!container) return;

        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        container.appendChild(errorDiv);
        setTimeout(() => errorDiv.remove(), 5000);
    }

    updateTableHeaders(source) {
        const thead = document.querySelector('#logsTable thead tr');
        if (!thead) return;

        let headers;
        switch (source) {
            case 'activity':
                headers = ['Zeitstempel', 'Typ', 'Beschreibung', 'IP-Adresse', 'Status'];
                break;
            case 'error':
                headers = ['Zeitstempel', 'Schweregrad', 'Nachricht', 'Datei:Zeile', 'Stack Trace'];
                break;
            case 'php':
                headers = ['Zeitstempel', 'Schweregrad', 'Nachricht', 'Quelle', 'Details'];
                break;
            default:
                headers = ['Zeitstempel', 'Typ', 'Nachricht', 'Details', 'Status'];
        }

        thead.innerHTML = headers.map(header => `<th>${header}</th>`).join('');
    }

    parsePHPLogEntry(line) {
        const regex = /\[(.*?)\] (.+)/;
        const match = line.match(regex);
        
        if (match) {
            const [_, timestamp, message] = match;
            let severity = 'info';
            
            // Determine severity based on message content
            if (message.toLowerCase().includes('error')) severity = 'error';
            else if (message.toLowerCase().includes('warning')) severity = 'warning';
            else if (message.toLowerCase().includes('notice')) severity = 'notice';

            return {
                timestamp: new Date(timestamp.replace(' Europe/Berlin', '')),
                message: message,
                severity: severity,
                source: 'PHP',
                details: ''
            };
        }
        return null;
    }
}

function getStatusClass(status) {
    switch(status.toLowerCase()) {
        case 'info': return 'status-info';
        case 'success': return 'status-success';
        case 'warning': return 'status-warning';
        case 'error': return 'status-error';
        default: return 'status-info';
    }
}

// Initialize logs manager
document.addEventListener('DOMContentLoaded', () => {
    new LogsManager();
});