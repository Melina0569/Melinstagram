/**
 * App Principal - Orquesta toda la aplicación
 * Implementa los 4 métodos HTTP: GET, POST, PUT, DELETE
 */

import * as API from './components/api.js';
import { renderPosts, showLoadingState, prependPost, updatePostElement, removePostElement } from './services/Post.js';
import { Modal } from './services/Modal.js';
import { toast } from './services/Toast.js';

// Estado de la aplicación
const state = {
    posts: [],
    isLoading: false,
};

// Referencias a elementos del DOM
const feedContainer = document.getElementById('feed');
const btnNewPost = document.getElementById('btnNewPost');

// Instanciar el modal
const modal = new Modal('postModal');

/**
 * Inicializa la aplicación
 */
async function init() {
    console.log('🚀 Iniciando Mini Instagram...');
    
    // Cargar posts iniciales
    await loadPosts();
    
    // Configurar event listeners
    setupEventListeners();
    
    console.log('✅ Aplicación iniciada correctamente');
}

/**
 * Configura todos los event listeners
 */
function setupEventListeners() {
    // Botón para crear nuevo post
    btnNewPost.addEventListener('click', handleNewPostClick);
    
    // Manejar submit del formulario
    modal.handleSubmit(handleFormSubmit);
}

/**
 * GET - Carga todos los posts desde la API
 */
async function loadPosts() {
    try {
        state.isLoading = true;
        showLoadingState(feedContainer);
        
        console.log('📥 Obteniendo posts (GET)...');
        const posts = await API.getAllPosts();
        
        state.posts = posts;
        state.isLoading = false;
        
        renderPosts(state.posts, feedContainer, handleEditPost, handleDeletePost);
        
        console.log(`✅ ${posts.length} posts cargados`);
    } catch (error) {
        state.isLoading = false;
        console.error('❌ Error al cargar posts:', error);
        toast.error('Error al cargar las publicaciones');
        feedContainer.innerHTML = '<div class="empty-state">Error al cargar publicaciones</div>';
    }
}

/**
 * Click en botón "Nueva Publicación"
 */
function handleNewPostClick() {
    modal.openForCreate();
}

/**
 * POST o PUT - Maneja el submit del formulario
 */
async function handleFormSubmit(postData, errors) {
    // Validar errores
    if (errors && errors.length > 0) {
        toast.error(errors[0]);
        return;
    }
    
    console.log('📋 Formulario enviado con datos:', postData);
    console.log('¿Tiene ID?:', postData.id != null);
    
    modal.setSubmitLoading(true);
    
    try {
        // Si tiene ID, es una actualización (PUT), sino es creación (POST)
        if (postData.id != null) {
            console.log('➡️ Detectado: ACTUALIZAR (PUT)');
            await handleUpdatePost(postData);
        } else {
            console.log('➡️ Detectado: CREAR (POST)');
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

/**
 * POST - Crea un nuevo post
 */
async function handleCreatePost(postData) {
    try {
        console.log('📤 Creando nuevo post (POST)...', postData);
        
        const newPost = await API.createPost(postData);
        
        // Añadir al estado
        state.posts.unshift(newPost);
        
        // Añadir al DOM
        prependPost(newPost, feedContainer, handleEditPost, handleDeletePost);
        
        toast.success('¡Publicación creada exitosamente!');
        console.log('✅ Post creado:', newPost);
    } catch (error) {
        console.error('❌ Error al crear post:', error);
        throw error;
    }
}

/**
 * PUT - Actualiza un post existente
 */
async function handleUpdatePost(postData) {
    try {
        console.log('📤 Actualizando post (PUT)...', postData);
        
        const updatedPost = await API.updatePost(postData.id, postData);
        
        // Actualizar en el estado
        const index = state.posts.findIndex(p => p.id === postData.id);
        if (index !== -1) {
            state.posts[index] = updatedPost;
        }
        
        // Actualizar en el DOM
        updatePostElement(updatedPost, feedContainer, handleEditPost, handleDeletePost);
        
        toast.success('¡Publicación actualizada exitosamente!');
        console.log('✅ Post actualizado:', updatedPost);
    } catch (error) {
        console.error('❌ Error al actualizar post:', error);
        throw error;
    }
}

/**
 * Abre modal para editar un post
 */
function handleEditPost(postData) {
    modal.openForEdit(postData, handleFormSubmit);
}

/**
 * DELETE - Elimina un post
 */
async function handleDeletePost(postId) {
    // Confirmar eliminación
    const confirmed = confirm('¿Estás seguro de que quieres eliminar esta publicación?');
    if (!confirmed) return;
    
    try {
        console.log(`🗑️ Eliminando post ${postId} (DELETE)...`);
        
        await API.deletePost(postId);
        
        // Remover del estado
        state.posts = state.posts.filter(p => p.id !== postId);
        
        // Remover del DOM
        removePostElement(postId);
        
        toast.success('Publicación eliminada');
        console.log(`✅ Post ${postId} eliminado`);
        
        // Si no quedan posts, mostrar estado vacío
        if (state.posts.length === 0) {
            feedContainer.innerHTML = `
                <div class="empty-state fade-in">
                    <div class="empty-state-icon">📸</div>
                    <p class="empty-state-text">No hay publicaciones aún</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('❌ Error al eliminar post:', error);
        toast.error('Error al eliminar la publicación');
    }
}

/**
 * Función de demostración de todas las operaciones CRUD
 */
async function demonstrateCRUD() {
    console.log('🎯 Demostración de operaciones CRUD:');
    
    // 1. GET - Leer todos los posts
    console.log('\n1️⃣ GET - Obtener todos los posts');
    const posts = await API.getAllPosts();
    console.log('Posts obtenidos:', posts.length);
    
    // 2. POST - Crear un nuevo post
    console.log('\n2️⃣ POST - Crear nuevo post');
    const newPostData = {
        author: 'Usuario Demo',
        caption: 'Esta es una publicación de demostración',
        imageUrl: 'https://picsum.photos/600/600?random=999'
    };
    const createdPost = await API.createPost(newPostData);
    console.log('Post creado:', createdPost);
    
    // 3. PUT - Actualizar el post
    console.log('\n3️⃣ PUT - Actualizar post');
    const updateData = {
        author: 'Usuario Actualizado',
        caption: 'Descripción actualizada',
        imageUrl: 'https://picsum.photos/600/600?random=888'
    };
    const updatedPost = await API.updatePost(createdPost.id, updateData);
    console.log('Post actualizado:', updatedPost);
    
    // 4. DELETE - Eliminar el post
    console.log('\n4️⃣ DELETE - Eliminar post');
    const result = await API.deletePost(createdPost.id);
    console.log('Post eliminado:', result);
    
    console.log('\n✅ Demostración completada');
}

// Exponer función de demostración en consola
window.demonstrateCRUD = demonstrateCRUD;

// Iniciar la aplicación cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

console.log('💡 Tip: Ejecuta window.demonstrateCRUD() en la consola para ver todas las operaciones CRUD en acción');