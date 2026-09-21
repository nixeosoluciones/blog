import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';

let editorInstance = null;
let autoSaveTimer = null;

export function createTipTapEditor(element, content, onUpdate) {
  destroyEditor();

  editorInstance = new Editor({
    element,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4] },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { target: '_blank', rel: 'noopener noreferrer' },
      }),
      Image,
      TextAlign.configure({
        types: ['heading', 'paragraph', 'image'],
      }),
      Placeholder.configure({
        placeholder: 'Escribe tu capítulo aquí...',
      }),
    ],
    content: content || '',
    editorProps: {
      attributes: {
        class: 'tiptap-editor',
      },
    },
  });

  if (onUpdate) {
    let debounceTimer = null;
    editorInstance.on('update', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        try {
          if (editorInstance && !editorInstance.isDestroyed) {
            onUpdate(editorInstance);
          }
        } catch(e) {}
      }, 300);
    });
  }

  return editorInstance;
}

export function getEditor() {
  return editorInstance;
}

export function setupAutoSave(editor, chapterId, saveCallback) {
  if (autoSaveTimer) clearInterval(autoSaveTimer);

  autoSaveTimer = setInterval(async () => {
    if (!editor || !chapterId || editor.isDestroyed) return;
    const statusEl = document.getElementById('editor-save-status');
    if (statusEl) statusEl.innerHTML = '<span class="saving">Guardando...</span>';

    try {
      const html = editor.getHTML();
      await saveCallback(chapterId, { content: html });
      if (statusEl) statusEl.innerHTML = '<span class="saved">✓ Guardado automáticamente</span>';
    } catch (err) {
      console.error('Auto-save error:', err);
      if (statusEl) statusEl.innerHTML = '<span style="color:var(--color-error)">Error al guardar</span>';
    }
  }, 30000);
}

export function stopAutoSave() {
  if (autoSaveTimer) {
    clearInterval(autoSaveTimer);
    autoSaveTimer = null;
  }
}

export function destroyEditor() {
  stopAutoSave();
  if (editorInstance) {
    try {
      editorInstance.destroy();
    } catch(e) {}
    editorInstance = null;
  }
}
