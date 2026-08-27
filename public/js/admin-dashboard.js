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

    const tableBody = document.getElementById('admin-exercise-table-body');
    const btnLogout = document.getElementById('btn-logout');

    // Modals
    const deleteModal = document.getElementById('delete-modal');
    const deleteModalText = document.getElementById('delete-modal-text');
    const btnConfirmDelete = document.getElementById('btn-confirm-delete');
    const btnCancelDelete = document.getElementById('btn-cancel-delete');
    let pendingDeleteId = null;

    const tagModal = document.getElementById('tag-modal');
    const btnNewTagModal = document.getElementById('btn-new-tag-modal');
    const btnCancelTag = document.getElementById('btn-cancel-tag');
    const btnSaveTag = document.getElementById('btn-save-tag');
    const newTagNameInput = document.getElementById('new-tag-name');

    const stackModal = document.getElementById('stack-modal');
    const btnNewStackModal = document.getElementById('btn-new-stack-modal');
    const btnCancelStack = document.getElementById('btn-cancel-stack');
    const btnSaveStack = document.getElementById('btn-save-stack');
    const newStackNameInput = document.getElementById('new-stack-name');
    const newStackColorInput = document.getElementById('new-stack-color');

    // Load Metrics Stats
    loadStats();

    // Load Exercises Table
    loadExercisesTable();

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
                document.getElementById('stat-exercises').innerText = data.data.totalExercises;
                document.getElementById('stat-stacks').innerText = data.data.totalStacks;
                document.getElementById('stat-tags').innerText = data.data.totalTags;
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
                        <td colspan="7">
                            Nenhum exercício cadastrado. Clique em <strong>+ CRIAR EXERCÍCIO</strong> para adicionar o primeiro.
                        </td>
                    </tr>
                `;
                return;
            }

            tableBody.innerHTML = exercises.map(ex => {
                const paddedId = String(ex.id).padStart(3, '0');
                const stacksBadges = (ex.stacks || []).map(s => `<span>${s.name}</span>`).join(' ') || '---';
                const attachmentsCount = (ex.attachments || []).length;

                return `
                    <tr>
                        <td><strong>#${paddedId}</strong></td>
                        <td>
                            <strong>${ex.title}</strong>
                            <div>${ex.slug}</div>
                        </td>
                        <td><span>${ex.difficulty.toUpperCase()}</span></td>
                        <td>${stacksBadges}</td>
                        <td>📁 ${attachmentsCount} arquivo(s)</td>
                        <td>${formatDate(ex.created_at)}</td>
                        <td>
                            <div>
                                <a href="/admin/exercise/edit/${ex.id}">
                                    [ EDITAR ]
                                </a>
                                <button data-action="delete-exercise" data-id="${ex.id}" data-title="${ex.title}">
                                    [ EXCLUIR ]
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
                    <td colspan="7">
                        ⚠️ ERRO: ${err.message}
                    </td>
                </tr>
            `;
        }
    }
});
