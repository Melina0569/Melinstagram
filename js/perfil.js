/**
 * perfil.js — Lógica exclusiva de la página de perfil
 *
 * Reutiliza: api.js, Toast.js, helpers.js
 * No necesita: Modal.js, Post.js (usa su propio grid)
 */

import * as API      from './components/api.js';
import { toast }     from './services/Toast.js';
import { formatDate } from './utils/helpers.js';

// ─── Estado del perfil (se guarda en localStorage) ───────────────────────────

const DEFAULT_PROFILE = {
    name:         'Mi Perfil',
    bio:          '✨ Compartiendo momentos especiales',
    avatarUrl:    'https://api.dicebear.com/7.x/adventurer/svg?seed=pixelsnap',
    filterAuthor: '',   // nombre de autor para filtrar posts
};

/**
 * Carga el perfil guardado en localStorage.
 * Si no existe, devuelve el perfil por defecto.
 */
function loadProfile() {
    const saved = localStorage.getItem('perfil_data');
    return saved ? JSON.parse(saved) : { ...DEFAULT_PROFILE };
}

/**
 * Guarda el perfil en localStorage.
 */
function saveProfile(data) {
    localStorage.setItem('perfil_data', JSON.stringify(data));
}

// ─── Referencias al DOM ───────────────────────────────────────────────────────

const profileName   = document.getElementById('profileName');
const profileBio    = document.getElementById('profileBio');
const profileAvatar = document.getElementById('profileAvatar');
const statPosts     = document.getElementById('statPosts');
const profileGrid   = document.getElementById('profileGrid');

// Modal de editar perfil
const editModal     = document.getElementById('editProfileModal');
const editOverlay   = document.getElementById('editModalOverlay');
const editClose     = document.getElementById('editModalClose');
const editCancel    = document.getElementById('editBtnCancel');
const editForm      = document.getElementById('editProfileForm');

// ─── Renderizar info del perfil ───────────────────────────────────────────────

function renderProfileInfo(profile) {
    profileName.textContent     = profile.name;
    profileBio.textContent      = profile.bio;
    profileAvatar.src           = profile.avatarUrl;
    profileAvatar.onerror       = () => {
        profileAvatar.src = DEFAULT_PROFILE.avatarUrl;
    };
}

// ─── Renderizar grid de publicaciones ────────────────────────────────────────

/**
 * Muestra skeletons mientras cargan los posts
 */
function showGridSkeleton() {
    profileGrid.innerHTML = Array(6).fill(0)
        .map(() => `<div class="grid-skeleton"></div>`)
        .join('');
}

/**
 * Filtra los posts por nombre de autor
 */
function filterPostsByAuthor(posts, authorName) {
    if (!authorName || authorName.trim() === '') return posts;

    const name = authorName.trim().toLowerCase();
    return posts.filter(p =>
        p.author && p.author.toLowerCase().includes(name)
    );
}

/**
 * Renderiza el grid de posts del perfil
 */
function renderGrid(posts) {
    if (posts.length === 0) {
        profileGrid.innerHTML = `
            <div class="profile-empty fade-in">
                <div class="profile-empty-icon">📸</div>
                <p class="profile-empty-title">Sin publicaciones aún</p>
                <p class="profile-empty-sub">
                    Las publicaciones con tu nombre de autor aparecerán aquí.
                    <br>Configúralo en "Editar Perfil".
                </p>
            </div>
        `;
        return;
    }

    profileGrid.innerHTML = '';

    posts.forEach((post, index) => {
        const item = document.createElement('div');
        item.className = 'grid-item stagger-item';
        item.style.animationDelay = `${index * 0.05}s`;

        item.innerHTML = `
            <img
                src="${escapeHtml(post.imageUrl)}"
                alt="${escapeHtml(post.caption)}"
                loading="lazy"
                onerror="this.src='https://picsum.photos/600/600?random=${post.id}'"
            >
            <div class="grid-item-overlay">
                <p class="grid-item-caption">${escapeHtml(post.caption)}</p>
                <span class="grid-item-date">${formatDate(post.createdAt)}</span>
            </div>
        `;

        profileGrid.appendChild(item);
    });
}

// ─── Cargar posts desde la API ────────────────────────────────────────────────

async function loadProfilePosts(profile) {
    try {
        showGridSkeleton();

        // GET — reutilizamos el mismo servicio que el feed
        const allPosts    = await API.getAllPosts();
        const myPosts     = filterPostsByAuthor(allPosts, profile.filterAuthor);

        // Actualizar contador
        statPosts.textContent = myPosts.length;

        renderGrid(myPosts);

        console.log(`GET ✅ ${allPosts.length} posts totales → ${myPosts.length} míos`);
    } catch (error) {
        console.error('Error al cargar posts del perfil:', error);
        toast.error('Error al cargar las publicaciones');
        profileGrid.innerHTML = `
            <div class="profile-empty">
                <div class="profile-empty-icon">⚠️</div>
                <p class="profile-empty-title">Error al cargar</p>
            </div>
        `;
    }
}

// ─── Modal de editar perfil ───────────────────────────────────────────────────

function openEditModal(profile) {
    document.getElementById('editName').value         = profile.name;
    document.getElementById('editBio').value          = profile.bio;
    document.getElementById('editAvatar').value       = profile.avatarUrl;
    document.getElementById('filterAuthor').value     = profile.filterAuthor;

    editModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeEditModal() {
    editModal.classList.remove('active');
    document.body.style.overflow = '';
}

// ─── Inicializar ─────────────────────────────────────────────────────────────

async function init() {
    const profile = loadProfile();

    // Mostrar info del perfil
    renderProfileInfo(profile);

    // Cargar y mostrar posts filtrados
    await loadProfilePosts(profile);

    // ── Event listeners ──

    // Botón editar perfil
    document.getElementById('btnEditProfile').addEventListener('click', () => {
        openEditModal(loadProfile());
    });

    // Cerrar modal
    editOverlay.addEventListener('click', closeEditModal);
    editClose.addEventListener('click', closeEditModal);
    editCancel.addEventListener('click', closeEditModal);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && editModal.classList.contains('active')) {
            closeEditModal();
        }
    });

    // Guardar cambios del perfil
    editForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const updatedProfile = {
            name:         document.getElementById('editName').value.trim()   || DEFAULT_PROFILE.name,
            bio:          document.getElementById('editBio').value.trim()    || DEFAULT_PROFILE.bio,
            avatarUrl:    document.getElementById('editAvatar').value.trim() || DEFAULT_PROFILE.avatarUrl,
            filterAuthor: document.getElementById('filterAuthor').value.trim(),
        };

        // Guardar en localStorage
        saveProfile(updatedProfile);

        // Actualizar UI sin recargar página
        renderProfileInfo(updatedProfile);
        closeEditModal();

        // Recargar posts con el nuevo filtro
        await loadProfilePosts(updatedProfile);

        toast.success('¡Perfil actualizado!');
    });
}

// ─── Utilidad ─────────────────────────────────────────────────────────────────

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text || '';
    return div.innerHTML;
}

// ─── Arrancar ─────────────────────────────────────────────────────────────────

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}