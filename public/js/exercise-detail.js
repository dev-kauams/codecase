/* ===================================================
   CodeCase - Exercise Detail View Script
   Author: @dev-kauams
   =================================================== */

document.addEventListener('DOMContentLoaded', async () => {
    const pathParts = window.location.pathname.split('/');
    const exerciseId = pathParts[pathParts.length - 1];

    if (!exerciseId) return;

    try {
        const res = await fetch(`/api/exercises/${exerciseId}`);
        const data = await res.json();

        if (!res.ok || !data.success) {
            throw new Error(data.error || 'Exercício não encontrado.');
        }

        const ex = data.data;
        document.title = `CodeCase - ${ex.title}`;

        // Header and metadata
        const paddedId = String(ex.id).padStart(3, '0');
        document.getElementById('ex-id-badge').innerText = `EXERCÍCIO #${paddedId}`;
        document.getElementById('ex-title').innerText = ex.title;
        document.getElementById('ex-date').innerText = formatDate(ex.created_at);

        // Difficulty badge — BEM classes
        const diffClass = ex.difficulty === 'Fácil' ? 'badge--easy' : (ex.difficulty === 'Médio' ? 'badge--medium' : 'badge--hard');
        document.getElementById('ex-difficulty-badge').innerHTML = `<span class="badge ${diffClass}" style="font-size: 0.9rem; padding: 4px 12px;">${ex.difficulty.toUpperCase()}</span>`;

        // Stacks & Tags — BEM classes
        const stacksContainer = document.getElementById('ex-stacks-container');
        stacksContainer.innerHTML = (ex.stacks || []).map(s => `<span class="badge badge--stack">${s.name}</span>`).join(' ');

        const tagsContainer = document.getElementById('ex-tags-container');
        tagsContainer.innerHTML = (ex.tags || []).map(t => `<span class="badge badge--tag">#${t.name}</span>`).join(' ');

        // Summary
        document.getElementById('ex-summary').innerText = ex.summary;

        // Image
        if (ex.image_url) {
            const imgWrapper = document.getElementById('ex-image-wrapper');
            const imgEl = document.getElementById('ex-image');
            imgEl.src = ex.image_url;
            imgWrapper.style.display = 'block';
        }

        // Formatted Statement Content
        const statementContainer = document.getElementById('ex-statement');
        statementContainer.innerHTML = parseMarkdown(ex.statement);

        // Attachments — BEM classes
        if (ex.attachments && ex.attachments.length > 0) {
            const attSection = document.getElementById('attachments-section');
            const attList = document.getElementById('attachments-list');

            attList.innerHTML = ex.attachments.map(att => `
                <div class="attachments__item">
                    <div>
                        <span class="attachments__name">📄 ${att.original_name}</span>
                        <span style="font-size: 0.75rem; color: var(--color-text-muted); margin-left: 12px;">(${formatFileSize(att.file_size)})</span>
                    </div>
                    <a href="${att.file_path}" download="${att.original_name}" class="btn btn--accent" style="font-size: 0.75rem; padding: 4px 10px;">
                        ⬇️ DOWNLOAD
                    </a>
                </div>
            `).join('');

            attSection.style.display = 'block';
        }

    } catch (err) {
        document.getElementById('ex-title').innerText = '⚠️ ERRO AO CARREGAR PERGAMINHO';
        document.getElementById('ex-statement').innerHTML = `
            <div class="empty">
                <p style="color: var(--color-primary);">${err.message}</p>
                <a href="/" class="btn" style="margin-top: 16px; display: inline-block;">← VOLTAR AO SCRIPTORIUM</a>
            </div>
        `;
    }
});
