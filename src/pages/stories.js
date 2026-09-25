import { getStories } from '../services/stories.js';
import { bookGridHTML, mountTagCloud } from '../components/bookCard.js';

export async function renderStoriesPage() {
  const main = document.getElementById('main-content');
  main.innerHTML = `
    <div class="container">
      <section class="library-overview" aria-labelledby="storiesHeading">
        <div>
          <p class="library-overview-kicker">Biblioteca</p>
          <h1 id="storiesHeading">Historias</h1>
        </div>
        <div class="library-summary" id="stories-summary"></div>
      </section>
      <div class="lib-search">
        <input type="text" id="stories-search" placeholder="Buscar por título, autor o etiqueta..." aria-label="Buscar historias">
        <span class="lib-search-icon">🔍</span>
      </div>
      <div class="tag-cloud" id="stories-tags"></div>
      <div class="book-grid" id="all-stories-grid">
        <div class="empty-state"><p>Cargando historias...</p></div>
      </div>
    </div>
  `;

  try {
    const stories = await getStories({ onlyPublished: true, limit: 50 });
    const grid = document.getElementById('all-stories-grid');
    const summary = document.getElementById('stories-summary');
    if (summary) {
      const tagCount = new Set(stories.flatMap(s => s.tags || [])).size;
      summary.innerHTML =
        '<span class="library-summary-item">📚 <strong>' + stories.length + '</strong>&nbsp;historias</span>' +
        '<span class="library-summary-item">🏷️ <strong>' + tagCount + '</strong>&nbsp;etiquetas</span>';
    }
    if (!stories.length) {
      grid.innerHTML = '<div class="empty-state"><h3>No hay historias</h3><p>Próximamente habrá contenido disponible.</p></div>';
      return;
    }
    grid.innerHTML = bookGridHTML(stories);
    mountTagCloud({
      container: document.getElementById('stories-tags'),
      searchInput: document.getElementById('stories-search'),
      grid,
      stories,
    });
  } catch (error) {
    console.error('Error loading stories:', error);
  }
}
