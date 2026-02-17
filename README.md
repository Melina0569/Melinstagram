# 🚀 INICIO RÁPIDO - Mini Instagram

## 📋 PASO 1: Abrir con Servidor Local

**IMPORTANTE:** Esta aplicación usa módulos ES6 de JavaScript, por lo que DEBES abrirla con un servidor local.

### Opción A: Python (más fácil)
```bash
# Abre tu terminal en la carpeta mini-instagram
python -m http.server 8000
```

Luego abre en tu navegador: **http://localhost:8000**

### Opción B: Node.js
```bash
npx http-server -p 8000
```

### Opción C: PHP
```bash
php -S localhost:8000
```

### Opción D: VS Code
- Instala la extensión "Live Server"
- Click derecho en index.html
- "Open with Live Server"

---

## 📁 ORDEN DE LOS ARCHIVOS

### 1. HTML Principal
```
index.html  ← Abre este archivo primero
```

### 2. CSS (se cargan en este orden)
```
css/
├── 1. variables.css    ← Define colores, fuentes, espaciado
├── 2. reset.css        ← Reset del navegador
├── 3. animations.css   ← Animaciones
├── 4. components.css   ← Estilos de botones, cards, modal
└── 5. main.css         ← Layout y estructura
```

**¿Por qué este orden?**
- `variables.css` DEBE ir primero porque los demás archivos usan sus variables
- `reset.css` normaliza los estilos del navegador
- Los demás archivos dependen de estos dos

### 3. JavaScript (módulos)
```
js/
├── app.js              ← ARCHIVO PRINCIPAL (orquesta todo)
│
├── services/
│   └── api.js          ← GET, POST, PUT, DELETE con Fetch
│
├── components/
│   ├── Post.js         ← Renderiza publicaciones
│   ├── Modal.js        ← Ventana modal para crear/editar
│   └── Toast.js        ← Notificaciones
│
└── utils/
    └── helpers.js      ← Funciones útiles (formatDate, etc)
```

**Flujo de dependencias:**
```
app.js (principal)
  ↓
  ├── importa api.js
  ├── importa Post.js (que importa helpers.js)
  ├── importa Modal.js
  └── importa Toast.js
```

---

## 🔄 CÓMO FUNCIONA LA APP

### 1. Al Cargar la Página (GET)
```javascript
// app.js ejecuta:
loadPosts() → API.getAllPosts() → Fetch GET → Renderiza posts
```

### 2. Crear Publicación (POST)
```
Click "Nueva Publicación" 
  → Abre Modal 
  → Llenar formulario 
  → Click "Publicar"
  → API.createPost() 
  → Fetch POST 
  → Añade post al DOM
```

### 3. Editar Publicación (PUT)
```
Click ✏️ en una publicación
  → Abre Modal con datos
  → Modificar campos
  → Click "Actualizar"
  → API.updatePost()
  → Fetch PUT
  → Actualiza post en DOM
```

### 4. Eliminar Publicación (DELETE)
```
Click 🗑️ en una publicación
  → Confirmar eliminación
  → API.deletePost()
  → Fetch DELETE
  → Remueve post del DOM
```

---

## 📖 EXPLICACIÓN DE FETCH

### GET - Obtener datos
```javascript
const response = await fetch('https://api.ejemplo.com/posts', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
});
const posts = await response.json();
```

### POST - Crear datos
```javascript
const response = await fetch('https://api.ejemplo.com/posts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        author: 'Juan',
        caption: 'Mi post',
        imageUrl: 'https://...'
    })
});
const newPost = await response.json();
```

### PUT - Actualizar datos
```javascript
const response = await fetch('https://api.ejemplo.com/posts/123', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        author: 'Juan Actualizado',
        caption: 'Descripción modificada'
    })
});
const updatedPost = await response.json();
```

### DELETE - Eliminar datos
```javascript
const response = await fetch('https://api.ejemplo.com/posts/123', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' }
});
```

---

## 🎯 ARCHIVOS IMPORTANTES

| Archivo | Qué hace |
|---------|----------|
| **index.html** | Página principal con estructura HTML |
| **js/app.js** | Orquesta toda la aplicación |
| **js/services/api.js** | Implementa GET, POST, PUT, DELETE |
| **js/components/Post.js** | Componente para renderizar posts |
| **js/components/Modal.js** | Componente del modal |
| **js/components/Toast.js** | Sistema de notificaciones |
| **css/variables.css** | Variables de diseño (colores, fuentes) |
| **css/components.css** | Estilos de todos los componentes |

---

## 🧪 PROBAR TODAS LAS OPERACIONES

Abre la **Consola del Navegador** (F12) y ejecuta:

```javascript
window.demonstrateCRUD()
```

Esto ejecutará automáticamente:
1. GET - Obtener posts
2. POST - Crear un post
3. PUT - Actualizar ese post
4. DELETE - Eliminar el post

---

## ⚠️ PROBLEMAS COMUNES

### "No se cargan los estilos"
✅ Verifica que los archivos CSS estén en la carpeta `css/`
✅ Revisa la consola del navegador para errores 404

### "Error de CORS" o "Module not found"
✅ DEBES usar un servidor local (no abrir directamente el archivo HTML)
✅ Usa Python: `python -m http.server 8000`

### "Las imágenes no cargan"
✅ Usa URLs válidas de imágenes
✅ Prueba con: `https://picsum.photos/600/600`

### "No pasa nada al hacer click"
✅ Abre la consola (F12) y busca errores
✅ Verifica que todos los archivos JS estén presentes

---

## 🎓 CONCEPTOS QUE APRENDERÁS

- ✅ **Fetch API**: Cómo hacer peticiones HTTP
- ✅ **Métodos HTTP**: GET, POST, PUT, DELETE (CRUD)
- ✅ **Async/Await**: Manejo de código asíncrono
- ✅ **Módulos ES6**: import/export
- ✅ **Componentes**: Arquitectura modular
- ✅ **DOM**: Manipulación del DOM
- ✅ **Eventos**: Event listeners
- ✅ **CSS Moderno**: Variables, Grid, Flexbox, Animaciones

---

## 🎨 PERSONALIZACIÓN

### Cambiar Colores
Edita `css/variables.css`:
```css
:root {
    --color-primary: #FF6B9D;     /* Cambia este */
    --color-secondary: #4ECDC4;   /* Y este */
}
```

### Cambiar Fuentes
Edita `css/variables.css`:
```css
:root {
    --font-display: 'Playfair Display', serif;  /* Títulos */
    --font-body: 'DM Sans', sans-serif;         /* Texto */
}
```

### Usar tu Propia API
Edita `js/services/api.js`:
```javascript
const API_BASE_URL = 'https://tu-api.com';  // Cambia esto
```

---

## 📞 SIGUIENTE NIVEL

Después de entender este proyecto, puedes:

1. **Crear tu propio Backend** con Node.js + Express
2. **Agregar Base de Datos** (MongoDB, PostgreSQL)
3. **Implementar Autenticación** (JWT, OAuth)
4. **Subir Imágenes Reales** (Cloudinary, AWS S3)
5. **Agregar Funciones**: Likes, Comentarios, Seguidores
6. **Deploy**: Vercel, Netlify, Railway

---

## ✨ ¡LISTO!

1. Abre tu terminal en la carpeta `mini-instagram`
2. Ejecuta: `python -m http.server 8000`
3. Abre: `http://localhost:8000`
4. ¡Disfruta aprendiendo!

**🎯 Tip:** Abre la consola del navegador para ver logs de todas las operaciones HTTP.