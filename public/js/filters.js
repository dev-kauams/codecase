/* ===================================================
   CodeCase - Homepage Dynamic Filtering Script
   Author: @dev-kauams
   =================================================== */

document.addEventListener('DOMContentLoaded', async () => {
    const searchInput = document.getElementById('home__search-input');
    const difficultySelect = document.getElementById('home__difficulty-select');
    const stackSelect = document.getElementById('home__stack-select');
    const tagSelect = document.getElementById('home__tag-select');
    const btnClearFilters = document.getElementById('home__clear-filters');
    const exercisesGrid = document.getElementById('home__exercises-grid');
    const pagination = document.getElementById('home__pagination');
    const resultsCountText = document.getElementById('home__results-count');
    const activeFilterBadge = document.getElementById('home__active-filter');
    const pageSize = 6;
    let currentPage = 1;
    let filteredExercises = [];

    if (!exercisesGrid) return;

    // 1. Fetch Taxonomies (Stacks & Tags)
    await loadFilterOptions();

    // 2. Read initial filter values from URL query string
    readUrlParams();

    // 3. Initial exercise fetch
    await fetchExercises();

    // 4. Attach event listeners
    let searchDebounceTimer;
    searchInput.addEventListener('input', () => {
        clearTimeout(searchDebounceTimer);
        searchDebounceTimer = setTimeout(() => {
            updateUrlAndFetch();
        }, 300);
    });

    difficultySelect.addEventListener('change', updateUrlAndFetch);
    stackSelect.addEventListener('change', updateUrlAndFetch);
    tagSelect.addEventListener('change', updateUrlAndFetch);

    btnClearFilters.addEventListener('click', () => {
        searchInput.value = '';
        difficultySelect.value = '';
        stackSelect.value = '';
        tagSelect.value = '';
        updateUrlAndFetch();
    });

    window.addEventListener('popstate', () => {
        readUrlParams();
        fetchExercises();
    });

    // Populate dropdowns from backend
    async function loadFilterOptions() {
        try {
            const [stacksRes, tagsRes] = await Promise.all([
                fetch('/api/stacks'),
                fetch('/api/tags')
            ]);

            const stacksData = await stacksRes.json();
            const tagsData = await tagsRes.json();

            if (stacksData.success) {
                stacksData.data.forEach(s => {
                    const opt = document.createElement('option');
                    opt.value = s.slug;
                    opt.textContent = `${s.name} (${s.exercise_count})`;
                    stackSelect.appendChild(opt);
                });
            }

            if (tagsData.success) {
                tagsData.data.forEach(t => {
                    const opt = document.createElement('option');
                    opt.value = t.slug;
                    opt.textContent = `${t.name} (${t.exercise_count})`;
                    tagSelect.appendChild(opt);
                });
            }
        } catch (err) {
            console.error('Error loading filter options:', err);
        }
    }

    // Read URL query params on page load
    function readUrlParams() {
        const params = new URLSearchParams(window.location.search);
        if (params.has('search')) searchInput.value = params.get('search');
        if (params.has('difficulty')) difficultySelect.value = params.get('difficulty');
        if (params.has('stack')) stackSelect.value = params.get('stack');
        if (params.has('tag')) tagSelect.value = params.get('tag');
        const page = Number.parseInt(params.get('page'), 10);
        currentPage = Number.isInteger(page) && page > 0 ? page : 1;
    }

    // Update URL and fetch matching exercises
    function updateUrlAndFetch() {
        const params = new URLSearchParams();
        if (searchInput.value.trim()) params.set('search', searchInput.value.trim());
        if (difficultySelect.value) params.set('difficulty', difficultySelect.value);
        if (stackSelect.value) params.set('stack', stackSelect.value);
        if (tagSelect.value) params.set('tag', tagSelect.value);

        const newRelativePathQuery = window.location.pathname + (params.toString() ? '?' + params.toString() : '');
        history.pushState(null, '', newRelativePathQuery);

        currentPage = 1;
        fetchExercises();
    }

    // Fetch exercises from API
    async function fetchExercises() {
        exercisesGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 48px; color: var(--color-text-muted);">
                <span style="color: var(--color-gold); font-family: var(--font-mono);">Consultando...</span>
            </div>
        `;

        try {
            const queryParams = new URLSearchParams(window.location.search).toString();
            const res = await fetch(`/api/exercises?${queryParams}`);
            const data = await res.json();

            if (!res.ok || !data.success) {
                throw new Error(data.error || 'Erro ao carregar exercícios.');
            }

            filteredExercises = data.data;
            const totalPages = Math.ceil(filteredExercises.length / pageSize);
            currentPage = Math.min(currentPage, Math.max(totalPages, 1));
            renderExercises();
            renderPagination(totalPages);
            updateSummaryBadge(filteredExercises.length);
        } catch (err) {
            exercisesGrid.innerHTML = `
                <div class="state-empty" style="grid-column: 1 / -1;">
                    <h3>ERRO DE COMUNICAÇÃO</h3>
                    <p>${err.message}</p>
                </div>
            `;
            pagination.innerHTML = '';
            resultsCountText.textContent = 'Erro ao carregar dados.';
        }
    }

    // Render list of exercise cards
    function renderExercises() {
        const startIndex = (currentPage - 1) * pageSize;
        const exercises = filteredExercises.slice(startIndex, startIndex + pageSize);

        if (!exercises || exercises.length === 0) {
            exercisesGrid.innerHTML = `
                <div class="state-empty" style="grid-column: 1 / -1;">
                    <h3>[ NENHUM PERGAMINHO ENCONTRADO ]</h3>
                    <p style="margin-top: 8px;">Nenhum desafio atende aos critérios de pesquisa selecionados.</p>
                    <button class="btn btn--gold" style="margin-top: 16px;" onclick="document.getElementById('home__clear-filters').click();">
                        [ REFINAR OU LIMPAR FILTROS ]
                    </button>
                </div>
            `;
            return;
        }

        exercisesGrid.innerHTML = exercises.map(ex => {
            const diffClass = ex.difficulty === 'Fácil' ? 'badge--easy'  : (ex.difficulty === 'Médio' ? 'badge--medium' : 'badge--hard');
            const paddedId = String(ex.id).padStart(3, '0');
            const coverImageHtml = ex.image_url ? `<img src="${ex.image_url}" alt="${ex.title}" class="card__thumbnail">` : '';

            const stacksHtml = (ex.stacks || []).map(s => `<span class="badge badge--stack">${s.name}</span>`).join(' ');
            const tagsHtml = (ex.tags || []).map(t => `<span class="badge badge--tag">#${t.name}</span>`).join(' ');

            return `
                <article class="card">
                    <div class="card__content">
                        <div class="card__header">
                            <span class="card__id">EXERCÍCIO #${paddedId}</span>
                            <span>${formatDate(ex.created_at)}</span>
                        </div>

                        ${coverImageHtml}

                        <h3 class="card__title">${ex.title}</h3>
                        <p class="card__summary">${ex.summary}</p>
                    </div>

                    <div class="card__footer">
                        <div class="card__badges" style="margin-top: 12px;">
                            <span class="badge ${diffClass}">${ex.difficulty.toUpperCase()}</span>
                            ${stacksHtml}
                            ${tagsHtml}
                        </div>

                    </div>
                        <a href="/exercise/${ex.id}" class="btn" style="width: 100%; justify-content: center; margin-top: 8px;">
                            Ver Exercício
                        </a>
                </article>
            `;
        }).join('');
    }

    function renderPagination(totalPages) {
        if (!pagination || totalPages <= 1) {
            if (pagination) pagination.innerHTML = '';
            return;
        }

        const pageButtons = Array.from({ length: totalPages }, (_, index) => {
            const page = index + 1;
            const current = page === currentPage;
            return `
                <button type="button" class="pagination__button${current ? ' is-active' : ''}"
                    data-page="${page}" aria-label="Ir para a página ${page}"${current ? ' aria-current="page"' : ''}>
                    ${page}
                </button>
            `;
        }).join('');

        pagination.innerHTML = `
            <button type="button" class="pagination__button pagination__button--arrow"
                data-page="${currentPage - 1}" aria-label="Página anterior"${currentPage === 1 ? ' disabled' : ''}>
                <img src="images/arrow-left.svg" alt="Página anterior">
            </button>
            ${pageButtons}
            <button type="button" class="pagination__button pagination__button--arrow"
                data-page="${currentPage + 1}" aria-label="Próxima página"${currentPage === totalPages ? ' disabled' : ''}>
                <img src="images/arrow-right.svg" alt="Próxima página">
            </button>
        `;

        pagination.querySelectorAll('button:not([disabled])').forEach(button => {
            button.addEventListener('click', () => {
                currentPage = Number(button.dataset.page);
                const params = new URLSearchParams(window.location.search);
                params.set('page', currentPage);
                history.pushState(null, '', `${window.location.pathname}?${params.toString()}`);
                renderExercises();
                renderPagination(totalPages);
                document.getElementById('home__exercises-grid').scrollIntoView({ behavior: 'smooth' });
            });
        });
    }

    // Update filter status text
    function updateSummaryBadge(count) {
        resultsCountText.textContent = `Exibindo ${count} exercícios(s) cadastrado(s)`;

        const activeFilters = [];
        if (searchInput.value.trim()) activeFilters.push(`Busca: "${searchInput.value.trim()}"`);
        if (difficultySelect.value) activeFilters.push(`Dificuldade: ${difficultySelect.value}`);
        if (stackSelect.value) activeFilters.push(`Stack: ${stackSelect.options[stackSelect.selectedIndex].text.split(' ')[0]}`);
        if (tagSelect.value) activeFilters.push(`Tag: ${tagSelect.options[tagSelect.selectedIndex].text.split(' ')[0]}`);

        if (activeFilters.length > 0) {
            activeFilterBadge.textContent = `Filtros Ativos: ${activeFilters.join(' | ')}`;
            activeFilterBadge.style.color = 'var(--color-light)';
        } else {
            activeFilterBadge.textContent = 'Filtros: Todos';
            activeFilterBadge.style.color = 'var(--color-text-muted)';
        }
    }
});
