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

export function getThemePreference() {
  return localStorage.getItem('theme') || 'light';
}

export function setThemePreference(theme) {
  localStorage.setItem('theme', theme);
}
