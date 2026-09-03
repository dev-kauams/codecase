/* ===================================================
   CodeCase - Admin Exercise Editor Script
   Author: @dev-kauams
   =================================================== */

document.addEventListener('DOMContentLoaded', async () => {
    // Auth check
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

    const pathParts = window.location.pathname.split('/');
    const isEditMode = pathParts.includes('edit');
    const exerciseId = isEditMode ? pathParts[pathParts.length - 1] : null;

    const formHeadingTitle = document.getElementById('exercise-form__heading');
    const form = document.getElementById('exercise-form__editor');
    const formTitle = document.getElementById('exercise-form__title');
    const formSummary = document.getElementById('exercise-form__summary');
    const formDifficulty = document.getElementById('exercise-form__difficulty');
    const formStatement = document.getElementById('exercise-form__statement');
    const formImageInput = document.getElementById('exercise-form__image');
    const imagePreviewContainer = document.getElementById('exercise-form__image-preview-container');
    const imagePreview = document.getElementById('exercise-form__image-preview');
    const stacksChecklist = document.getElementById('exercise-form__stacks-checkbox-list');
    const tagsChecklist = document.getElementById('exercise-form__tags-checkbox-list');
    const btnSave = document.getElementById('exercise-form__save');
    const btnInsertCodeTemplate = document.getElementById('exercise-form__insert-code-template');

    const existingAttContainer = document.getElementById('exercise-form__existing-attachments-container');
    const existingAttList = document.getElementById('exercise-form__existing-attachments-list');

    if (isEditMode) {
        formHeadingTitle.innerText = `Editar Exercício #${String(exerciseId).padStart(3, '0')} ]`;
        btnSave.innerText = 'Atualizar Exercício';
    }

    // 1. Load Taxonomy Checkboxes
    await loadTaxonomies();

    // 2. If edit mode, load existing exercise data
    if (isEditMode && exerciseId) {
        await loadExerciseData(exerciseId);
    }

    // Image preview handler
    formImageInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (evt) => {
                imagePreview.src = evt.target.result;
                imagePreviewContainer.style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
    });

    // Helper: insert code snippet template into textarea
    if (btnInsertCodeTemplate) {
        btnInsertCodeTemplate.addEventListener('click', () => {
            const codeTemplate = `\n\`\`\`javascript\n// Exemplo de código da solução\nfunction solution() {\n    console.log("CodeCase");\n}\n\`\`\`\n`;
            const start = formStatement.selectionStart;
            const end = formStatement.selectionEnd;
            formStatement.value = formStatement.value.substring(0, start) + codeTemplate + formStatement.value.substring(end);
            formStatement.focus();
        });
    }

    // Form submit handler
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const title = formTitle.value.trim();
        const summary = formSummary.value.trim();
        const statement = formStatement.value.trim();
        const difficulty = formDifficulty.value;

        if (!title || !summary || !statement || !difficulty) {
            return showToast('Preencha todos os campos obrigatórios.', true);
        }

        btnSave.disabled = true;
        btnSave.innerText = isEditMode ? 'Atualizando...' : 'Gravando...';

        try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('summary', summary);
            formData.append('statement', statement);
            formData.append('difficulty', difficulty);

            // Selected Stacks
            const selectedStacks = Array.from(stacksChecklist.querySelectorAll('input[type="checkbox"]:checked')).map(cb => cb.value);
            selectedStacks.forEach(sId => formData.append('stacks', sId));

            // Selected Tags
            const selectedTags = Array.from(tagsChecklist.querySelectorAll('input[type="checkbox"]:checked')).map(cb => cb.value);
            selectedTags.forEach(tId => formData.append('tags', tId));

            // Image file if selected
            if (formImageInput.files.length > 0) {
                formData.append('image', formImageInput.files[0]);
            }

            // Attachments files if selected
            const attachmentsInput = document.getElementById('exercise-form__attachments');
            if (attachmentsInput.files.length > 0) {
                for (let i = 0; i < attachmentsInput.files.length; i++) {
                    formData.append('attachments', attachmentsInput.files[i]);
                }
            }

            const url = isEditMode ? `/api/exercises/${exerciseId}` : '/api/exercises';
            const method = isEditMode ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method: method,
                body: formData
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
                throw new Error(data.error || 'Erro ao salvar exercício.');
            }

            showToast(isEditMode ? 'Exercício atualizado com sucesso!' : 'Novo exercício criado com sucesso!');
            setTimeout(() => {
                window.location.href = '/admin/dashboard';
            }, 600);

        } catch (err) {
            showToast(err.message, true);
            btnSave.disabled = false;
            btnSave.innerText = isEditMode ? 'Atualizar Exercício' : 'Gravar Exercício';
        }
    });

    // Populate taxonomies — BEM classes nas templates
    async function loadTaxonomies() {
        try {
            const [stacksRes, tagsRes] = await Promise.all([
                fetch('/api/stacks'),
                fetch('/api/tags')
            ]);

            const stacksData = await stacksRes.json();
            const tagsData = await tagsRes.json();

            if (stacksData.success) {
                stacksChecklist.innerHTML = stacksData.data.map(s => `
                    <label class="checkbox-grid__item">
                        <input type="checkbox" name="stacks" value="${s.id}" id="exercise-form__stack-checkbox-${s.id}">
                        <span>${s.name}</span>
                    </label>
                `).join('');
            }

            if (tagsData.success) {
                tagsChecklist.innerHTML = tagsData.data.map(t => `
                    <label class="checkbox-grid__item">
                        <input type="checkbox" name="tags" value="${t.id}" id="exercise-form__tag-checkbox-${t.id}">
                        <span>${t.name}</span>
                    </label>
                `).join('');
            }
        } catch (err) {
            console.error('Error loading taxonomies:', err);
        }
    }

    // Load Exercise Data for edit mode
    async function loadExerciseData(id) {
        try {
            const res = await fetch(`/api/exercises/${id}`);
            const data = await res.json();

            if (!res.ok || !data.success) {
                throw new Error(data.error || 'Exercício não encontrado.');
            }

            const ex = data.data;

            formTitle.value = ex.title;
            formSummary.value = ex.summary;
            formDifficulty.value = ex.difficulty;
            formStatement.value = ex.statement;

            // Check stacks
            if (ex.stacks && ex.stacks.length > 0) {
                ex.stacks.forEach(s => {
                    const cb = document.getElementById(`exercise-form__stack-checkbox-${s.id}`);
                    if (cb) cb.checked = true;
                });
            }

            // Check tags
            if (ex.tags && ex.tags.length > 0) {
                ex.tags.forEach(t => {
                    const cb = document.getElementById(`exercise-form__tag-checkbox-${t.id}`);
                    if (cb) cb.checked = true;
                });
            }

            // Image Preview
            if (ex.image_url) {
                imagePreview.src = ex.image_url;
                imagePreviewContainer.style.display = 'block';
            }

            // Existing Attachments
            if (ex.attachments && ex.attachments.length > 0) {
                renderExistingAttachments(ex.attachments);
            }

        } catch (err) {
            showToast(err.message, true);
        }
    }

    // Render existing attachments — BEM classes
    function renderExistingAttachments(attachments) {
        existingAttList.innerHTML = attachments.map(att => `
            <div class="attachments__item" id="exercise-form__attachment-row-${att.id}" style="margin-top: 6px;">
                <span class="attachments__name"> ${att.original_name} (${formatFileSize(att.file_size)})</span>
                <button type="button" class="btn btn--danger attachments__remove-button" data-id="${att.id}" style="font-size: 0.7rem; padding: 2px 6px;">
                    [ REMOVER ]
                </button>
            </div>
        `).join('');

        existingAttContainer.style.display = 'block';

        document.querySelectorAll('.attachments__remove-button').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const attId = e.target.getAttribute('data-id');
                if (!confirm('Deseja remover este anexo?')) return;

                try {
                    const res = await fetch(`/api/exercises/attachments/${attId}`, { method: 'DELETE' });
                    const data = await res.json();
                    if (res.ok && data.success) {
                        showToast('Anexo removido com sucesso.');
                        document.getElementById(`exercise-form__attachment-row-${attId}`).remove();
                    } else {
                        showToast(data.error || 'Erro ao remover anexo.', true);
                    }
                } catch (err) {
                    showToast(err.message, true);
                }
            });
        });
    }
});
