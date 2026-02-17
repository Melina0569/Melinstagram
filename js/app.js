/**
 * App Principal — con Búsqueda + Paginación
 * Mantiene las mismas importaciones del proyecto original
 */

import * as API from './components/api.js';
import { renderPosts, showLoadingState, prependPost, updatePostElement, removePostElement } from './services/Post.js';
import { Modal } from './services/Modal.js';
import { toast } from './services/Toast.js';

// ─── Estado global ────────────────────────────────────────────────────────────

const state = {
    posts: [],          // todos los posts cargados de la API
    filtered: [],       // posts tras aplicar búsqueda
    currentPage: 1,
    postsPerPage: 10,
    searchQuery: '',
    isLoading: false,
};

// ─── DOM ──────────────────────────────────────────────────────────────────────

const feedContainer  = document.getElementById('feed');
const btnNewPost     = document.getElementById('btnNewPost');
const searchInput    = document.getElementById('searchInput');
const searchClear    = document.getElementById('searchClear');
const searchInfo     = document.getElementById('searchInfo');
const paginationEl   = document.getElementById('pagination');

const modal = new Modal('postModal');

// ─── Inicialización ───────────────────────────────────────────────────────────

async function init() {
    console.log('🚀 Iniciando Melinstagram...');
    await loadPosts();
    setupEventListeners();
    console.log('✅ Aplicación iniciada');
}

// ─── Event listeners ──────────────────────────────────────────────────────────

function setupEventListeners() {
    btnNewPost.addEventListener('click', () => modal.openForCreate());
    modal.handleSubmit(handleFormSubmit);

    // Búsqueda — debounce de 300 ms
    let searchTimer;
    searchInput.addEventListener('input', () => {
        clearTimeout(searchTimer);
        searchTimer = setTimeout(() => {
            state.searchQuery = searchInput.value.trim().toLowerCase();
            searchClear.classList.toggle('hidden', state.searchQuery === '');
            applySearchAndPagination();
        }, 300);
    });

    searchClear.addEventListener('click', () => {
        searchInput.value = '';
        state.searchQuery = '';
        searchClear.classList.add('hidden');
        applySearchAndPagination();
        searchInput.focus();
    });
}

// ─── GET ──────────────────────────────────────────────────────────────────────

async function loadPosts() {
    try {
        state.isLoading = true;
        showLoadingState(feedContainer);

        console.log('📥 GET /posts...');
        const posts = await API.getAllPosts();

        state.posts = posts;
        state.isLoading = false;

        applySearchAndPagination();
        console.log(`✅ ${posts.length} posts cargados`);
    } catch (error) {
        state.isLoading = false;
        console.error('❌ Error al cargar posts:', error);
        toast.error('Error al cargar las publicaciones');
        feedContainer.innerHTML = '<div class="empty-state">Error al cargar publicaciones</div>';
    }
}

// ─── Búsqueda + Paginación ────────────────────────────────────────────────────

/**
 * Filtra posts según searchQuery y renderiza la página actual
 */
function applySearchAndPagination(resetPage = true) {
    const q = state.searchQuery;

    // Filtrar
    if (q) {
        state.filtered = state.posts.filter(p =>
            (p.author  && p.author.toLowerCase().includes(q)) ||
            (p.caption && p.caption.toLowerCase().includes(q))
        );
    } else {
        state.filtered = [...state.posts];
    }

    // Info de búsqueda
    if (q) {
        const n = state.filtered.length;
        searchInfo.textContent = n === 0
            ? 'Sin resultados para "' + searchInput.value.trim() + '"'
            : `${n} publicación${n !== 1 ? 'es' : ''} encontrada${n !== 1 ? 's' : ''}`;
    } else {
        searchInfo.textContent = '';
    }

    if (resetPage) state.currentPage = 1;

    renderCurrentPage();
    renderPagination();
}

/**
 * Renderiza solo los posts de la página actual
 */
function renderCurrentPage() {
    const { currentPage, postsPerPage, filtered } = state;
    const start = (currentPage - 1) * postsPerPage;
    const pagePosts = filtered.slice(start, start + postsPerPage);

    if (filtered.length === 0) {
        feedContainer.innerHTML = `
            <div class="empty-state fade-in">
                <div class="empty-state-icon">🔍</div>
                <p class="empty-state-text">${
                    state.searchQuery
                        ? 'No hay resultados para tu búsqueda'
                        : 'No hay publicaciones aún'
                }</p>
            </div>`;
        return;
    }

    renderPosts(pagePosts, feedContainer, handleEditPost, handleDeletePost);
    // Scroll suave al inicio del feed al cambiar de página
    feedContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ─── Paginación ───────────────────────────────────────────────────────────────

function renderPagination() {
    const totalPages = Math.ceil(state.filtered.length / state.postsPerPage);

    if (totalPages <= 1) {
        paginationEl.classList.add('hidden');
        return;
    }
    paginationEl.classList.remove('hidden');
    paginationEl.innerHTML = '';

    // Botón Anterior
    paginationEl.appendChild(createPageBtn('‹ Anterior', state.currentPage === 1, () => {
        state.currentPage--;
        applySearchAndPagination(false);
    }));

    // Números de página con elipsis
    const pages = getPageNumbers(state.currentPage, totalPages);
    pages.forEach(p => {
        if (p === '...') {
            const dots = document.createElement('span');
            dots.className = 'page-dots';
            dots.textContent = '…';
            paginationEl.appendChild(dots);
        } else {
            const btn = createPageBtn(String(p), false, () => {
                state.currentPage = p;
                applySearchAndPagination(false);
            });
            if (p === state.currentPage) btn.classList.add('active');
            paginationEl.appendChild(btn);
        }
    });

    // Botón Siguiente
    paginationEl.appendChild(createPageBtn('Siguiente ›', state.currentPage === totalPages, () => {
        state.currentPage++;
        applySearchAndPagination(false);
    }));
}

/** Genera array de números de página con elipsis */
function getPageNumbers(current, total) {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

    const pages = [];
    const addPage = n => pages.push(n);
    const addDots = () => { if (pages[pages.length - 1] !== '...') pages.push('...'); };

    addPage(1);
    if (current > 3) addDots();
    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
        addPage(i);
    }
    if (current < total - 2) addDots();
    addPage(total);

    return pages;
}

function createPageBtn(label, disabled, onClick) {
    const btn = document.createElement('button');
    btn.className = 'page-btn';
    btn.textContent = label;
    btn.disabled = disabled;
    if (!disabled) btn.addEventListener('click', onClick);
    return btn;
}

// ─── CRUD handlers ────────────────────────────────────────────────────────────

async function handleFormSubmit(postData, errors) {
    if (errors && errors.length > 0) { toast.error(errors[0]); return; }

    modal.setSubmitLoading(true);
    try {
        if (postData.id != null) {
            await handleUpdatePost(postData);
        } else {
            await handleCreatePost(postData);
        }
        modal.close();
    } catch (error) {
        console.error('Error al procesar formulario:', error);
        toast.error('Error al procesar la solicitud');
    } finally {
        modal.setSubmitLoading(false);
    }
}

/** POST */
async function handleCreatePost(postData) {
    const newPost = await API.createPost(postData);
    state.posts.unshift(newPost);
    applySearchAndPagination(); // vuelve a página 1 y muestra el nuevo post
    toast.success('¡Publicación creada exitosamente!');
    console.log('✅ Post creado:', newPost);
}

/** PUT */
async function handleUpdatePost(postData) {
    const updatedPost = await API.updatePost(postData.id, postData);
    const index = state.posts.findIndex(p => p.id === postData.id);
    if (index !== -1) state.posts[index] = updatedPost;
    applySearchAndPagination(false); // mantiene página actual
    toast.success('¡Publicación actualizada exitosamente!');
    console.log('✅ Post actualizado:', updatedPost);
}

function handleEditPost(postData) {
    modal.openForEdit(postData, handleFormSubmit);
}

/** DELETE */
async function handleDeletePost(postId) {
    if (!confirm('¿Estás seguro de que quieres eliminar esta publicación?')) return;

    try {
        await API.deletePost(postId);
        state.posts = state.posts.filter(p => p.id !== postId);
        applySearchAndPagination(false);
        toast.success('Publicación eliminada');
        console.log(`✅ Post ${postId} eliminado`);
    } catch (error) {
        console.error('❌ Error al eliminar post:', error);
        toast.error('Error al eliminar la publicación');
    }
}

// ─── Demo CRUD ────────────────────────────────────────────────────────────────

async function demonstrateCRUD() {
    console.log('🎯 Demo CRUD:');
    const posts = await API.getAllPosts();
    console.log('1️⃣ GET:', posts.length, 'posts');

    const created = await API.createPost({
        author: 'Usuario Demo',
        caption: 'Publicación de demostración',
        imageUrl: 'https://picsum.photos/600/600?random=999'
    });
    console.log('2️⃣ POST:', created);

    const updated = await API.updatePost(created.id, {
        author: 'Usuario Actualizado',
        caption: 'Descripción actualizada',
        imageUrl: 'https://picsum.photos/600/600?random=888'
    });
    console.log('3️⃣ PUT:', updated);

    await API.deletePost(created.id);
    console.log('4️⃣ DELETE ✅');
    console.log('Demo completada');
}

window.demonstrateCRUD = demonstrateCRUD;

// ─── Arrancar ─────────────────────────────────────────────────────────────────

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

console.log('💡 Tip: window.demonstrateCRUD() para probar CRUD en consola');