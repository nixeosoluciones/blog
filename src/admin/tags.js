import { getTags, createTag, updateTag, deleteTag } from '../services/tags.js';
import { slugify } from '../utils/helpers.js';
import { renderAdminLayout, requireAdmin } from './layout.js';

export async function renderTagsAdmin() {
  if (!requireAdmin()) return;
  const container = renderAdminLayout('/admin/etiquetas');
  container.innerHTML = '<div class="admin-header"><h1>Etiquetas</h1><a href="/admin/etiquetas/nueva" data-link class="btn btn-primary">+ Nueva etiqueta</a></div><div class="admin-card"><div class="empty-state"><p>Cargando...</p></div></div>';

  try {
    const tags = await getTags();
    if (!tags.length) {
      container.innerHTML = '<div class="admin-header"><h1>Etiquetas</h1><a href="/admin/etiquetas/nueva" data-link class="btn btn-primary">+ Nueva etiqueta</a></div><div class="admin-card"><div class="empty-state"><h3>No hay etiquetas</h3></div></div>';
      return;
    }

    container.innerHTML =
      '<div class="admin-header"><h1>Etiquetas</h1><a href="/admin/etiquetas/nueva" data-link class="btn btn-primary">+ Nueva etiqueta</a></div>' +
      '<div class="admin-card"><table class="admin-table"><thead><tr><th>Nombre</th><th>Slug</th><th>Acciones</th></tr></thead><tbody>' +
        tags.map(t =>
          '<tr><td style="font-weight:600">#' + t.name + '</td><td>' + t.slug + '</td><td>' +
            '<a href="/admin/etiquetas/' + t.id + '/editar" data-link class="btn btn-sm btn-secondary">Editar</a> ' +
            '<button class="btn btn-sm btn-danger delete-tag-btn" data-id="' + t.id + '">Eliminar</button>' +
          '</td></tr>'
        ).join('') +
      '</tbody></table></div>';

    container.querySelectorAll('.delete-tag-btn').forEach(btn => {
      btn.addEventListener('click', async function() {
        if (!confirm('¿Eliminar esta etiqueta?')) return;
        await deleteTag(this.dataset.id);
        renderTagsAdmin();
      });
    });
  } catch (error) {
    console.error('Error:', error);
  }
}

export async function renderTagFormAdmin(params) {
  if (!requireAdmin()) return;
  const container = renderAdminLayout('/admin/etiquetas');
  const isEdit = params.id && params.id !== 'nueva';
  let tag = null;

  if (isEdit) {
    tag = await (await import('../services/tags.js')).getTagBySlug(params.id);
  }

  container.innerHTML =
    '<div class="admin-header"><h1>' + (isEdit ? 'Editar Etiqueta' : 'Nueva Etiqueta') + '</h1></div>' +
    '<div class="admin-card"><form id="tag-form">' +
      '<div class="form-group"><label class="form-label">Nombre</label><input type="text" class="form-input" id="tag-name" value="' + (tag ? tag.name : '') + '" required></div>' +
      '<div class="form-group"><label class="form-label">Slug</label><input type="text" class="form-input" id="tag-slug" value="' + (tag ? tag.slug : '') + '"></div>' +
      '<div style="display:flex;gap:0.75rem;margin-top:1rem"><button type="submit" class="btn btn-primary">Guardar</button><a href="/admin/etiquetas" data-link class="btn btn-ghost">Cancelar</a></div>' +
    '</form></div>';

  document.getElementById('tag-name').addEventListener('input', function() {
    if (!isEdit || !document.getElementById('tag-slug').value) {
      document.getElementById('tag-slug').value = slugify(this.value);
    }
  });

  document.getElementById('tag-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    const data = {
      name: document.getElementById('tag-name').value.trim(),
      slug: document.getElementById('tag-slug').value.trim() || slugify(document.getElementById('tag-name').value),
    };

    try {
      if (isEdit) await updateTag(params.id, data);
      else await createTag(data);
      window.location.href = '/admin/etiquetas';
    } catch (err) {
      alert('Error: ' + err.message);
    }
  });
}
