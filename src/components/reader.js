import { getReaderPrefs, setReaderPrefs, getChapterScrollProgress, setChapterScrollProgress } from '../utils/helpers.js';

function resolveTheme(prefs) {
  if (prefs.theme !== 'auto') return prefs.theme;
  const site = document.documentElement.getAttribute('data-theme');
  return site === 'dark' ? 'dark' : 'light';
}

export function applyReaderPrefs(root) {
  if (!root) return;
  const prefs = getReaderPrefs();
  root.setAttribute('data-reader-theme', resolveTheme(prefs));
  root.setAttribute('data-reader-font', prefs.fontFamily);
  root.setAttribute('data-reader-width', prefs.contentWidth);
  root.style.setProperty('--reader-font-size', prefs.fontSize + 'px');
  root.style.setProperty('--reader-line-height', prefs.lineHeight);
  const content = root.querySelector('#reader-content');
  if (content) content.classList.toggle('justify', !!prefs.justify);
}

export function mountReader({ root, story, chapter, chapters, currentIndex }) {
  applyReaderPrefs(root);
  const prefs = getReaderPrefs();

  const progressFill = root.querySelector('#reader-progress-fill');
  const progressLabel = root.querySelector('#reader-progress-label');
  const contentCard = root.querySelector('#reader-content-card');
  const resumeBar = root.querySelector('#reader-resume');

  // Restaurar posición guardada
  const saved = getChapterScrollProgress(story.id, chapter.id);
  if (saved > 4 && saved < 96 && resumeBar) {
    resumeBar.classList.add('show');
    resumeBar.querySelector('span').textContent = 'Te quedaste en el ' + Math.round(saved) + '% — ¿continuar?';
    resumeBar.querySelector('button').onclick = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      window.scrollTo({ top: h * (saved / 100), behavior: 'smooth' });
    };
  }

  let ticking = false;
  function updateProgress() {
    ticking = false;
    const el = root.querySelector('#reader-content-card');
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const total = el.offsetHeight - window.innerHeight + 200;
    const read = Math.min(Math.max(-rect.top + 200, 0), Math.max(total, 1));
    const pct = total > 0 ? Math.round((read / total) * 100) : 0;
    const clamped = Math.min(100, Math.max(0, pct));
    if (progressFill) progressFill.style.width = clamped + '%';
    if (progressLabel) progressLabel.textContent = clamped + '%';
    setChapterScrollProgress(story.id, chapter.id, clamped);
    if (resumeBar && clamped > 96) resumeBar.classList.remove('show');
  }
  function onScroll() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(updateProgress);
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  updateProgress();

  // Toolbar
  root.querySelector('#reader-btn-toc')?.addEventListener('click', () => openDrawer(root));
  root.querySelector('#reader-drawer-close')?.addEventListener('click', () => closeDrawer(root));
  root.querySelector('#reader-drawer-overlay')?.addEventListener('click', () => closeDrawer(root));
  root.querySelector('#reader-btn-settings')?.addEventListener('click', (e) => {
    root.querySelector('#reader-settings')?.classList.toggle('open');
    e.currentTarget.classList.toggle('active');
  });
  root.querySelector('#reader-btn-focus')?.addEventListener('click', (e) => {
    const on = document.body.classList.toggle('reader-immersive');
    e.currentTarget.classList.toggle('active', on);
  });
  root.querySelector('#reader-btn-full')?.addEventListener('click', () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen?.();
  });
  root.querySelector('#reader-btn-top')?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // Ajustes segmentados
  bindSeg(root, '[data-pref="theme"]', prefs.theme, (v) => {
    const next = setReaderPrefs({ theme: v });
    applyReaderPrefs(root);
    refreshSeg(root, '[data-pref="theme"]', next.theme);
  });
  bindSeg(root, '[data-pref="fontFamily"]', prefs.fontFamily, (v) => {
    const next = setReaderPrefs({ fontFamily: v });
    applyReaderPrefs(root);
    refreshSeg(root, '[data-pref="fontFamily"]', next.fontFamily);
  });
  bindSeg(root, '[data-pref="contentWidth"]', prefs.contentWidth, (v) => {
    const next = setReaderPrefs({ contentWidth: v });
    applyReaderPrefs(root);
    refreshSeg(root, '[data-pref="contentWidth"]', next.contentWidth);
  });
  bindSeg(root, '[data-pref="justify"]', prefs.justify ? 'on' : 'off', (v) => {
    const next = setReaderPrefs({ justify: v === 'on' });
    applyReaderPrefs(root);
    refreshSeg(root, '[data-pref="justify"]', next.justify ? 'on' : 'off');
  });

  const sizeRange = root.querySelector('#reader-font-size');
  const lhRange = root.querySelector('#reader-line-height');
  const sizeVal = root.querySelector('#reader-font-size-val');
  const lhVal = root.querySelector('#reader-line-height-val');
  if (sizeRange) {
    sizeRange.value = prefs.fontSize;
    if (sizeVal) sizeVal.textContent = prefs.fontSize + 'px';
    sizeRange.addEventListener('input', () => {
      const v = parseInt(sizeRange.value, 10);
      if (sizeVal) sizeVal.textContent = v + 'px';
      setReaderPrefs({ fontSize: v });
      applyReaderPrefs(root);
    });
  }
  if (lhRange) {
    lhRange.value = prefs.lineHeight;
    if (lhVal) lhVal.textContent = Number(prefs.lineHeight).toFixed(2);
    lhRange.addEventListener('input', () => {
      const v = parseFloat(lhRange.value);
      if (lhVal) lhVal.textContent = v.toFixed(2);
      setReaderPrefs({ lineHeight: v });
      applyReaderPrefs(root);
    });
  }

  // Buscador del índice
  const search = root.querySelector('#reader-toc-search');
  search?.addEventListener('input', () => {
    const q = search.value.toLowerCase();
    root.querySelectorAll('.reader-drawer-item').forEach((it) => {
      it.style.display = it.textContent.toLowerCase().includes(q) ? '' : 'none';
    });
  });

  // Atajos de teclado estilo epub-browser
  function onKey(e) {
    if (e.target.matches('input, textarea')) return;
    if (e.key === 'Escape') closeDrawer(root);
    if (e.key === 'ArrowLeft') root.querySelector('#reader-prev-link')?.click();
    if (e.key === 'ArrowRight') root.querySelector('#reader-next-link')?.click();
  }
  document.addEventListener('keydown', onKey);

  // Limpieza al cambiar de ruta
  const cleanup = () => {
    window.removeEventListener('scroll', onScroll);
    document.removeEventListener('keydown', onKey);
    document.body.classList.remove('reader-immersive');
  };
  window.addEventListener('popstate', cleanup, { once: true });

  return { updateProgress, cleanup };
}

function bindSeg(root, selector, current, onPick) {
  root.querySelectorAll(selector).forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.value === String(current));
    btn.onclick = () => onPick(btn.dataset.value);
  });
}

function refreshSeg(root, selector, current) {
  root.querySelectorAll(selector).forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.value === String(current));
  });
}

function openDrawer(root) {
  root.querySelector('#reader-drawer')?.classList.add('open');
  root.querySelector('#reader-drawer-overlay')?.classList.add('open');
  root.querySelector('#reader-btn-toc')?.classList.add('active');
}

function closeDrawer(root) {
  root.querySelector('#reader-drawer')?.classList.remove('open');
  root.querySelector('#reader-drawer-overlay')?.classList.remove('open');
  root.querySelector('#reader-btn-toc')?.classList.remove('active');
}

export function readerToolbarHTML(percent = 0) {
  return (
    '<div class="reader-progressbar"><span id="reader-progress-fill" style="width:' + percent + '%"></span></div>' +
    '<div class="reader-toolbar"><div class="reader-toolbar-inner">' +
      '<button class="reader-tool-btn" id="reader-btn-toc" title="Índice (Esc)">☰ Índice</button>' +
      '<button class="reader-tool-btn" id="reader-btn-settings" title="Ajustes de lectura">Aa</button>' +
      '<button class="reader-tool-btn" id="reader-btn-focus" title="Modo lectura (oculta cabecera)">◐</button>' +
      '<button class="reader-tool-btn" id="reader-btn-full" title="Pantalla completa">⛶</button>' +
      '<div class="reader-toolbar-spacer"></div>' +
      '<button class="reader-tool-btn" id="reader-btn-top" title="Volver arriba">↑</button>' +
      '<span class="reader-progress-label" id="reader-progress-label">' + percent + '%</span>' +
    '</div></div>'
  );
}

export function readerSettingsHTML(prefs) {
  return (
    '<div class="reader-settings" id="reader-settings"><div class="reader-settings-card">' +
      '<div class="reader-setting-group"><label>Tema</label><div class="reader-seg">' +
        '<button data-pref="theme" data-value="auto">Auto</button>' +
        '<button data-pref="theme" data-value="light">Claro</button>' +
        '<button data-pref="theme" data-value="sepia">Sepia</button>' +
        '<button data-pref="theme" data-value="dark">Oscuro</button>' +
      '</div></div>' +
      '<div class="reader-setting-group"><label>Fuente</label><div class="reader-seg">' +
        '<button data-pref="fontFamily" data-value="serif">Serif</button>' +
        '<button data-pref="fontFamily" data-value="sans">Sans</button>' +
      '</div></div>' +
      '<div class="reader-setting-group"><label>Ancho</label><div class="reader-seg">' +
        '<button data-pref="contentWidth" data-value="narrow">Estrecho</button>' +
        '<button data-pref="contentWidth" data-value="medium">Medio</button>' +
        '<button data-pref="contentWidth" data-value="wide">Ancho</button>' +
      '</div></div>' +
      '<div class="reader-setting-group"><label>Tamaño de letra</label>' +
        '<div class="reader-slider-row"><span>A−</span>' +
        '<input type="range" id="reader-font-size" min="14" max="24" step="1" value="' + prefs.fontSize + '">' +
        '<span>A+</span><strong id="reader-font-size-val">' + prefs.fontSize + 'px</strong></div></div>' +
      '<div class="reader-setting-group"><label>Interlineado</label>' +
        '<div class="reader-slider-row"><span>1.5</span>' +
        '<input type="range" id="reader-line-height" min="1.5" max="2.2" step="0.05" value="' + prefs.lineHeight + '">' +
        '<span>2.2</span><strong id="reader-line-height-val">' + Number(prefs.lineHeight).toFixed(2) + '</strong></div></div>' +
      '<div class="reader-setting-group"><label>Alineación</label><div class="reader-seg">' +
        '<button data-pref="justify" data-value="on">Justificado</button>' +
        '<button data-pref="justify" data-value="off">Izquierda</button>' +
      '</div></div>' +
      '<p style="font-size:0.72rem;color:var(--reader-muted)">Atajos: ← capítulo anterior · → capítulo siguiente · Esc cierra el índice.</p>' +
    '</div></div>'
  );
}

export function readerDrawerHTML(story, chapters, currentId) {
  const items = chapters.map((ch, i) =>
    '<a href="/historias/' + story.slug + '/' + ch.slug + '" data-link ' +
    'class="reader-drawer-item' + (ch.id === currentId ? ' current' : '') + '">' +
    '<span class="reader-drawer-num">' + String(i + 1).padStart(2, '0') + '</span>' +
    '<span>' + escapeHtml(ch.title) + '</span></a>'
  ).join('');
  return (
    '<div class="reader-drawer-overlay" id="reader-drawer-overlay"></div>' +
    '<aside class="reader-drawer" id="reader-drawer" aria-label="Índice de capítulos">' +
      '<div class="reader-drawer-header"><h3>📖 ' + escapeHtml(story.title) + '</h3>' +
      '<p>' + chapters.length + ' capítulos · toca para saltar</p>' +
      '<button class="reader-tool-btn" id="reader-drawer-close" style="margin-top:0.6rem">✕ Cerrar</button></div>' +
      '<div class="reader-drawer-search"><input id="reader-toc-search" placeholder="Buscar capítulo..."></div>' +
      '<nav class="reader-drawer-list">' + items + '</nav>' +
    '</aside>'
  );
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text || '';
  return div.innerHTML;
}
