# Blog Dr. House - Plataforma de Historias Alternativas

Plataforma web moderna tipo blog + CMS de publicación, especializada en historias alternativas, fan fiction, relatos derivados y contenido de fans.

## Tecnologías

- HTML5, CSS3, JavaScript moderno (ES Modules)
- [Vite](https://vitejs.dev/) como bundler
- [Firebase](https://firebase.google.com/) (Firestore + Authentication)
- [TipTap](https://tiptap.dev/) como editor de texto enriquecido
- [Netlify](https://www.netlify.com/) para despliegue

## Estructura del proyecto

```
src/
├── components/       # Componentes reutilizables (header, footer, search)
├── pages/            # Páginas públicas (home, stories, chapter, authors...)
├── admin/            # Panel administrativo
├── editor/           # Configuración de TipTap
├── services/         # Servicios Firebase (Firestore CRUD)
├── styles/           # Hojas de estilo CSS
├── utils/            # Utilidades (helpers, sanitización)
├── router.js         # Router SPA personalizado
└── main.js           # Punto de entrada
```

## Configuración de Firebase

### 1. Crear proyecto Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Crea un nuevo proyecto
3. Habilita **Firestore Database**
4. Habilita **Authentication** con Email/Password

### 2. Crear usuario administrador

1. Ve a Authentication > Users
2. Crea un usuario con email y contraseña
3. Este usuario será tu administrador

### 3. Configurar Security Rules

Copia el contenido de `firestore.rules` a Firestore > Rules en la consola de Firebase.

### 4. Obtener configuración

1. Ve a Project Settings > General > Your apps
2. Registra una app web
3. Copia los valores de configuración

### 5. Crear archivo `.env`

Copia `.env.example` a `.env` y completa los valores:

```
VITE_FIREBASE_API_KEY=tu_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu_proyecto
VITE_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
```

### 6. Ejecutar localmente

```bash
npm install
npm run dev
```

### 7. Subir a GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/usuario/repo.git
git push -u origin main
```

### 8. Conectar con Netlify

1. Ve a [Netlify](https://www.netlify.com/)
2. Conecta tu repositorio de GitHub
3. Configura:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Agrega las variables de entorno en Site Settings > Environment Variables

## Estructura de Firestore

```
stories/{storyId}
  - title, slug, description, coverImageUrl
  - authorId, categoryId, tags[]
  - status (draft/published/finished/archived)
  - chapterCount, averageRating, ratingCount
  - createdAt, updatedAt

volumes/{volumeId}
  - storyId, title, type, order

chapters/{chapterId}
  - storyId, volumeId, title, slug
  - content (HTML de TipTap), order, status

comments/{commentId}
  - storyId, chapterId, name, comment, status

ratings/{ratingId}
  - storyId, rating, visitorIdentifier

authors/{authorId}
  - name, slug, bio, photoUrl, socialLinks[]

categories/{categoryId}
  - name, slug, description, imageUrl

tags/{tagId}
  - name, slug

settings/editorial
  - projectName, authorName, photoUrl, description, content
```

## Imágenes

**NO se usa Firebase Storage.** Todas las imágenes se manejan mediante URLs externas almacenadas como texto en Firestore.

## Desarrollo

```bash
# Modo desarrollo
npm run dev

# Build de producción
npm run build

# Vista previa del build
npm run preview
```

## Licencia

MIT
