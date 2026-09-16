/* ===================================================
   CodeCase - Admin Dashboard Management Script
   Author: @dev-kauams
   =================================================== */

document.addEventListener('DOMContentLoaded', async () => {
    // Verify admin authentication
    try {
        const authRes = await fetch('/api/auth/me');
        if (!authRes.ok) {
            window.location.href = '/admin/login';
            return;
        }
    } catch (e) {
        window.location.href = '/admin/login';
        return;
    }

    const tableBody = document.getElementById('dashboard__exercise-table-body');
    const submissionTableBody = document.getElementById('dashboard__submission-table-body');
    const submissionCount = document.getElementById('dashboard__submission-count');
    const btnLogout = document.getElementById('dashboard__logout');

    // Modals
    const deleteModal = document.getElementById('dashboard__delete-modal');
    const deleteModalText = document.getElementById('dashboard__delete-modal-text');
    const btnConfirmDelete = document.getElementById('dashboard__confirm-delete');
    const btnCancelDelete = document.getElementById('dashboard__cancel-delete');
    let pendingDeleteId = null;

    const tagModal = document.getElementById('dashboard__tag-modal');
    const btnNewTagModal = document.getElementById('dashboard__new-tag-modal');
    const btnCancelTag = document.getElementById('dashboard__cancel-tag');
    const btnSaveTag = document.getElementById('dashboard__save-tag');
    const newTagNameInput = document.getElementById('dashboard__new-tag-name');

    const stackModal = document.getElementById('dashboard__stack-modal');
    const btnNewStackModal = document.getElementById('dashboard__new-stack-modal');
    const btnCancelStack = document.getElementById('dashboard__cancel-stack');
    const btnSaveStack = document.getElementById('dashboard__save-stack');
    const newStackNameInput = document.getElementById('dashboard__new-stack-name');
    const newStackColorInput = document.getElementById('dashboard__new-stack-color');

    // Load Metrics Stats
    loadStats();

    // Load Exercises Table
    loadExercisesTable();
    loadSubmissions();
    loadTaxonomies();

    // Logout
    if (btnLogout) {
        btnLogout.addEventListener('click', async () => {
            try {
                await fetch('/api/auth/logout', { method: 'POST' });
                showToast('Sessão encerrada com sucesso.');
                setTimeout(() => window.location.href = '/admin/login', 500);
            } catch (e) {
                window.location.href = '/admin/login';
            }
        });
    }

    // Modal Triggers
    if (btnNewTagModal) btnNewTagModal.addEventListener('click', () => { tagModal.style.display = 'flex'; newTagNameInput.focus(); });
    if (btnCancelTag) btnCancelTag.addEventListener('click', () => { tagModal.style.display = 'none'; newTagNameInput.value = ''; });

    if (btnNewStackModal) btnNewStackModal.addEventListener('click', () => { stackModal.style.display = 'flex'; newStackNameInput.focus(); });
    if (btnCancelStack) btnCancelStack.addEventListener('click', () => { stackModal.style.display = 'none'; newStackNameInput.value = ''; });

    if (btnCancelDelete) btnCancelDelete.addEventListener('click', () => { deleteModal.style.display = 'none'; pendingDeleteId = null; });

    // Save New Tag
    if (btnSaveTag) {
        btnSaveTag.addEventListener('click', async () => {
            const name = newTagNameInput.value.trim();
            if (!name) return showToast('Digite o nome da tag.', true);

            try {
                const res = await fetch('/api/tags', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name })
                });

                const data = await res.json();
                if (!res.ok || !data.success) throw new Error(data.error || 'Erro ao criar tag.');

                showToast(`Tag "${data.data.name}" criada com sucesso!`);
                tagModal.style.display = 'none';
                newTagNameInput.value = '';
                loadStats();
            } catch (err) {
                showToast(err.message, true);
            }
        });
    }

    // Save New Stack
    if (btnSaveStack) {
        btnSaveStack.addEventListener('click', async () => {
            const name = newStackNameInput.value.trim();
            const color = newStackColorInput.value;
            if (!name) return showToast('Digite o nome da stack.', true);

            try {
                const res = await fetch('/api/stacks', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, color })
                });

                const data = await res.json();
                if (!res.ok || !data.success) throw new Error(data.error || 'Erro ao criar stack.');

                showToast(`Stack "${data.data.name}" criada com sucesso!`);
                stackModal.style.display = 'none';
                newStackNameInput.value = '';
                loadStats();
            } catch (err) {
                showToast(err.message, true);
            }
        });
    }

    // Confirm Delete Exercise
    if (btnConfirmDelete) {
        btnConfirmDelete.addEventListener('click', async () => {
            if (!pendingDeleteId) return;

            try {
                const res = await fetch(`/api/exercises/${pendingDeleteId}`, { method: 'DELETE' });
                const data = await res.json();

                if (!res.ok || !data.success) throw new Error(data.error || 'Erro ao excluir exercício.');

                showToast('Exercício excluído com sucesso.');
                deleteModal.style.display = 'none';
                pendingDeleteId = null;
                loadExercisesTable();
                loadStats();
            } catch (err) {
                showToast(err.message, true);
                deleteModal.style.display = 'none';
            }
        });
    }

    // Load Stats function
    async function loadStats() {
        try {
            const res = await fetch('/api/admin/stats');
            const data = await res.json();

            if (data.success) {
                document.getElementById('dashboard__stat-exercises').innerText = data.data.totalExercises;
                document.getElementById('dashboard__stat-stacks').innerText = data.data.totalStacks;
                document.getElementById('dashboard__stat-tags').innerText = data.data.totalTags;
            }
        } catch (e) {}
    }

    // Load Exercises Table — BEM classes nas templates
    async function loadExercisesTable() {
        try {
            const res = await fetch('/api/exercises');
            const data = await res.json();

            if (!res.ok || !data.success) throw new Error(data.error || 'Erro ao carregar lista de exercícios.');

            const exercises = data.data;

            if (exercises.length === 0) {
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="7" class="dashboard__table-cell">
                            Nenhum exercício cadastrado. Clique em <strong>+ CRIAR EXERCÍCIO</strong> para adicionar o primeiro.
                        </td>
                    </tr>
                `;
                return;
            }

            tableBody.innerHTML = exercises.map(ex => {
                const paddedId = String(ex.id).padStart(3, '0');
                const stacksBadges = (ex.stacks || []).map(s => `<span>${escapeHtml(s.name)}</span>`).join(' ') || '---';
                const attachmentsCount = (ex.attachments || []).length;

                return `
                    <tr>
                        <td><strong>#${paddedId}</strong></td>
                        <td>
                            <strong>${escapeHtml(ex.title)}</strong>
                            <div>${escapeHtml(ex.slug)}</div>
                        </td>
                        <td><span>${escapeHtml(ex.difficulty.toUpperCase())}</span></td>
                        <td>${stacksBadges}</td>
                        <td>${attachmentsCount} arquivo(s)</td>
                        <td>${formatDate(ex.created_at)}</td>
                        <td>
                            <div class="dashboard__action-row">
                                <a class="dashboard__edit-button" href="/admin/exercise/edit/${ex.id}">
                                    Editar
                                </a>
                                <button class="dashboard__delete-button" data-action="delete-exercise" data-id="${ex.id}" data-title="${escapeHtml(ex.title)}">
                                    Excluir
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            }).join('');

            // Attach event listeners to delete buttons
            document.querySelectorAll('[data-action="delete-exercise"]').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = e.target.getAttribute('data-id');
                    const title = e.target.getAttribute('data-title');
                    pendingDeleteId = id;
                    deleteModalText.innerText = `Tem certeza que deseja excluir o exercício "${title}" (ID #${String(id).padStart(3, '0')})? Todos os anexos e vínculos serão removidos.`;
                    deleteModal.style.display = 'flex';
                });
            });

        } catch (err) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="dashboard__table-cell">
                        ERRO: ${escapeHtml(err.message)}
                    </td>
                </tr>
            `;
        }
    }

    async function loadSubmissions() {
        if (!submissionTableBody) return;
        try {
            const res = await fetch('/api/admin/submissions');
            const data = await res.json();
            if (!res.ok || !data.success) throw new Error(data.error || 'Erro ao carregar envios.');
            const submissions = data.data || [];
            submissionCount.textContent = `${submissions.length} pendente${submissions.length === 1 ? '' : 's'}`;
            submissionTableBody.innerHTML = submissions.length ? submissions.map(item => `
                <tr><td>#${String(item.id).padStart(3, '0')}</td><td><strong>${escapeHtml(item.title)}</strong><div>${escapeHtml(item.summary)}</div></td>
                <td>${escapeHtml(item.difficulty)}</td><td>${formatDate(item.created_at)}</td><td><div class="dashboard__action-row">
                    <button class="dashboard__approve-button" data-submission-action="approve" data-id="${item.id}">Aprovar</button>
                    <button class="dashboard__delete-button" data-submission-action="reject" data-id="${item.id}">Recusar</button>
                </div></td></tr>`).join('') : '<tr><td colspan="5" class="dashboard__table-cell">Nenhum exercício pendente.</td></tr>';
            submissionTableBody.querySelectorAll('[data-submission-action]').forEach(button => button.addEventListener('click', async () => {
                const action = button.dataset.submissionAction;
                const response = await fetch(`/api/admin/submissions/${button.dataset.id}/${action}`, { method: 'POST' });
                const result = await response.json();
                if (!response.ok || !result.success) return showToast(result.error || 'Não foi possível revisar o envio.', true);
                showToast(action === 'approve' ? 'Exercício aprovado.' : 'Exercício recusado.');
                loadSubmissions();
                loadExercisesTable();
                loadStats();
            }));
        } catch (error) {
            submissionTableBody.innerHTML = `<tr><td colspan="5" class="dashboard__table-cell">${escapeHtml(error.message)}</td></tr>`;
        }
    }

    async function loadTaxonomies() {
        const lists = [
            { endpoint: 'tags', element: 'dashboard__tags-list', label: 'tag' },
            { endpoint: 'stacks', element: 'dashboard__stacks-list', label: 'stack' }
        ];
        for (const item of lists) {
            const target = document.getElementById(item.element);
            const response = await fetch(`/api/${item.endpoint}`);
            const result = await response.json();
            if (!target || !result.success) continue;
            target.innerHTML = result.data.map(entry => `<span class="dashboard__taxonomy-item">${escapeHtml(entry.name)} <button data-taxonomy="${item.label}" data-id="${entry.id}" title="Excluir">x</button></span>`).join('') || 'Nenhum cadastrado.';
            target.querySelectorAll('[data-taxonomy]').forEach(button => button.addEventListener('click', async () => {
                if (!confirm(`Excluir ${item.label} "${button.parentElement.firstChild.textContent.trim()}"?`)) return;
                const deleteResponse = await fetch(`/api/${item.endpoint}/${button.dataset.id}`, { method: 'DELETE' });
                const deleteResult = await deleteResponse.json();
                if (!deleteResponse.ok || !deleteResult.success) return showToast(deleteResult.error || 'Não foi possível excluir.', true);
                showToast(`${item.label === 'tag' ? 'Tag' : 'Stack'} excluída.`);
                loadTaxonomies();
                loadStats();
            }));
        }
    }
});
