/**
 * Post Component - Componente reutilizable para renderizar posts
 */

import { formatDate } from '../utils/helpers.js';

/**
 * Crea un elemento de post
 * @param {Object} postData - Datos del post
 * @param {Function} onEdit - Callback para editar
 * @param {Function} onDelete - Callback para eliminar
 * @returns {HTMLElement} - Elemento DOM del post
 */
export function createPostElement(postData, onEdit, onDelete) {
    const { id, author, caption, imageUrl, createdAt } = postData;
    
    // Crear contenedor principal
    const article = document.createElement('article');
    article.className = 'post-card stagger-item';
    article.dataset.postId = id;
    
    // Imagen del post
    const img = document.createElement('img');
    img.className = 'post-image';
    img.src = imageUrl;
    img.alt = caption;
    img.loading = 'lazy';
    
    // Manejar error de carga de imagen
    img.onerror = () => {
        img.src = `https://picsum.photos/600/600?random=${id}`;
    };
    
    // Contenedor de contenido
    const content = document.createElement('div');
    content.className = 'post-content';
    
    // Header (autor + acciones)
    const header = document.createElement('div');
    header.className = 'post-header';
    
    const authorElement = document.createElement('div');
    authorElement.className = 'post-author';
    authorElement.textContent = author;
    
    // Botones de acción
    const actionsContainer = document.createElement('div');
    actionsContainer.className = 'post-actions';
    
    const editBtn = createActionButton('✏️', 'Editar', () => onEdit(postData));
    const deleteBtn = createActionButton('🗑️', 'Eliminar', () => onDelete(id));
    deleteBtn.classList.add('delete');
    
    actionsContainer.appendChild(editBtn);
    actionsContainer.appendChild(deleteBtn);
    
    header.appendChild(authorElement);
    header.appendChild(actionsContainer);
    
    // Caption
    const captionElement = document.createElement('p');
    captionElement.className = 'post-caption';
    captionElement.textContent = caption;
    
    // Fecha
    const dateElement = document.createElement('div');
    dateElement.className = 'post-date';
    dateElement.textContent = formatDate(createdAt);
    
    // Ensamblar el post
    content.appendChild(header);
    content.appendChild(captionElement);
    content.appendChild(dateElement);
    
    article.appendChild(img);
    article.appendChild(content);
    
    return article;
}

/**
 * Crea un botón de acción
 */
function createActionButton(icon, title, onClick) {
    const button = document.createElement('button');
    button.className = 'post-action-btn';
    button.textContent = icon;
    button.title = title;
    button.onclick = onClick;
    return button;
}

/**
 * Renderiza múltiples posts en un contenedor
 */
export function renderPosts(posts, container, onEdit, onDelete) {
    // Limpiar contenedor
    container.innerHTML = '';
    
    if (posts.length === 0) {
        container.innerHTML = `
            <div class="empty-state fade-in">
                <div class="empty-state-icon">📸</div>
                <p class="empty-state-text">No hay publicaciones aún</p>
            </div>
        `;
        return;
    }
    
    // Crear fragmento para mejor rendimiento
    const fragment = document.createDocumentFragment();
    
    posts.forEach(post => {
        const postElement = createPostElement(post, onEdit, onDelete);
        fragment.appendChild(postElement);
    });
    
    container.appendChild(fragment);
}

/**
 * Muestra estado de carga
 */
export function showLoadingState(container) {
    container.innerHTML = `
        <div class="loading fade-in">
            <div class="loading-spinner"></div>
        </div>
    `;
}

/**
 * Elimina un post del DOM con animación
 */
export function removePostElement(id) {
    const postElement = document.querySelector(`[data-post-id="${id}"]`);
    if (postElement) {
        postElement.style.animation = 'fadeOut 0.3s ease-out';
        setTimeout(() => {
            postElement.remove();
        }, 300);
    }
}

/**
 * Añade un nuevo post al inicio del feed
 */
export function prependPost(postData, container, onEdit, onDelete) {
    const postElement = createPostElement(postData, onEdit, onDelete);
    postElement.classList.remove('stagger-item');
    postElement.classList.add('fade-in-scale');
    
    // Insertar al inicio
    const firstChild = container.firstChild;
    if (firstChild) {
        container.insertBefore(postElement, firstChild);
    } else {
        container.appendChild(postElement);
    }
}

/**
 * Actualiza un post existente en el DOM
 * Modifica solo los campos que cambiaron, sin recrear el elemento
 */
export function updatePostElement(postData, container, onEdit, onDelete) {
    console.log('🔍 Buscando post con ID:', postData.id);
    const existingPost = document.querySelector(`[data-post-id="${postData.id}"]`);
    
    if (!existingPost) {
        console.error('❌ Post no encontrado en el DOM con ID:', postData.id);
        console.log('Posts en DOM:', Array.from(document.querySelectorAll('[data-post-id]')).map(p => p.dataset.postId));
        return;
    }
    
    console.log('✅ Post encontrado, actualizando...');

    // Actualizar imagen (solo si cambió)
    const img = existingPost.querySelector('.post-image');
    if (img && img.src !== postData.imageUrl) {
        img.style.opacity = '0';
        img.style.transition = 'opacity 0.3s';
        setTimeout(() => {
            img.src = postData.imageUrl;
            img.alt = postData.caption;
            img.onload = () => { img.style.opacity = '1'; };
        }, 300);
    }

    // Actualizar autor
    const author = existingPost.querySelector('.post-author');
    if (author) author.textContent = postData.author;

    // Actualizar caption
    const caption = existingPost.querySelector('.post-caption');
    if (caption) caption.textContent = postData.caption;

    // Actualizar fecha
    const date = existingPost.querySelector('.post-date');
    if (date) date.textContent = formatDate(postData.updatedAt || postData.createdAt);

    // Actualizar el callback del botón editar con los nuevos datos
    const editBtn = existingPost.querySelector('.post-action-btn:not(.delete)');
    if (editBtn) editBtn.onclick = () => onEdit(postData);

    // Actualizar el callback del botón eliminar
    const deleteBtn = existingPost.querySelector('.post-action-btn.delete');
    if (deleteBtn) deleteBtn.onclick = () => onDelete(postData.id);

    // Animación sutil para indicar que se actualizó
    existingPost.style.transition = 'box-shadow 0.3s, transform 0.3s';
    existingPost.style.boxShadow = '0 0 0 3px #4ECDC4';
    existingPost.style.transform = 'scale(1.02)';
    setTimeout(() => {
        existingPost.style.boxShadow = '';
        existingPost.style.transform = '';
    }, 800);
}
