import { getStoryBySlug } from '../services/stories.js';
import { getVolumesByStory } from '../services/volumes.js';
import { getChaptersByStory } from '../services/chapters.js';
import { renderStars } from '../utils/helpers.js';

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text || '';
  return div.innerHTML;
}

export async function renderStoryPage(params) {
  const main = document.getElementById('main-content');
  main.innerHTML = '<div class="container section"><div class="empty-state"><p>Cargando historia...</p></div></div>';

  try {
    const story = await getStoryBySlug(params.slug);
    if (!story) {
      main.innerHTML = '<div class="container section"><div class="empty-state"><h3>Historia no encontrada</h3><a href="/historias" data-link>Volver a historias</a></div></div>';
      return;
    }

    const [volumes, allChapters] = await Promise.all([
      getVolumesByStory(story.id),
      getChaptersByStory(story.id),
    ]);

    const standaloneChapters = allChapters.filter(ch => !ch.volumeId);
    const rating = story.averageRating ? story.averageRating.toFixed(1) : '0.0';

    const chapterListHTML = (list) => `
      <ul class="chapter-list">
        ${list.map((ch, i) => `
          <li class="chapter-item">
            <span class="chapter-number">${String(i + 1).padStart(2, '0')}</span>
            <a href="/historias/${story.slug}/${ch.slug}" data-link class="chapter-link">${escapeHtml(ch.title)}</a>
          </li>
        `).join('')}
      </ul>`;

    main.innerHTML = `
      <div class="container">
        <div class="crumb-card">
          <nav class="crumb-nav" aria-label="Migas de pan">
            <a href="/" data-link>Inicio</a><span>/</span>
            <a href="/historias" data-link>Historias</a><span>/</span>
            <span>${escapeHtml(story.title)}</span>
          </nav>
          <div class="book-detail">
            ${story.coverImageUrl
              ? `<img src="${story.coverImageUrl}" alt="${escapeHtml(story.title)}" class="book-detail-cover" loading="lazy">`
              : ''
            }
            <div>
              <span class="book-card-category">${escapeHtml(story.categoryName || 'Sin categoría')}</span>
              <h1 class="book-detail-h1">${escapeHtml(story.title)}</h1>
              <div class="book-detail-meta">
                ${story.authorName ? `<span>por <a href="/autores/${story.authorSlug || ''}" data-link>${escapeHtml(story.authorName)}</a></span>` : ''}
                <span>★ ${rating} / 5 (${story.ratingCount || 0} votos)</span>
                <span>📖 ${story.chapterCount || allChapters.length || 0} capítulos</span>
              </div>
              <p class="book-detail-desc">${escapeHtml(story.description || '')}</p>
              <div class="tags-list">
                ${(story.tags || []).map(tag => `<a href="/etiquetas/${encodeURIComponent(tag)}" data-link class="tag">#${escapeHtml(tag)}</a>`).join('')}
              </div>
            </div>
          </div>
        </div>

        <div class="story-index">
          <div class="section-header">
            <h2 class="section-title">Índice</h2>
          </div>
          ${volumes.length > 0 ? volumes.map(volume => `
            <div class="volume-section">
              <div class="volume-title">${escapeHtml(volume.title)}</div>
              ${chapterListHTML(allChapters.filter(ch => ch.volumeId === volume.id))}
            </div>
          `).join('') : chapterListHTML(standaloneChapters)}
        </div>
      </div>
    `;
  } catch (error) {
    console.error('Error loading story:', error);
    main.innerHTML = '<div class="container section"><div class="empty-state"><h3>Error al cargar la historia</h3></div></div>';
  }
}
