import { getCategories, createCategory, updateCategory, deleteCategory } from '../services/categories.js';
import { slugify, formatDate } from '../utils/helpers.js';
import { renderAdminLayout, requireAdmin } from './layout.js';

export async function renderCategoriesAdmin() {
  if (!requireAdmin()) return;
  const container = renderAdminLayout('/admin/categorias');
  container.innerHTML = '<div class="admin-header"><h1>Categorías</h1><a href="/admin/categorias/nueva" data-link class="btn btn-primary">+ Nueva categoría</a></div><div class="admin-card"><div class="empty-state"><p>Cargando...</p></div></div>';

  try {
    const categories = await getCategories();
    if (!categories.length) {
      container.innerHTML = '<div class="admin-header"><h1>Categorías</h1><a href="/admin/categorias/nueva" data-link class="btn btn-primary">+ Nueva categoría</a></div><div class="admin-card"><div class="empty-state"><h3>No hay categorías</h3></div></div>';
      return;
    }

    container.innerHTML =
      '<div class="admin-header"><h1>Categorías</h1><a href="/admin/categorias/nueva" data-link class="btn btn-primary">+ Nueva categoría</a></div>' +
      '<div class="admin-card"><table class="admin-table"><thead><tr><th>Nombre</th><th>Slug</th><th>Acciones</th></tr></thead><tbody>' +
        categories.map(c =>
          '<tr><td style="font-weight:600">' + c.name + '</td><td>' + c.slug + '</td><td>' +
            '<a href="/admin/categorias/' + c.id + '/editar" data-link class="btn btn-sm btn-secondary">Editar</a> ' +
            '<button class="btn btn-sm btn-danger delete-cat-btn" data-id="' + c.id + '">Eliminar</button>' +
          '</td></tr>'
        ).join('') +
      '</tbody></table></div>';

    container.querySelectorAll('.delete-cat-btn').forEach(btn => {
      btn.addEventListener('click', async function() {
        if (!confirm('¿Eliminar esta categoría?')) return;
        await deleteCategory(this.dataset.id);
        renderCategoriesAdmin();
      });
    });
  } catch (error) {
    console.error('Error:', error);
  }
}

export async function renderCategoryFormAdmin(params) {
  if (!requireAdmin()) return;
  const container = renderAdminLayout('/admin/categorias');
  const isEdit = params.id && params.id !== 'nueva';
  let category = null;

  if (isEdit) {
    category = await (await import('../services/categories.js')).getCategoryById(params.id);
  }

  container.innerHTML =
    '<div class="admin-header"><h1>' + (isEdit ? 'Editar Categoría' : 'Nueva Categoría') + '</h1></div>' +
    '<div class="admin-card"><form id="cat-form">' +
      '<div class="form-group"><label class="form-label">Nombre</label><input type="text" class="form-input" id="cat-name" value="' + (category ? category.name : '') + '" required></div>' +
      '<div class="form-group"><label class="form-label">Slug</label><input type="text" class="form-input" id="cat-slug" value="' + (category ? category.slug : '') + '"></div>' +
      '<div class="form-group"><label class="form-label">Descripción</label><textarea class="form-textarea" id="cat-desc" rows="2">' + (category ? category.description || '' : '') + '</textarea></div>' +
      '<div class="form-group"><label class="form-label">Imagen URL (opcional)</label><input type="url" class="form-input" id="cat-image" value="' + (category && category.imageUrl ? category.imageUrl : '') + '"></div>' +
      '<div style="display:flex;gap:0.75rem;margin-top:1rem"><button type="submit" class="btn btn-primary">Guardar</button><a href="/admin/categorias" data-link class="btn btn-ghost">Cancelar</a></div>' +
    '</form></div>';

  document.getElementById('cat-name').addEventListener('input', function() {
    if (!isEdit || !document.getElementById('cat-slug').value) {
      document.getElementById('cat-slug').value = slugify(this.value);
    }
  });

  document.getElementById('cat-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    const data = {
      name: document.getElementById('cat-name').value.trim(),
      slug: document.getElementById('cat-slug').value.trim() || slugify(document.getElementById('cat-name').value),
      description: document.getElementById('cat-desc').value.trim(),
      imageUrl: document.getElementById('cat-image').value.trim(),
    };

    try {
      if (isEdit) await updateCategory(params.id, data);
      else await createCategory(data);
      window.location.href = '/admin/categorias';
    } catch (err) {
      alert('Error: ' + err.message);
    }
  });
}
