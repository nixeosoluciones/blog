import { getEditorial, updateEditorial } from '../services/settings.js';
import { renderAdminLayout, requireAdmin } from './layout.js';

let socialLinks = [];

export async function renderEditorialAdmin() {
  if (!requireAdmin()) return;
  const container = renderAdminLayout('/admin/editorial');

  let editorial = null;
  try {
    editorial = await getEditorial();
  } catch (e) {}

  socialLinks = (editorial && editorial.socialLinks) ? [...editorial.socialLinks] : [];

  container.innerHTML =
    '<div class="admin-header"><h1>Editorial</h1></div>' +
    '<div class="admin-card"><form id="editorial-form">' +
      '<div class="form-row">' +
        '<div class="form-group"><label class="form-label">Nombre del proyecto</label><input type="text" class="form-input" id="ed-project" value="' + (editorial ? editorial.projectName || '' : '') + '"></div>' +
        '<div class="form-group"><label class="form-label">Nombre de la persona</label><input type="text" class="form-input" id="ed-author" value="' + (editorial ? editorial.authorName || '' : '') + '"></div>' +
      '</div>' +
      '<div class="form-group"><label class="form-label">Foto URL (externa)</label><input type="url" class="form-input" id="ed-photo" value="' + (editorial ? editorial.photoUrl || '' : '') + '" placeholder="https://ejemplo.com/foto.jpg"></div>' +
      '<div class="form-group"><label class="form-label">Descripción breve</label><textarea class="form-textarea" id="ed-desc" rows="2">' + (editorial ? editorial.description || '' : '') + '</textarea></div>' +
      '<div class="form-group"><label class="form-label">Contenido</label><textarea class="form-textarea" id="ed-content" rows="8">' + (editorial ? editorial.content || '' : '') + '</textarea></div>' +
      '<div class="form-group"><label class="form-label">Redes sociales</label><div id="social-links-list"></div><button type="button" class="btn btn-secondary btn-sm" id="add-social-btn" style="margin-top:0.5rem">+ Agregar enlace</button></div>' +
      '<button type="submit" class="btn btn-primary">Guardar</button>' +
    '</form></div>';

  renderSocialLinks();
  document.getElementById('add-social-btn').addEventListener('click', addSocialLink);
  document.getElementById('editorial-form').addEventListener('submit', handleSubmit);
}

function renderSocialLinks() {
  const list = document.getElementById('social-links-list');
  if (!list) return;

  if (socialLinks.length === 0) {
    list.innerHTML = '<p style="color:var(--text-tertiary);font-size:0.85rem">No hay enlaces agregados.</p>';
    return;
  }

  list.innerHTML = socialLinks.map((link, i) =>
    '<div style="display:flex;gap:0.5rem;margin-bottom:0.5rem;align-items:center">' +
      '<input type="text" class="form-input" placeholder="Nombre (ej: Twitter)" value="' + escapeAttr(link.label || '') + '" data-index="' + i + '" data-field="label" style="flex:1">' +
      '<input type="url" class="form-input" placeholder="https://..." value="' + escapeAttr(link.url || '') + '" data-index="' + i + '" data-field="url" style="flex:2">' +
      '<button type="button" class="btn btn-sm btn-danger remove-social-btn" data-index="' + i + '">✕</button>' +
    '</div>'
  ).join('');

  list.querySelectorAll('.form-input').forEach(input => {
    input.addEventListener('input', function() {
      const idx = parseInt(this.dataset.index);
      const field = this.dataset.field;
      socialLinks[idx][field] = this.value;
    });
  });

  list.querySelectorAll('.remove-social-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      socialLinks.splice(parseInt(this.dataset.index), 1);
      renderSocialLinks();
    });
  });
}

function addSocialLink() {
  socialLinks.push({ label: '', url: '' });
  renderSocialLinks();
  const inputs = document.querySelectorAll('#social-links-list .form-input');
  if (inputs.length > 0) {
    inputs[inputs.length - 2].focus();
  }
}

async function handleSubmit(e) {
  e.preventDefault();

  const validLinks = socialLinks.filter(l => l.url && l.url.trim());

  const data = {
    projectName: document.getElementById('ed-project').value.trim(),
    authorName: document.getElementById('ed-author').value.trim(),
    photoUrl: document.getElementById('ed-photo').value.trim(),
    description: document.getElementById('ed-desc').value.trim(),
    content: document.getElementById('ed-content').value.trim(),
    socialLinks: validLinks,
  };

  try {
    await updateEditorial(data);
    alert('Editorial guardada correctamente.');
  } catch (err) {
    alert('Error: ' + err.message);
  }
}

function escapeAttr(str) {
  return str.replace(/"/g, '&quot;').replace(/</g, '&lt;');
}
