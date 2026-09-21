import { getAllStoriesAdmin, createStory, deleteStory, updateStory } from '../services/stories.js';
import { getAuthors } from '../services/authors.js';
import { getCategories } from '../services/categories.js';
import { slugify, formatDate } from '../utils/helpers.js';
import { renderAdminLayout, requireAdmin } from './layout.js';

const STATUS_LABELS = { draft: 'Borrador', published: 'Publicado', finished: 'Finalizado', archived: 'Archivado' };
const STATUS_CLASSES = { draft: 'status-draft', published: 'status-published', finished: 'status-finished', archived: 'status-archived' };

export async function renderStoriesAdmin() {
  if (!requireAdmin()) return;
  const container = renderAdminLayout('/admin/historias');
  container.innerHTML = '<div class="admin-header"><h1>Historias</h1><a href="/admin/historias/nueva" data-link class="btn btn-primary">+ Nueva historia</a></div><div class="admin-card"><div class="empty-state"><p>Cargando...</p></div></div>';

  try {
    const [stories, authors, categories] = await Promise.all([
      getAllStoriesAdmin(),
      getAuthors(),
      getCategories(),
    ]);

    const authorMap = {};
    authors.forEach(a => { authorMap[a.id] = a.name; });
    const catMap = {};
    categories.forEach(c => { catMap[c.id] = c.name; });

    if (!stories.length) {
      container.innerHTML = '<div class="admin-header"><h1>Historias</h1><a href="/admin/historias/nueva" data-link class="btn btn-primary">+ Nueva historia</a></div><div class="admin-card"><div class="empty-state"><h3>No hay historias</h3><p>Crea tu primera historia para comenzar.</p></div></div>';
      return;
    }

    container.innerHTML =
      '<div class="admin-header"><h1>Historias</h1><a href="/admin/historias/nueva" data-link class="btn btn-primary">+ Nueva historia</a></div>' +
      '<div class="admin-card">' +
        '<table class="admin-table">' +
          '<thead><tr><th>Título</th><th>Autor</th><th>Categoría</th><th>Estado</th><th>Capítulos</th><th>Actualizado</th><th>Acciones</th></tr></thead>' +
          '<tbody>' +
            stories.map(s =>
              '<tr>' +
                '<td><a href="/admin/historias/' + s.id + '/editar" data-link style="font-weight:600">' + s.title + '</a></td>' +
                '<td>' + (authorMap[s.authorId] || '-') + '</td>' +
                '<td>' + (catMap[s.categoryId] || '-') + '</td>' +
                '<td><span class="status-badge ' + (STATUS_CLASSES[s.status] || '') + '">' + (STATUS_LABELS[s.status] || s.status) + '</span></td>' +
                '<td>' + (s.chapterCount || 0) + '</td>' +
                '<td>' + formatDate(s.updatedAt) + '</td>' +
                '<td>' +
                  '<a href="/admin/historias/' + s.id + '/editar" data-link class="btn btn-sm btn-secondary">Editar</a> ' +
                  '<a href="/admin/historias/' + s.id + '/capitulos" data-link class="btn btn-sm btn-secondary">Capítulos</a> ' +
                  '<button class="btn btn-sm btn-danger delete-story-btn" data-id="' + s.id + '">Eliminar</button>' +
                '</td>' +
              '</tr>'
            ).join('') +
          '</tbody>' +
        '</table>' +
      '</div>';

    container.querySelectorAll('.delete-story-btn').forEach(btn => {
      btn.addEventListener('click', async function() {
        if (!confirm('¿Eliminar esta historia?')) return;
        await deleteStory(this.dataset.id);
        renderStoriesAdmin();
      });
    });
  } catch (error) {
    console.error('Error:', error);
  }
}

export async function renderStoryFormAdmin(params) {
  if (!requireAdmin()) return;
  const container = renderAdminLayout('/admin/historias');
  const isEdit = params.id && params.id !== 'nueva';

  let story = null;
  let authors = [];
  let categories = [];

  try {
    [authors, categories] = await Promise.all([getAuthors(), getCategories()]);
    if (isEdit) {
      const { getStoryById } = await import('../services/stories.js');
      story = await getStoryById(params.id);
    }
  } catch (error) {
    console.error('Error:', error);
  }

  const authorOptions = authors.map(a =>
    '<option value="' + a.id + '"' + (story && story.authorId === a.id ? ' selected' : '') + '>' + a.name + '</option>'
  ).join('');

  const catOptions = categories.map(c =>
    '<option value="' + c.id + '"' + (story && story.categoryId === c.id ? ' selected' : '') + '>' + c.name + '</option>'
  ).join('');

  const tagsStr = story && story.tags ? story.tags.join(', ') : '';

  container.innerHTML =
    '<div class="admin-header"><h1>' + (isEdit ? 'Editar Historia' : 'Nueva Historia') + '</h1></div>' +
    '<div class="admin-card">' +
      '<form id="story-form">' +
        '<div class="form-group">' +
          '<label class="form-label">Título</label>' +
          '<input type="text" class="form-input" id="story-title" value="' + (story ? story.title : '') + '" required>' +
        '</div>' +
        '<div class="form-group">' +
          '<label class="form-label">Slug (se genera automáticamente)</label>' +
          '<input type="text" class="form-input" id="story-slug" value="' + (story ? story.slug : '') + '">' +
        '</div>' +
        '<div class="form-group">' +
          '<label class="form-label">Descripción</label>' +
          '<textarea class="form-textarea" id="story-desc" rows="3">' + (story ? story.description || '' : '') + '</textarea>' +
        '</div>' +
        '<div class="form-group">' +
          '<label class="form-label">URL de portada (imagen externa)</label>' +
          '<input type="url" class="form-input" id="story-cover" value="' + (story ? story.coverImageUrl || '' : '') + '" placeholder="https://ejemplo.com/imagen.jpg">' +
        '</div>' +
        '<div class="form-row">' +
          '<div class="form-group">' +
            '<label class="form-label">Autor</label>' +
            '<select class="form-select" id="story-author"><option value="">Seleccionar...</option>' + authorOptions + '</select>' +
          '</div>' +
          '<div class="form-group">' +
            '<label class="form-label">Categoría</label>' +
            '<select class="form-select" id="story-category"><option value="">Seleccionar...</option>' + catOptions + '</select>' +
          '</div>' +
        '</div>' +
        '<div class="form-group">' +
          '<label class="form-label">Etiquetas (separadas por coma)</label>' +
          '<input type="text" class="form-input" id="story-tags" value="' + tagsStr + '" placeholder="DoctorHouse, Drama, Medicina">' +
        '</div>' +
        '<div class="form-row">' +
          '<div class="form-group">' +
            '<label class="form-label">Estado</label>' +
            '<select class="form-select" id="story-status">' +
              '<option value="draft"' + (story && story.status === 'draft' ? ' selected' : '') + '>Borrador</option>' +
              '<option value="published"' + (story && story.status === 'published' ? ' selected' : '') + '>Publicado</option>' +
              '<option value="finished"' + (story && story.status === 'finished' ? ' selected' : '') + '>Finalizado</option>' +
              '<option value="archived"' + (story && story.status === 'archived' ? ' selected' : '') + '>Archivado</option>' +
            '</select>' +
          '</div>' +
          '<div class="form-group"></div>' +
        '</div>' +
        '<div style="display:flex;gap:0.75rem;margin-top:1rem">' +
          '<button type="submit" class="btn btn-primary">Guardar</button>' +
          (isEdit ? '<a href="/admin/historias/' + params.id + '/capitulos" data-link class="btn btn-secondary">Administrar capítulos</a>' : '') +
          '<a href="/admin/historias" data-link class="btn btn-ghost">Cancelar</a>' +
        '</div>' +
      '</form>' +
    '</div>';

  document.getElementById('story-title').addEventListener('input', function() {
    if (!isEdit || !document.getElementById('story-slug').value) {
      document.getElementById('story-slug').value = slugify(this.value);
    }
  });

  document.getElementById('story-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    const authorSelect = document.getElementById('story-author');
    const catSelect = document.getElementById('story-category');
    const data = {
      title: document.getElementById('story-title').value.trim(),
      slug: document.getElementById('story-slug').value.trim() || slugify(document.getElementById('story-title').value),
      description: document.getElementById('story-desc').value.trim(),
      coverImageUrl: document.getElementById('story-cover').value.trim(),
      authorId: authorSelect.value,
      authorName: authorSelect.options[authorSelect.selectedIndex]?.text || '',
      categoryId: catSelect.value,
      categoryName: catSelect.options[catSelect.selectedIndex]?.text || '',
      tags: document.getElementById('story-tags').value.split(',').map(t => t.trim()).filter(Boolean),
      status: document.getElementById('story-status').value,
    };

    try {
      if (isEdit) {
        await updateStory(params.id, data);
      } else {
        await createStory(data);
      }
      window.location.href = '/admin/historias';
    } catch (err) {
      alert('Error al guardar: ' + err.message);
    }
  });
}
