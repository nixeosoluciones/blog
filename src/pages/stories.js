import { getStories } from '../services/stories.js';
import { renderStars, truncate } from '../utils/helpers.js';

export async function renderStoriesPage() {
  const main = document.getElementById('main-content');
  main.innerHTML = `
    <div class="container section">
      <div class="section-header">
        <h1 class="section-title">Todas las Historias</h1>
      </div>
      <div class="stories-grid" id="all-stories-grid">
        <div class="empty-state"><p>Cargando historias...</p></div>
      </div>
    </div>
  `;

  try {
    const stories = await getStories({ onlyPublished: true, limit: 50 });
    const grid = document.getElementById('all-stories-grid');
    if (!stories.length) {
      grid.innerHTML = '<div class="empty-state"><h3>No hay historias</h3><p>Próximamente habrá contenido disponible.</p></div>';
      return;
    }
    grid.innerHTML = stories.map(story => `
      <a href="/historias/${story.slug}" data-link class="story-card">
        ${story.coverImageUrl
          ? `<img src="${story.coverImageUrl}" alt="${story.title}" class="story-card-cover" loading="lazy">`
          : `<div class="story-card-cover"></div>`
        }
        <div class="story-card-body">
          <span class="story-card-category">${story.categoryName || 'Sin categoría'}</span>
          <h3 class="story-card-title">${story.title}</h3>
          <p class="story-card-desc">${truncate(story.description, 120)}</p>
          <div class="story-card-meta">
            <span class="story-card-rating">${renderStars(story.averageRating || 0)} ${story.averageRating ? story.averageRating.toFixed(1) : '0.0'}</span>
            <span>${story.chapterCount || 0} capítulos</span>
          </div>
        </div>
      </a>
    `).join('');
  } catch (error) {
    console.error('Error loading stories:', error);
  }
}
