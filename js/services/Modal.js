/**
 * Modal Component - Maneja el modal para crear/editar posts
 */

export class Modal {
    constructor(modalId) {
        this.modal    = document.getElementById(modalId);
        this.overlay  = document.getElementById('modalOverlay');
        this.closeBtn = document.getElementById('modalClose');
        this.form     = document.getElementById('postForm');
        this.title    = document.getElementById('modalTitle');

        this.isEditMode    = false;
        this.currentPostId = null;

        this.init();
    }

    init() {
        this.overlay.addEventListener('click', () => this.close());
        this.closeBtn.addEventListener('click', () => this.close());
        document.getElementById('btnCancel').addEventListener('click', () => this.close());

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen()) this.close();
        });

        document.querySelector('.modal-content').addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }

    openForCreate() {
        this.isEditMode    = false;
        this.currentPostId = null;

        this.title.textContent = 'Nueva Publicación';
        document.getElementById('btnSubmit').textContent = 'Publicar';

        this.resetForm();
        this.open();
    }

    openForEdit(postData) {
        this.isEditMode    = true;
        this.currentPostId = postData.id;

        this.title.textContent = 'Editar Publicación';
        document.getElementById('btnSubmit').textContent = 'Actualizar';

        document.getElementById('postImage').value   = postData.imageUrl;
        document.getElementById('postCaption').value = postData.caption;
        document.getElementById('postAuthor').value  = postData.author;
        document.getElementById('postId').value      = postData.id;
        
        console.log('📝 Modal abierto para EDITAR - ID del post:', postData.id);
        console.log('Campo postId ahora contiene:', document.getElementById('postId').value);

        this.open();
    }

    open() {
        this.modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        setTimeout(() => document.getElementById('postImage').focus(), 100);
    }

    close() {
        this.modal.classList.remove('active');
        document.body.style.overflow = '';

        // ⚠️ Resetear con setTimeout para que app.js pueda leer
        // isEditMode y currentPostId antes de que se borren
        setTimeout(() => {
            this.isEditMode    = false;
            this.currentPostId = null;
            this.resetForm();
        }, 0);
    }

    isOpen() {
        return this.modal.classList.contains('active');
    }

    resetForm() {
        this.form.reset();
        document.getElementById('postId').value = '';
    }

    getFormData() {
        const postId = document.getElementById('postId').value;
        return {
            id:       postId ? Number(postId) : null,
            imageUrl: document.getElementById('postImage').value.trim(),
            caption:  document.getElementById('postCaption').value.trim(),
            author:   document.getElementById('postAuthor').value.trim(),
        };
    }

    validateForm(data) {
        const errors = [];

        if (!data.imageUrl) {
            errors.push('La URL de la imagen es requerida');
        } else if (!this.isValidUrl(data.imageUrl)) {
            errors.push('La URL de la imagen no es válida');
        }

        if (!data.caption || data.caption.length < 3) {
            errors.push('La descripción debe tener al menos 3 caracteres');
        }

        if (!data.author || data.author.length < 2) {
            errors.push('El nombre del autor debe tener al menos 2 caracteres');
        }

        return errors;
    }

    isValidUrl(string) {
        try {
            const url = new URL(string);
            return url.protocol === 'http:' || url.protocol === 'https:';
        } catch (_) {
            return false;
        }
    }

    handleSubmit(callback) {
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();

            const formData = this.getFormData();
            const errors   = this.validateForm(formData);

            if (errors.length > 0) {
                callback(null, errors);
                return;
            }

            callback(formData, null);
        });
    }

    setSubmitLoading(isLoading) {
        const btn = document.getElementById('btnSubmit');
        if (isLoading) {
            btn.disabled    = true;
            btn.textContent = 'Procesando...';
        } else {
            btn.disabled    = false;
            btn.textContent = this.isEditMode ? 'Actualizar' : 'Publicar';
        }
    }
}