

function setupThemeSwitcher() {
    const storedTheme = localStorage.getItem('codecase-theme');
    if (storedTheme === 'light' || storedTheme === 'dark') {
        document.documentElement.dataset.theme = storedTheme;
    }

    if (!document.querySelector('.home')) return;

    const switcher = document.createElement('div');
    switcher.className = 'theme-switcher';
    switcher.setAttribute('aria-label', 'Escolher tema');
    switcher.innerHTML = `
        <button type="button" data-theme-choice="light" aria-label="Usar tema claro">Claro</button>
        <button type="button" data-theme-choice="dark" aria-label="Usar tema escuro">Escuro</button>
    `;
    document.body.appendChild(switcher);

    const buttons = switcher.querySelectorAll('[data-theme-choice]');
    const updateActiveTheme = () => {
        const activeTheme = document.documentElement.dataset.theme
            || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

        buttons.forEach(button => {
            button.setAttribute('aria-pressed', String(button.dataset.themeChoice === activeTheme));
        });
    };

    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const selectedTheme = button.dataset.themeChoice;
            document.documentElement.dataset.theme = selectedTheme;
            localStorage.setItem('codecase-theme', selectedTheme);
            updateActiveTheme();
        });
    });

    matchMedia('(prefers-color-scheme: dark)').addEventListener('change', updateActiveTheme);
    updateActiveTheme();
}

setupThemeSwitcher();


// Global Toast Notification Helper — Bloco: toasts
function showToast(message, isError = false) {
    const container = document.getElementById('toast__container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast__item ${isError ? 'toast__item--error' : ''}`;
    toast.innerText = (isError ? '[ERRO]' : '') + message;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        setTimeout(() => toast.remove(), 200);
    }, 3500);
}

// Utility: Format Date string
function formatDate(dateStr) {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

// Utility: Format File Size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>'"]/g, character => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    })[character]);
}

// Utility: Simple Markdown Formatter for Code Blocks & Headings
function parseMarkdown(mdText) {
    if (!mdText) return '';
    let html = escapeHtml(mdText);

    // Code blocks ```lang ... ```
    html = html.replace(/```([a-zA-Z0-9_+#-]*)\n([\s\S]*?)```/g, (match, lang, code) => {
        const cleanLang = lang || 'code';
        const escapedCode = code.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        return `<div class="markdown__code-header">[ CÓDIGO: ${cleanLang.toUpperCase()} ]</div><pre><code class="markdown__code--language-${cleanLang}">${escapedCode}</code></pre>`;
    });

    // Inline code `...`
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Headers ###, ##, #
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

    // Bold **text**
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

    // Italics *text*
    html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');

    // Linebreaks
    html = html.replace(/\n\n/g, '<br><br>');

    return html;
}

// Check admin navbar link state on load



