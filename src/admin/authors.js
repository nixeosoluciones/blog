import { getAuthors, createAuthor, updateAuthor, deleteAuthor } from '../services/authors.js';
import { slugify, formatDate } from '../utils/helpers.js';
import { renderAdminLayout, requireAdmin } from './layout.js';

export async function renderAuthorsAdmin() {
  if (!requireAdmin()) return;
  const container = renderAdminLayout('/admin/autores');
  container.innerHTML = '<div class="admin-header"><h1>Autores</h1><a href="/admin/autores/nuevo" data-link class="btn btn-primary">+ Nuevo autor</a></div><div class="admin-card"><div class="empty-state"><p>Cargando...</p></div></div>';

  try {
    const authors = await getAuthors();
    if (!authors.length) {
      container.innerHTML = '<div class="admin-header"><h1>Autores</h1><a href="/admin/autores/nuevo" data-link class="btn btn-primary">+ Nuevo autor</a></div><div class="admin-card"><div class="empty-state"><h3>No hay autores</h3></div></div>';
      return;
    }

    container.innerHTML =
      '<div class="admin-header"><h1>Autores</h1><a href="/admin/autores/nuevo" data-link class="btn btn-primary">+ Nuevo autor</a></div>' +
      '<div class="admin-card"><table class="admin-table"><thead><tr><th>Nombre</th><th>Slug</th><th>Fecha</th><th>Acciones</th></tr></thead><tbody>' +
        authors.map(a =>
          '<tr><td style="font-weight:600">' + a.name + '</td><td>' + a.slug + '</td><td>' + formatDate(a.createdAt) + '</td><td>' +
            '<a href="/admin/autores/' + a.id + '/editar" data-link class="btn btn-sm btn-secondary">Editar</a> ' +
            '<button class="btn btn-sm btn-danger delete-author-btn" data-id="' + a.id + '">Eliminar</button>' +
          '</td></tr>'
        ).join('') +
      '</tbody></table></div>';

    container.querySelectorAll('.delete-author-btn').forEach(btn => {
      btn.addEventListener('click', async function() {
        if (!confirm('¿Eliminar este autor?')) return;
        await deleteAuthor(this.dataset.id);
        renderAuthorsAdmin();
      });
    });
  } catch (error) {
    console.error('Error:', error);
  }
}

let authorSocialLinks = [];

export async function renderAuthorFormAdmin(params) {
  if (!requireAdmin()) return;
  const container = renderAdminLayout('/admin/autores');
  const isEdit = params.id && params.id !== 'nuevo';
  let author = null;

  if (isEdit) {
    author = await (await import('../services/authors.js')).getAuthorById(params.id);
  }

  authorSocialLinks = (author && author.socialLinks) ? [...author.socialLinks] : [];

  container.innerHTML =
    '<div class="admin-header"><h1>' + (isEdit ? 'Editar Autor' : 'Nuevo Autor') + '</h1></div>' +
    '<div class="admin-card"><form id="author-form">' +
      '<div class="form-row"><div class="form-group"><label class="form-label">Nombre</label><input type="text" class="form-input" id="author-name" value="' + (author ? author.name : '') + '" required></div>' +
      '<div class="form-group"><label class="form-label">Slug</label><input type="text" class="form-input" id="author-slug" value="' + (author ? author.slug : '') + '"></div></div>' +
      '<div class="form-group"><label class="form-label">Foto URL (externa)</label><input type="url" class="form-input" id="author-photo" value="' + (author ? author.photoUrl || '' : '') + '" placeholder="https://ejemplo.com/foto.jpg"></div>' +
      '<div class="form-group"><label class="form-label">Biografía</label><textarea class="form-textarea" id="author-bio" rows="3">' + (author ? author.bio || '' : '') + '</textarea></div>' +
      '<div class="form-group"><label class="form-label">Descripción</label><textarea class="form-textarea" id="author-desc" rows="2">' + (author ? author.description || '' : '') + '</textarea></div>' +
      '<div class="form-group"><label class="form-label">Redes sociales</label><div id="author-social-list"></div><button type="button" class="btn btn-secondary btn-sm" id="add-author-social-btn" style="margin-top:0.5rem">+ Agregar enlace</button></div>' +
      '<div style="display:flex;gap:0.75rem;margin-top:1rem"><button type="submit" class="btn btn-primary">Guardar</button><a href="/admin/autores" data-link class="btn btn-ghost">Cancelar</a></div>' +
    '</form></div>';

  renderAuthorSocialLinks();

  document.getElementById('author-name').addEventListener('input', function() {
    if (!isEdit || !document.getElementById('author-slug').value) {
      document.getElementById('author-slug').value = slugify(this.value);
    }
  });

  document.getElementById('add-author-social-btn').addEventListener('click', function() {
    authorSocialLinks.push({ label: '', url: '' });
    renderAuthorSocialLinks();
  });

  document.getElementById('author-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    const validLinks = authorSocialLinks.filter(l => l.url && l.url.trim());

    const data = {
      name: document.getElementById('author-name').value.trim(),
      slug: document.getElementById('author-slug').value.trim() || slugify(document.getElementById('author-name').value),
      photoUrl: document.getElementById('author-photo').value.trim(),
      bio: document.getElementById('author-bio').value.trim(),
      description: document.getElementById('author-desc').value.trim(),
      socialLinks: validLinks,
    };

    try {
      if (isEdit) {
        await updateAuthor(params.id, data);
      } else {
        await createAuthor(data);
      }
      window.location.href = '/admin/autores';
    } catch (err) {
      alert('Error: ' + err.message);
    }
  });
}

function renderAuthorSocialLinks() {
  const list = document.getElementById('author-social-list');
  if (!list) return;

  if (authorSocialLinks.length === 0) {
    list.innerHTML = '<p style="color:var(--text-tertiary);font-size:0.85rem">No hay enlaces agregados.</p>';
    return;
  }

  list.innerHTML = authorSocialLinks.map((link, i) =>
    '<div style="display:flex;gap:0.5rem;margin-bottom:0.5rem;align-items:center">' +
      '<input type="text" class="form-input" placeholder="Nombre (ej: Twitter)" value="' + escapeAttr(link.label || '') + '" data-index="' + i + '" data-field="label" style="flex:1">' +
      '<input type="url" class="form-input" placeholder="https://..." value="' + escapeAttr(link.url || '') + '" data-index="' + i + '" data-field="url" style="flex:2">' +
      '<button type="button" class="btn btn-sm btn-danger remove-author-social" data-index="' + i + '">✕</button>' +
    '</div>'
  ).join('');

  list.querySelectorAll('.form-input').forEach(input => {
    input.addEventListener('input', function() {
      authorSocialLinks[parseInt(this.dataset.index)][this.dataset.field] = this.value;
    });
  });

  list.querySelectorAll('.remove-author-social').forEach(btn => {
    btn.addEventListener('click', function() {
      authorSocialLinks.splice(parseInt(this.dataset.index), 1);
      renderAuthorSocialLinks();
    });
  });
}

function escapeAttr(str) {
  return str.replace(/"/g, '&quot;').replace(/</g, '&lt;');
}
