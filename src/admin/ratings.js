import { getAllRatingsAdmin, deleteRating } from '../services/ratings.js';
import { formatDate } from '../utils/helpers.js';
import { renderAdminLayout, requireAdmin } from './layout.js';

export async function renderRatingsAdmin() {
  if (!requireAdmin()) return;
  const container = renderAdminLayout('/admin/calificaciones');
  container.innerHTML = '<div class="admin-header"><h1>Calificaciones</h1></div><div class="admin-card"><div class="empty-state"><p>Cargando...</p></div></div>';

  try {
    const ratings = await getAllRatingsAdmin();
    if (!ratings.length) {
      container.innerHTML = '<div class="admin-header"><h1>Calificaciones</h1></div><div class="admin-card"><div class="empty-state"><h3>No hay calificaciones</h3></div></div>';
      return;
    }

    container.innerHTML =
      '<div class="admin-header"><h1>Calificaciones</h1></div>' +
      '<div class="admin-card"><table class="admin-table"><thead><tr><th>Historia ID</th><th>Calificación</th><th>Visitante</th><th>Fecha</th><th>Acciones</th></tr></thead><tbody>' +
        ratings.map(r =>
          '<tr><td>' + r.storyId + '</td>' +
          '<td style="color:var(--color-warning);font-weight:600">' + '★'.repeat(r.rating) + ' ' + r.rating + '/5</td>' +
          '<td style="font-size:0.8rem;color:var(--text-tertiary)">' + r.visitorIdentifier + '</td>' +
          '<td>' + formatDate(r.createdAt) + '</td>' +
          '<td><button class="btn btn-sm btn-danger delete-rating-btn" data-id="' + r.id + '">Eliminar</button></td></tr>'
        ).join('') +
      '</tbody></table></div>';

    container.querySelectorAll('.delete-rating-btn').forEach(btn => {
      btn.addEventListener('click', async function() {
        if (!confirm('¿Eliminar esta calificación?')) return;
        await deleteRating(this.dataset.id);
        renderRatingsAdmin();
      });
    });
  } catch (error) {
    console.error('Error:', error);
  }
}
