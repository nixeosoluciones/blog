export function slugify(text) {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

export function formatDate(date) {
  if (!date) return '';
  const d = date.toDate ? date.toDate() : new Date(date);
  return d.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatDateTime(date) {
  if (!date) return '';
  const d = date.toDate ? date.toDate() : new Date(date);
  return d.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function estimateReadTime(htmlContent) {
  if (!htmlContent) return '1 min';
  const text = htmlContent.replace(/<[^>]*>/g, '');
  const words = text.split(/\s+/).filter(w => w.length > 0).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min`;
}

export function countWords(htmlContent) {
  if (!htmlContent) return 0;
  const text = htmlContent.replace(/<[^>]*>/g, '');
  return text.split(/\s+/).filter(w => w.length > 0).length;
}

export function countChars(htmlContent) {
  if (!htmlContent) return 0;
  const text = htmlContent.replace(/<[^>]*>/g, '');
  return text.length;
}

export function truncate(text, maxLength = 150) {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}

export function renderStars(rating, max = 5) {
  let html = '';
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5 ? 1 : 0;
  const empty = max - full - half;
  for (let i = 0; i < full; i++) html += '★';
  for (let i = 0; i < half; i++) html += '½';
  for (let i = 0; i < empty; i++) html += '☆';
  return html;
}

export function getReadingProgress() {
  try {
    return JSON.parse(localStorage.getItem('reading_progress') || '{}');
  } catch {
    return {};
  }
}

export function setReadingProgress(storyId, chapterId) {
  const progress = getReadingProgress();
  progress[storyId] = { chapterId, timestamp: Date.now() };
  localStorage.setItem('reading_progress', JSON.stringify(progress));
}

export function getFontSizePreference() {
  return localStorage.getItem('font_size') || 'medium';
}

export function setFontSizePreference(size) {
  localStorage.setItem('font_size', size);
}

const READER_DEFAULTS = {
  theme: 'auto',       // auto | light | sepia | dark
  fontFamily: 'serif', // serif | sans
  fontSize: 18,        // px, 14 - 24
  lineHeight: 1.85,    // 1.5 - 2.2
  contentWidth: 'medium', // narrow | medium | wide
  justify: true,
};

export function getReaderPrefs() {
  try {
    const saved = JSON.parse(localStorage.getItem('reader_prefs') || '{}');
    return { ...READER_DEFAULTS, ...saved };
  } catch {
    return { ...READER_DEFAULTS };
  }
}

export function setReaderPrefs(patch) {
  const prefs = { ...getReaderPrefs(), ...patch };
  localStorage.setItem('reader_prefs', JSON.stringify(prefs));
  return prefs;
}

export function getChapterScrollProgress(storyId, chapterId) {
  try {
    const all = JSON.parse(localStorage.getItem('chapter_scroll_progress') || '{}');
    return all[storyId + ':' + chapterId] || 0;
  } catch {
    return 0;
  }
}

export function setChapterScrollProgress(storyId, chapterId, percent) {
  try {
    const all = JSON.parse(localStorage.getItem('chapter_scroll_progress') || '{}');
    all[storyId + ':' + chapterId] = percent;
    localStorage.setItem('chapter_scroll_progress', JSON.stringify(all));
  } catch {}
}

export function getThemePreference() {
  return localStorage.getItem('theme') || 'light';
}

export function setThemePreference(theme) {
  localStorage.setItem('theme', theme);
}
