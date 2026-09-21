import { getAllCommentsAdmin, updateComment, deleteComment } from '../services/comments.js';
import { formatDate } from '../utils/helpers.js';
import { renderAdminLayout, requireAdmin } from './layout.js';

export async function renderCommentsAdmin() {
  if (!requireAdmin()) return;
  const container = renderAdminLayout('/admin/comentarios');
  container.innerHTML = '<div class="admin-header"><h1>Comentarios</h1></div><div class="admin-card"><div class="empty-state"><p>Cargando...</p></div></div>';

  try {
    const comments = await getAllCommentsAdmin();
    if (!comments.length) {
      container.innerHTML = '<div class="admin-header"><h1>Comentarios</h1></div><div class="admin-card"><div class="empty-state"><h3>No hay comentarios</h3></div></div>';
      return;
    }

    container.innerHTML =
      '<div class="admin-header"><h1>Comentarios</h1></div>' +
      '<div class="admin-card"><table class="admin-table"><thead><tr><th>Autor</th><th>Comentario</th><th>Estado</th><th>Fecha</th><th>Acciones</th></tr></thead><tbody>' +
        comments.map(c =>
          '<tr><td style="font-weight:600">' + escapeHtml(c.name) + '</td>' +
          '<td style="max-width:300px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + escapeHtml(c.comment) + '</td>' +
          '<td><span class="status-badge ' + (c.status === 'approved' ? 'status-published' : 'status-draft') + '">' + (c.status === 'approved' ? 'Aprobado' : 'Oculto') + '</span></td>' +
          '<td>' + formatDate(c.createdAt) + '</td>' +
          '<td>' +
            '<button class="btn btn-sm btn-secondary toggle-comment-btn" data-id="' + c.id + '" data-status="' + c.status + '">' + (c.status === 'approved' ? 'Ocultar' : 'Aprobar') + '</button> ' +
            '<button class="btn btn-sm btn-danger delete-comment-btn" data-id="' + c.id + '">Eliminar</button>' +
          '</td></tr>'
        ).join('') +
      '</tbody></table></div>';

    container.querySelectorAll('.toggle-comment-btn').forEach(btn => {
      btn.addEventListener('click', async function() {
        const newStatus = this.dataset.status === 'approved' ? 'hidden' : 'approved';
        await updateComment(this.dataset.id, { status: newStatus });
        renderCommentsAdmin();
      });
    });

    container.querySelectorAll('.delete-comment-btn').forEach(btn => {
      btn.addEventListener('click', async function() {
        if (!confirm('¿Eliminar este comentario?')) return;
        await deleteComment(this.dataset.id);
        renderCommentsAdmin();
      });
    });
  } catch (error) {
    console.error('Error:', error);
  }
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
