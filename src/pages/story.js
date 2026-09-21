import { getStoryBySlug } from '../services/stories.js';
import { getVolumesByStory } from '../services/volumes.js';
import { getChaptersByStory } from '../services/chapters.js';
import { renderStars, formatDate } from '../utils/helpers.js';

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
    const volumeMap = {};
    volumes.forEach(v => { volumeMap[v.id] = v; });

    main.innerHTML = `
      <div class="story-page">
        <div class="story-header">
          ${story.coverImageUrl
            ? `<img src="${story.coverImageUrl}" alt="${story.title}" class="story-cover" loading="lazy">`
            : ''
          }
          <h1>${story.title}</h1>
          <div class="story-meta">
            ${story.authorName ? `<span>por <a href="/autores/${story.authorSlug || ''}" data-link>${story.authorName}</a></span>` : ''}
            ${story.categoryName ? `<a href="/categorias/${story.categorySlug || ''}" data-link>${story.categoryName}</a>` : ''}
            <span class="story-rating-display">
              <span class="story-rating-stars">${renderStars(story.averageRating || 0)}</span>
              <span>${story.averageRating ? story.averageRating.toFixed(1) : '0.0'} / 5</span>
              <span>(${story.ratingCount || 0} votos)</span>
            </span>
            <span>${story.chapterCount || 0} capítulos</span>
          </div>
          <p class="story-description">${story.description || ''}</p>
          <div class="tags-list">
            ${(story.tags || []).map(tag => `<a href="/etiquetas/${tag}" data-link class="tag">#${tag}</a>`).join('')}
          </div>
        </div>

        <div class="story-index">
          <h2>Índice</h2>
          ${volumes.length > 0 ? volumes.map(volume => `
            <div class="volume-section">
              <div class="volume-title">${volume.title}</div>
              <ul class="chapter-list">
                ${allChapters.filter(ch => ch.volumeId === volume.id).map((ch, i) => `
                  <li class="chapter-item">
                    <span class="chapter-number">${String(i + 1).padStart(2, '0')}</span>
                    <a href="/historias/${story.slug}/${ch.slug}" data-link class="chapter-link">${ch.title}</a>
                  </li>
                `).join('')}
              </ul>
            </div>
          `).join('') : `
            <ul class="chapter-list">
              ${standaloneChapters.map((ch, i) => `
                <li class="chapter-item">
                  <span class="chapter-number">${String(i + 1).padStart(2, '0')}</span>
                  <a href="/historias/${story.slug}/${ch.slug}" data-link class="chapter-link">${ch.title}</a>
                </li>
              `).join('')}
            </ul>
          `}
        </div>
      </div>
    `;
  } catch (error) {
    console.error('Error loading story:', error);
    main.innerHTML = '<div class="container section"><div class="empty-state"><h3>Error al cargar la historia</h3></div></div>';
  }
}
