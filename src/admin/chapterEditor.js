import { getChapterById, updateChapter } from '../services/chapters.js';
import { getStoryById } from '../services/stories.js';
import { createTipTapEditor, setupAutoSave, stopAutoSave, destroyEditor, getEditor } from '../editor/tiptap.js';
import { renderTipTapContent } from '../utils/sanitize.js';
import { countWords, countChars, estimateReadTime } from '../utils/helpers.js';
import { renderAdminLayout, requireAdmin } from './layout.js';

export async function renderChapterEditorAdmin(params) {
  if (!requireAdmin()) return;
  destroyEditor();
  const container = renderAdminLayout('/admin/capitulos');

  try {
    const chapter = await getChapterById(params.chapterId);
    if (!chapter) {
      container.innerHTML = '<div class="admin-card"><div class="empty-state"><h3>Capítulo no encontrado</h3></div></div>';
      return;
    }

    const story = await getStoryById(chapter.storyId);

    container.innerHTML =
      '<div class="editor-header">' +
        '<div>' +
          '<a href="/admin/historias/' + chapter.storyId + '/capitulos" data-link style="font-size:0.85rem;color:var(--text-tertiary)">← Volver a capítulos</a>' +
          '<h1 style="margin-top:0.25rem">' + (story ? story.title : 'Historia') + '</h1>' +
        '</div>' +
        '<div class="editor-actions">' +
          '<div class="editor-status" id="editor-save-status"></div>' +
          '<button class="btn btn-secondary" id="save-draft-btn">Guardar borrador</button>' +
          '<button class="btn btn-secondary" id="preview-btn">Vista previa</button>' +
          '<button class="btn btn-primary" id="publish-btn">Publicar</button>' +
        '</div>' +
      '</div>' +
      '<div class="form-group">' +
        '<label class="form-label">Título del capítulo</label>' +
        '<input type="text" class="form-input" id="chapter-title-input" value="' + chapter.title + '">' +
      '</div>' +
      '<div class="form-group">' +
        '<label class="form-label">Estado</label>' +
        '<select class="form-select" id="chapter-status" style="width:auto">' +
          '<option value="draft"' + (chapter.status === 'draft' ? ' selected' : '') + '>Borrador</option>' +
          '<option value="published"' + (chapter.status === 'published' ? ' selected' : '') + '>Publicado</option>' +
        '</select>' +
      '</div>' +
      '<div class="editor-toolbar" id="editor-toolbar"></div>' +
      '<div class="editor-content" id="tiptap-editor"></div>' +
      '<div class="reading-stats" id="editor-stats"></div>' +
      '<div id="preview-container" style="display:none">' +
        '<div class="preview-content" id="preview-content"></div>' +
      '</div>';

    const toolbar = document.getElementById('editor-toolbar');
    toolbar.innerHTML = buildToolbarHTML();

    const editorEl = document.getElementById('tiptap-editor');
    const editor = createTipTapEditor(editorEl, chapter.content, (ed) => {
      updateStats(ed);
    });

    setupToolbar(editor);
    updateStats(editor);
    setupAutoSave(editor, chapter.id, async (id, data) => {
      await updateChapter(id, data);
    });

    document.getElementById('save-draft-btn').addEventListener('click', async function() {
      await saveChapter(chapter.id, editor, 'draft');
    });

    document.getElementById('publish-btn').addEventListener('click', async function() {
      await saveChapter(chapter.id, editor, 'published');
    });

    document.getElementById('preview-btn').addEventListener('click', function() {
      togglePreview(editor);
    });

  } catch (error) {
    console.error('Error:', error);
    container.innerHTML = '<div class="admin-card"><div class="empty-state"><h3>Error al cargar el capítulo</h3></div></div>';
  }
}

function buildToolbarHTML() {
  return [
    { cmd: 'bold', icon: 'B', title: 'Negrita', cls: 'bold' },
    { cmd: 'italic', icon: 'I', title: 'Cursiva', cls: 'italic' },
    { cmd: 'underline', icon: 'U', title: 'Subrayado', cls: 'underline' },
    { cmd: 'strike', icon: 'S', title: 'Tachado', cls: 'strike' },
    { type: 'sep' },
    { cmd: 'h1', icon: 'H1', title: 'Encabezado 1' },
    { cmd: 'h2', icon: 'H2', title: 'Encabezado 2' },
    { cmd: 'h3', icon: 'H3', title: 'Encabezado 3' },
    { cmd: 'paragraph', icon: '¶', title: 'Párrafo' },
    { type: 'sep' },
    { cmd: 'bulletList', icon: '•', title: 'Lista con viñetas' },
    { cmd: 'orderedList', icon: '1.', title: 'Lista numerada' },
    { type: 'sep' },
    { cmd: 'blockquote', icon: '"', title: 'Cita' },
    { cmd: 'horizontalRule', icon: '—', title: 'Separador' },
    { type: 'sep' },
    { cmd: 'link', icon: '🔗', title: 'Enlace' },
    { cmd: 'image', icon: '🖼', title: 'Insertar imagen' },
    { type: 'sep' },
    { cmd: 'alignLeft', icon: '←', title: 'Izquierda' },
    { cmd: 'alignCenter', icon: '↔', title: 'Centrar' },
    { cmd: 'alignRight', icon: '→', title: 'Derecha' },
    { type: 'sep' },
    { cmd: 'undo', icon: '↩', title: 'Deshacer' },
    { cmd: 'redo', icon: '↪', title: 'Rehacer' },
  ].map(item => {
    if (item.type === 'sep') return '<div class="toolbar-separator"></div>';
    return '<button class="toolbar-btn" data-cmd="' + item.cmd + '" title="' + item.title + '"' +
      (item.cls ? ' style="font-weight:700;font-style:' + (item.cls === 'italic' ? 'italic' : 'normal') +
        (item.cls === 'underline' ? ';text-decoration:underline' : '') +
        (item.cls === 'strike' ? ';text-decoration:line-through' : '') + '"' : '') +
      '>' + item.icon + '</button>';
  }).join('');
}

function setupToolbar(editor) {
  document.getElementById('editor-toolbar').addEventListener('click', function(e) {
    const btn = e.target.closest('.toolbar-btn');
    if (!btn) return;
    const cmd = btn.dataset.cmd;

    switch (cmd) {
      case 'bold': editor.chain().focus().toggleBold().run(); break;
      case 'italic': editor.chain().focus().toggleItalic().run(); break;
      case 'underline': editor.chain().focus().toggleUnderline().run(); break;
      case 'strike': editor.chain().focus().toggleStrike().run(); break;
      case 'h1': editor.chain().focus().toggleHeading({ level: 1 }).run(); break;
      case 'h2': editor.chain().focus().toggleHeading({ level: 2 }).run(); break;
      case 'h3': editor.chain().focus().toggleHeading({ level: 3 }).run(); break;
      case 'paragraph': editor.chain().focus().setParagraph().run(); break;
      case 'bulletList': editor.chain().focus().toggleBulletList().run(); break;
      case 'orderedList': editor.chain().focus().toggleOrderedList().run(); break;
      case 'blockquote': editor.chain().focus().toggleBlockquote().run(); break;
      case 'horizontalRule': editor.chain().focus().setHorizontalRule().run(); break;
      case 'link': showLinkModal(editor); break;
      case 'image': showImageModal(editor); break;
      case 'alignLeft': editor.chain().focus().setTextAlign('left').run(); break;
      case 'alignCenter': editor.chain().focus().setTextAlign('center').run(); break;
      case 'alignRight': editor.chain().focus().setTextAlign('right').run(); break;
      case 'undo': editor.chain().focus().undo().run(); break;
      case 'redo': editor.chain().focus().redo().run(); break;
    }
  });
}

function showLinkModal(editor) {
  const root = document.getElementById('modal-root');
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML =
    '<div class="modal">' +
      '<div class="modal-header"><h2 class="modal-title">Insertar enlace</h2><button class="modal-close" onclick="this.closest(\'.modal-overlay\').remove()">✕</button></div>' +
      '<div class="form-group"><label class="form-label">URL</label><input type="url" class="form-input" id="link-url" placeholder="https://"></div>' +
      '<button class="btn btn-primary" id="insert-link-btn">Insertar</button>' +
    '</div>';
  root.appendChild(modal);

  document.getElementById('insert-link-btn').addEventListener('click', function() {
    const url = document.getElementById('link-url').value.trim();
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
    modal.remove();
  });
}

function showImageModal(editor) {
  const root = document.getElementById('modal-root');
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML =
    '<div class="modal">' +
      '<div class="modal-header"><h2 class="modal-title">Insertar imagen</h2><button class="modal-close" onclick="this.closest(\'.modal-overlay\').remove()">✕</button></div>' +
      '<div class="form-group"><label class="form-label">URL de imagen</label><input type="url" class="form-input" id="img-url" placeholder="https://ejemplo.com/imagen.jpg"></div>' +
      '<div class="form-group"><label class="form-label">Texto alternativo</label><input type="text" class="form-input" id="img-alt" placeholder="Descripción de la imagen"></div>' +
      '<p style="font-size:0.8rem;color:var(--text-tertiary);margin-bottom:1rem">⚠️ La imagen debe estar alojada en un servidor externo. No se suben archivos.</p>' +
      '<button class="btn btn-primary" id="insert-img-btn">Insertar</button>' +
    '</div>';
  root.appendChild(modal);

  document.getElementById('insert-img-btn').addEventListener('click', function() {
    const url = document.getElementById('img-url').value.trim();
    const alt = document.getElementById('img-alt').value.trim();
    if (url) {
      try { new URL(url); } catch(e) { alert('URL no válida'); return; }
      editor.chain().focus().setImage({ src: url, alt: alt || '' }).run();
    }
    modal.remove();
  });
}

function updateStats(editor) {
  const stats = document.getElementById('editor-stats');
  if (!stats) return;
  const html = editor.getHTML();
  const words = countWords(html);
  const chars = countChars(html);
  const time = estimateReadTime(html);
  stats.textContent = words.toLocaleString() + ' palabras · ' + chars.toLocaleString() + ' caracteres · ⏱ ' + time + ' de lectura';
}

function togglePreview(editor) {
  const previewContainer = document.getElementById('preview-container');
  const editorContent = document.querySelector('.editor-content');
  const toolbar = document.getElementById('editor-toolbar');
  const isHidden = previewContainer.style.display === 'none';

  if (isHidden) {
    previewContainer.style.display = 'block';
    editorContent.style.display = 'none';
    toolbar.style.display = 'none';
    document.getElementById('preview-content').innerHTML = renderTipTapContent(editor.getHTML());
    document.getElementById('preview-btn').textContent = 'Editor';
  } else {
    previewContainer.style.display = 'none';
    editorContent.style.display = 'block';
    toolbar.style.display = 'flex';
    document.getElementById('preview-btn').textContent = 'Vista previa';
  }
}

async function saveChapter(chapterId, editor, status) {
  const statusEl = document.getElementById('editor-save-status');
  if (statusEl) statusEl.innerHTML = '<span class="saving">Guardando...</span>';

  try {
    await updateChapter(chapterId, {
      title: document.getElementById('chapter-title-input').value.trim(),
      content: editor.getHTML(),
      status: status,
    });
    document.getElementById('chapter-status').value = status;
    if (statusEl) statusEl.innerHTML = '<span class="saved">✓ Guardado</span>';
  } catch (err) {
    if (statusEl) statusEl.innerHTML = '<span style="color:var(--color-error)">Error al guardar</span>';
  }
}
