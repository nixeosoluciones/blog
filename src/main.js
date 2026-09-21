import './styles/base.css';
import './styles/components.css';
import './styles/footer.css';
import './styles/pages.css';
import './styles/story.css';
import './styles/chapter.css';
import './styles/admin.css';
import './styles/editor.css';

import { initRouter, addRoute, setNotFound } from './router.js';
import { initAuth, onAuthChange, getUser } from './services/auth.js';
import { renderHeader } from './components/header.js';
import { renderFooter } from './components/footer.js';
import { initSearchModal } from './components/search.js';
import { getThemePreference } from './utils/helpers.js';

import { renderHomePage } from './pages/home.js';
import { renderStoriesPage } from './pages/stories.js';
import { renderStoryPage } from './pages/story.js';
import { renderChapterPage } from './pages/chapter.js';
import { renderAuthorsPage } from './pages/authors.js';
import { renderAuthorPage } from './pages/author.js';
import { renderCategoriesPage, renderCategoryPage, renderTagPage } from './pages/categories.js';
import { renderEditorialPage } from './pages/editorial.js';
import { renderLoginPage } from './pages/login.js';
import { renderSetupAdminPage } from './pages/setupAdmin.js';

import { renderStoriesAdmin, renderStoryFormAdmin } from './admin/stories.js';
import { renderChaptersAdmin } from './admin/chapters.js';
import { renderChapterEditorAdmin } from './admin/chapterEditor.js';
import { renderAuthorsAdmin, renderAuthorFormAdmin } from './admin/authors.js';
import { renderCategoriesAdmin, renderCategoryFormAdmin } from './admin/categories.js';
import { renderTagsAdmin, renderTagFormAdmin } from './admin/tags.js';
import { renderCommentsAdmin } from './admin/comments.js';
import { renderRatingsAdmin } from './admin/ratings.js';
import { renderEditorialAdmin } from './admin/editorial.js';
import { renderDashboard } from './admin/layout.js';

async function init() {
  try {
    document.documentElement.setAttribute('data-theme', getThemePreference());

    renderHeader();
    renderFooter();
    initSearchModal();

  addRoute('/', async () => { renderHeader(); await renderHomePage(); });
  addRoute('/historias', async () => { renderHeader(); await renderStoriesPage(); });
  addRoute('/historias/:slug', async (p) => { renderHeader(); await renderStoryPage(p); });
  addRoute('/historias/:slug/:chapterSlug', async (p) => { renderHeader(); await renderChapterPage(p); });
  addRoute('/autores', async () => { renderHeader(); await renderAuthorsPage(); });
  addRoute('/autores/:slug', async (p) => { renderHeader(); await renderAuthorPage(p); });
  addRoute('/categorias', async () => { renderHeader(); await renderCategoriesPage(); });
  addRoute('/categorias/:slug', async (p) => { renderHeader(); await renderCategoryPage(p); });
  addRoute('/etiquetas/:tag', async (p) => { renderHeader(); await renderTagPage(p); });
  addRoute('/editorial', async () => { renderHeader(); await renderEditorialPage(); });
  addRoute('/login', async () => { renderHeader(); await renderLoginPage(); });
  addRoute('/setup-admin', async () => { renderHeader(); await renderSetupAdminPage(); });

  addRoute('/admin', async () => {
    const { requireAdmin } = await import('./admin/layout.js');
    if (requireAdmin()) { renderHeader(); renderDashboard(document.getElementById('main-content')); }
  });
  addRoute('/admin/historias', async () => { renderHeader(); await renderStoriesAdmin(); });
  addRoute('/admin/historias/nueva', async () => { renderHeader(); await renderStoryFormAdmin({ id: 'nueva' }); });
  addRoute('/admin/historias/:id/editar', async (p) => { renderHeader(); await renderStoryFormAdmin(p); });
  addRoute('/admin/historias/:storyId/capitulos', async (p) => { renderHeader(); await renderChaptersAdmin(p); });
  addRoute('/admin/capitulos/:chapterId/editar', async (p) => { renderHeader(); await renderChapterEditorAdmin(p); });
  addRoute('/admin/autores', async () => { renderHeader(); await renderAuthorsAdmin(); });
  addRoute('/admin/autores/nuevo', async () => { renderHeader(); await renderAuthorFormAdmin({ id: 'nuevo' }); });
  addRoute('/admin/autores/:id/editar', async (p) => { renderHeader(); await renderAuthorFormAdmin(p); });
  addRoute('/admin/categorias', async () => { renderHeader(); await renderCategoriesAdmin(); });
  addRoute('/admin/categorias/nueva', async () => { renderHeader(); await renderCategoryFormAdmin({ id: 'nueva' }); });
  addRoute('/admin/categorias/:id/editar', async (p) => { renderHeader(); await renderCategoryFormAdmin(p); });
  addRoute('/admin/etiquetas', async () => { renderHeader(); await renderTagsAdmin(); });
  addRoute('/admin/etiquetas/nueva', async () => { renderHeader(); await renderTagFormAdmin({ id: 'nueva' }); });
  addRoute('/admin/etiquetas/:id/editar', async (p) => { renderHeader(); await renderTagFormAdmin(p); });
  addRoute('/admin/comentarios', async () => { renderHeader(); await renderCommentsAdmin(); });
  addRoute('/admin/calificaciones', async () => { renderHeader(); await renderRatingsAdmin(); });
  addRoute('/admin/editorial', async () => { renderHeader(); await renderEditorialAdmin(); });

  setNotFound(() => {
    renderHeader();
    const main = document.getElementById('main-content');
    main.innerHTML = '<div class="container section"><div class="empty-state"><h1>404</h1><p>Página no encontrada</p><a href="/" data-link class="btn btn-primary" style="margin-top:1rem">Volver al inicio</a></div></div>';
  });

  await initAuth();
  window.__getCurrentUser = getUser;
  initRouter();
  } catch (error) {
    console.error('Error inicializando la app:', error);
    document.getElementById('main-content').innerHTML =
      '<div style="max-width:600px;margin:4rem auto;padding:2rem;text-align:center">' +
        '<h1>Error al iniciar</h1>' +
        '<p style="color:#ef4444;margin:1rem 0">' + error.message + '</p>' +
        '<p style="color:#666">Abre la consola del navegador (F12) para ver más detalles.</p>' +
        '<p style="color:#666;margin-top:1rem"><strong>Posibles causas:</strong></p>' +
        '<ul style="text-align:left;color:#666;display:inline-block">' +
          '<li>Firestore no está habilitado en Firebase Console</li>' +
          '<li>Authentication no está habilitado en Firebase Console</li>' +
          '<li>Las variables de entorno no están configuradas</li>' +
        '</ul>' +
      '</div>';
  }
}

init();
