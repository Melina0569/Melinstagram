/**
 * API Service - Maneja todas las peticiones HTTP
 * Implementa GET, POST, PUT, DELETE usando fetch
 */

// URL base de la API (usando JSONPlaceholder como API de prueba)
const API_BASE_URL = 'https://jsonplaceholder.typicode.com';
const POSTS_ENDPOINT = `${API_BASE_URL}/posts`;

// Configuración por defecto para las peticiones
const defaultHeaders = {
    'Content-Type': 'application/json',
};

/**
 * GET - Obtener todos los posts
 */
export async function getAllPosts() {
    try {
        const response = await fetch(POSTS_ENDPOINT, {
            method: 'GET',
            headers: defaultHeaders,
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        // Limitar a 10 posts para mejor UX
        return data.slice(0, 10).map(post => transformPost(post));
    } catch (error) {
        console.error('Error fetching posts:', error);
        throw error;
    }
}

/**
 * GET - Obtener un post específico por ID
 */
export async function getPostById(id) {
    try {
        const response = await fetch(`${POSTS_ENDPOINT}/${id}`, {
            method: 'GET',
            headers: defaultHeaders,
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return transformPost(data);
    } catch (error) {
        console.error(`Error fetching post ${id}:`, error);
        throw error;
    }
}

/**
 * POST - Crear un nuevo post
 */
export async function createPost(postData) {
    try {
        const response = await fetch(POSTS_ENDPOINT, {
            method: 'POST',
            headers: defaultHeaders,
            body: JSON.stringify({
                title: postData.author,
                body: postData.caption,
                userId: 1,
                // Campos personalizados (no se guardarán realmente en JSONPlaceholder)
                imageUrl: postData.imageUrl,
                author: postData.author,
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        // Transformar respuesta con datos del cliente (ya que JSONPlaceholder no los guarda)
        return {
            ...postData,
            id: data.id,  // ← ID del servidor SIEMPRE sobrescribe (correctamente)
            createdAt: new Date().toISOString(),
        };
    } catch (error) {
        console.error('Error creating post:', error);
        throw error;
    }
}

/**
 * PUT - Actualizar un post existente
 */
export async function updatePost(id, postData) {
    try {
        // Para posts creados localmente (con IDs > 100), solo actualizar UI sin hacer petición
        if (id > 100) {
            console.log('📝 Post creado localmente detectado (ID:', id, ') - Actualizar solo en UI');
            return {
                ...postData,
                id: id,
                updatedAt: new Date().toISOString(),
            };
        }
        
        const response = await fetch(`${POSTS_ENDPOINT}/${id}`, {
            method: 'PATCH',
            headers: defaultHeaders,
            body: JSON.stringify({
                title: postData.author,
                body: postData.caption,
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        return {
            ...postData,
            id: data.id,
            updatedAt: new Date().toISOString(),
        };
    } catch (error) {
        console.error(`Error updating post ${id}:`, error);
        throw error;
    }
}

/**
 * DELETE - Eliminar un post
 */
export async function deletePost(id) {
    try {
        const response = await fetch(`${POSTS_ENDPOINT}/${id}`, {
            method: 'DELETE',
            headers: defaultHeaders,
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return { success: true, id };
    } catch (error) {
        console.error(`Error deleting post ${id}:`, error);
        throw error;
    }
}

/**
 * Transforma los datos de la API a nuestro formato
 */
function transformPost(apiPost) {
    // Generar URLs de imágenes aleatorias de Unsplash
    const imageId = Math.floor(Math.random() * 1000);
    
    return {
        id: apiPost.id,
        author: apiPost.title || `Usuario ${apiPost.userId}`,
        caption: apiPost.body || '',
        imageUrl: apiPost.imageUrl || `https://picsum.photos/600/600?random=${imageId}`,
        createdAt: new Date().toISOString(),
    };
}

/**
 * Manejo de errores personalizado
 */
export class APIError extends Error {
    constructor(message, status) {
        super(message);
        this.name = 'APIError';
        this.status = status;
    }
}