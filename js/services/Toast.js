/**
 * Toast Component - Sistema de notificaciones
 */

export class Toast {
    constructor(containerId = 'toastContainer') {
        this.container = document.getElementById(containerId);
        this.toasts = new Map();
        this.defaultDuration = 3000;
    }
    
    /**
     * Muestra una notificación de éxito
     */
    success(message, duration = this.defaultDuration) {
        return this.show(message, 'success', '✓', duration);
    }
    
    /**
     * Muestra una notificación de error
     */
    error(message, duration = this.defaultDuration) {
        return this.show(message, 'error', '✕', duration);
    }
    
    /**
     * Muestra una notificación de advertencia
     */
    warning(message, duration = this.defaultDuration) {
        return this.show(message, 'warning', '⚠', duration);
    }
    
    /**
     * Muestra una notificación de información
     */
    info(message, duration = this.defaultDuration) {
        return this.show(message, 'info', 'ℹ', duration);
    }
    
    /**
     * Método principal para mostrar notificaciones
     */
    show(message, type = 'info', icon = '', duration = this.defaultDuration) {
        const id = this.generateId();
        const toast = this.createToast(id, message, type, icon);
        
        this.container.appendChild(toast);
        this.toasts.set(id, toast);
        
        // Auto-cerrar después de la duración
        if (duration > 0) {
            setTimeout(() => {
                this.remove(id);
            }, duration);
        }
        
        return id;
    }
    
    /**
     * Crea el elemento DOM del toast
     */
    createToast(id, message, type, icon) {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.dataset.toastId = id;
        
        toast.innerHTML = `
            <div class="toast-icon">${icon}</div>
            <div class="toast-message">${this.escapeHtml(message)}</div>
        `;
        
        // Hacer clickeable para cerrar
        toast.addEventListener('click', () => {
            this.remove(id);
        });
        
        return toast;
    }
    
    /**
     * Elimina un toast
     */
    remove(id) {
        const toast = this.toasts.get(id);
        if (!toast) return;
        
        // Animar salida
        toast.style.animation = 'slideOutRight 0.3s ease-out';
        
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
            this.toasts.delete(id);
        }, 300);
    }
    
    /**
     * Elimina todos los toasts
     */
    clear() {
        this.toasts.forEach((_, id) => {
            this.remove(id);
        });
    }
    
    /**
     * Genera un ID único
     */
    generateId() {
        return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    
    /**
     * Escapa HTML para prevenir XSS
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Añadir animación de salida
const style = document.createElement('style');
style.textContent = `
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(120%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Exportar instancia singleton
export const toast = new Toast();