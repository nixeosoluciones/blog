import { isAdmin } from '../services/auth.js';

export function requireAdmin() {
  if (!isAdmin()) {
    window.location.href = '/login';
    return false;
  }
  return true;
}

export function renderAdminLayout(activeSection) {
  const main = document.getElementById('main-content');
  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: '📊' },
    { href: '/admin/historias', label: 'Historias', icon: '📖' },
    { href: '/admin/autores', label: 'Autores', icon: '👤' },
    { href: '/admin/categorias', label: 'Categorías', icon: '🏷️' },
    { href: '/admin/etiquetas', label: 'Etiquetas', icon: '🔖' },
    { href: '/admin/comentarios', label: 'Comentarios', icon: '💬' },
    { href: '/admin/calificaciones', label: 'Calificaciones', icon: '⭐' },
    { href: '/admin/editorial', label: 'Editorial', icon: '📰' },
  ];

  const navHTML = navItems.map(item =>
    '<li class="admin-nav-item">' +
      '<a href="' + item.href + '" data-link class="admin-nav-link' + (item.href === activeSection ? ' active' : '') + '">' +
        '<span>' + item.icon + '</span> ' + item.label +
      '</a>' +
    '</li>'
  ).join('');

  main.innerHTML =
    '<div class="admin-layout">' +
      '<aside class="admin-sidebar" id="admin-sidebar">' +
        '<div class="admin-sidebar-header">' +
          '<h2>Panel Admin</h2>' +
          '<p>Gestión de contenido</p>' +
        '</div>' +
        '<ul class="admin-nav">' + navHTML + '</ul>' +
      '</aside>' +
      '<div class="admin-main" id="admin-content"></div>' +
    '</div>';

  document.getElementById('admin-content').innerHTML = '<div class="empty-state"><p>Cargando...</p></div>';
  return document.getElementById('admin-content');
}

export function renderDashboard(container) {
  container.innerHTML =
    '<div class="admin-header"><h1>Dashboard</h1></div>' +
    '<div class="stats-grid" id="admin-stats">' +
      '<div class="stat-card"><div class="stat-card-value" id="stat-stories">-</div><div class="stat-card-label">Historias</div></div>' +
      '<div class="stat-card"><div class="stat-card-value" id="stat-chapters">-</div><div class="stat-card-label">Capítulos</div></div>' +
      '<div class="stat-card"><div class="stat-card-value" id="stat-authors">-</div><div class="stat-card-label">Autores</div></div>' +
      '<div class="stat-card"><div class="stat-card-value" id="stat-comments">-</div><div class="stat-card-label">Comentarios</div></div>' +
    '</div>' +
    '<div class="admin-card">' +
      '<h3 style="margin-bottom:1rem">Acciones rápidas</h3>' +
      '<div style="display:flex;gap:0.75rem;flex-wrap:wrap">' +
        '<a href="/admin/historias/nueva" data-link class="btn btn-primary">+ Nueva historia</a>' +
        '<a href="/admin/autores/nuevo" data-link class="btn btn-secondary">+ Nuevo autor</a>' +
        '<a href="/admin/categorias/nueva" data-link class="btn btn-secondary">+ Nueva categoría</a>' +
        '<a href="/admin/etiquetas/nueva" data-link class="btn btn-secondary">+ Nueva etiqueta</a>' +
      '</div>' +
    '</div>';

  loadDashboardStats();
}

async function loadDashboardStats() {
  try {
    const { getAllStoriesAdmin } = await import('../services/stories.js');
    const { getAllCommentsAdmin } = await import('../services/comments.js');
    const { getAuthors } = await import('../services/authors.js');

    const [stories, comments, authors] = await Promise.all([
      getAllStoriesAdmin(),
      getAllCommentsAdmin(),
      getAuthors(),
    ]);

    const totalChapters = stories.reduce((sum, s) => sum + (s.chapterCount || 0), 0);
    document.getElementById('stat-stories').textContent = stories.length;
    document.getElementById('stat-chapters').textContent = totalChapters;
    document.getElementById('stat-authors').textContent = authors.length;
    document.getElementById('stat-comments').textContent = comments.length;
  } catch (error) {
    console.error('Error loading stats:', error);
  }
}
