import { getStoryById } from '../services/stories.js';
import { getVolumesByStory, createVolume, deleteVolume } from '../services/volumes.js';
import { getChaptersByStory, createChapter, deleteChapter, updateChapter } from '../services/chapters.js';
import { slugify, formatDate } from '../utils/helpers.js';
import { renderAdminLayout, requireAdmin } from './layout.js';

export async function renderChaptersAdmin(params) {
  if (!requireAdmin()) return;
  const container = renderAdminLayout('/admin/historias');

  try {
    const story = await getStoryById(params.storyId);
    if (!story) {
      container.innerHTML = '<div class="admin-card"><div class="empty-state"><h3>Historia no encontrada</h3></div></div>';
      return;
    }

    const [volumes, chapters] = await Promise.all([
      getVolumesByStory(params.storyId),
      getChaptersByStory(params.storyId),
    ]);

    const standaloneChapters = chapters.filter(ch => !ch.volumeId);
    const volumeChapters = {};
    volumes.forEach(v => { volumeChapters[v.id] = chapters.filter(ch => ch.volumeId === v.id); });

    container.innerHTML =
      '<div class="admin-header">' +
        '<h1>Capítulos: ' + story.title + '</h1>' +
        '<div style="display:flex;gap:0.5rem">' +
          '<button class="btn btn-primary" id="add-volume-btn">+ Nuevo libro/temporada</button>' +
          '<button class="btn btn-primary" id="add-chapter-btn">+ Nuevo capítulo</button>' +
        '</div>' +
      '</div>' +
      '<div class="admin-card">' +
        '<h3 style="margin-bottom:1rem">Capítulos sin sección</h3>' +
        (standaloneChapters.length ?
          '<ul class="chapter-list">' +
            standaloneChapters.map(ch =>
              '<li class="chapter-item">' +
                '<span class="drag-handle">☰</span>' +
                '<a href="/admin/capitulos/' + ch.id + '/editar" data-link class="chapter-link">' + ch.title + '</a>' +
                '<span class="status-badge ' + (ch.status === 'published' ? 'status-published' : 'status-draft') + '">' + (ch.status === 'published' ? 'Publicado' : 'Borrador') + '</span>' +
                '<button class="btn btn-sm btn-danger delete-chapter-btn" data-id="' + ch.id + '">Eliminar</button>' +
              '</li>'
            ).join('') +
          '</ul>' :
          '<p style="color:var(--text-tertiary)">No hay capítulos sueltos.</p>'
        ) +
      '</div>' +
      volumes.map(v =>
        '<div class="admin-card">' +
          '<div class="admin-card-header">' +
            '<h3>' + v.title + '</h3>' +
            '<button class="btn btn-sm btn-danger delete-volume-btn" data-id="' + v.id + '">Eliminar sección</button>' +
          '</div>' +
          (volumeChapters[v.id] && volumeChapters[v.id].length ?
            '<ul class="chapter-list">' +
              volumeChapters[v.id].map(ch =>
                '<li class="chapter-item">' +
                  '<span class="drag-handle">☰</span>' +
                  '<a href="/admin/capitulos/' + ch.id + '/editar" data-link class="chapter-link">' + ch.title + '</a>' +
                  '<span class="status-badge ' + (ch.status === 'published' ? 'status-published' : 'status-draft') + '">' + (ch.status === 'published' ? 'Publicado' : 'Borrador') + '</span>' +
                  '<button class="btn btn-sm btn-danger delete-chapter-btn" data-id="' + ch.id + '">Eliminar</button>' +
                '</li>'
              ).join('') +
            '</ul>' :
            '<p style="color:var(--text-tertiary)">No hay capítulos en esta sección.</p>'
          ) +
        '</div>'
      ).join('');

    document.getElementById('add-volume-btn').addEventListener('click', function() {
      showAddVolumeModal(params.storyId);
    });

    document.getElementById('add-chapter-btn').addEventListener('click', function() {
      showAddChapterModal(params.storyId, volumes);
    });

    container.querySelectorAll('.delete-volume-btn').forEach(btn => {
      btn.addEventListener('click', async function() {
        if (!confirm('¿Eliminar esta sección y todos sus capítulos?')) return;
        const vols = await getChaptersByStory(params.storyId);
        const volChapters = vols.filter(ch => ch.volumeId === this.dataset.id);
        for (const ch of volChapters) await deleteChapter(ch.id);
        await deleteVolume(this.dataset.id);
        renderChaptersAdmin(params);
      });
    });

    container.querySelectorAll('.delete-chapter-btn').forEach(btn => {
      btn.addEventListener('click', async function() {
        if (!confirm('¿Eliminar este capítulo?')) return;
        await deleteChapter(this.dataset.id);
        renderChaptersAdmin(params);
      });
    });

  } catch (error) {
    console.error('Error:', error);
  }
}

function showAddVolumeModal(storyId) {
  const root = document.getElementById('modal-root');
  const existing = document.getElementById('volume-modal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'volume-modal';
  modal.className = 'modal-overlay';
  modal.innerHTML =
    '<div class="modal">' +
      '<div class="modal-header"><h2 class="modal-title">Nueva sección</h2><button class="modal-close" onclick="this.closest(\'.modal-overlay\').remove()">✕</button></div>' +
      '<div class="form-group"><label class="form-label">Nombre (ej: Libro 1, Temporada 1, Arco 1)</label><input type="text" class="form-input" id="volume-title" placeholder="Libro 1"></div>' +
      '<div class="form-group"><label class="form-label">Tipo</label><select class="form-select" id="volume-type"><option value="book">Libro</option><option value="season">Temporada</option><option value="volume">Volumen</option><option value="arc">Arco</option><option value="part">Parte</option></select></div>' +
      '<button class="btn btn-primary" id="save-volume-btn">Crear</button>' +
    '</div>';
  root.appendChild(modal);

  document.getElementById('save-volume-btn').addEventListener('click', async function() {
    const title = document.getElementById('volume-title').value.trim();
    if (!title) return;
    const chapters = await getChaptersByStory(storyId);
    await createVolume({
      storyId,
      title,
      type: document.getElementById('volume-type').value,
      order: chapters.length + 1,
    });
    modal.remove();
    renderChaptersAdmin({ storyId });
  });
}

function showAddChapterModal(storyId, volumes) {
  const root = document.getElementById('modal-root');
  const existing = document.getElementById('chapter-modal');
  if (existing) existing.remove();

  const volumeOptions = volumes.map(v =>
    '<option value="' + v.id + '">' + v.title + '</option>'
  ).join('');

  const modal = document.createElement('div');
  modal.id = 'chapter-modal';
  modal.className = 'modal-overlay';
  modal.innerHTML =
    '<div class="modal">' +
      '<div class="modal-header"><h2 class="modal-title">Nuevo capítulo</h2><button class="modal-close" onclick="this.closest(\'.modal-overlay\').remove()">✕</button></div>' +
      '<div class="form-group"><label class="form-label">Título</label><input type="text" class="form-input" id="chapter-title" placeholder="El diagnóstico"></div>' +
      (volumes.length ?
        '<div class="form-group"><label class="form-label">Sección</label><select class="form-select" id="chapter-volume"><option value="">Sin sección</option>' + volumeOptions + '</select></div>' :
        '') +
      '<button class="btn btn-primary" id="save-chapter-btn">Crear</button>' +
    '</div>';
  root.appendChild(modal);

  document.getElementById('save-chapter-btn').addEventListener('click', async function() {
    const title = document.getElementById('chapter-title').value.trim();
    if (!title) return;
    const existingChapters = await getChaptersByStory(storyId);
    const volumeEl = document.getElementById('chapter-volume');
    const data = {
      storyId,
      title,
      slug: slugify(title),
      content: '',
      order: existingChapters.length + 1,
      status: 'draft',
    };
    if (volumeEl && volumeEl.value) {
      data.volumeId = volumeEl.value;
    }
    await createChapter(data);
    modal.remove();
    renderChaptersAdmin({ storyId });
  });
}
