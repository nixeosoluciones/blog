import { getStories } from '../services/stories.js';
import { getCategories } from '../services/categories.js';
import { getAuthors } from '../services/authors.js';
import { truncate } from '../utils/helpers.js';
import { bookGridHTML } from '../components/bookCard.js';

export async function renderHomePage() {
  const main = document.getElementById('main-content');
  main.innerHTML = `
    <div class="container">
      <section class="library-overview" aria-labelledby="libraryHeading">
        <div>
          <p class="library-overview-kicker">Fansite Latam</p>
          <h1 id="libraryHeading">Biblioteca</h1>
          <p class="library-overview-sub">Descubre mundos alternativos, fan fiction y relatos creados por la comunidad.</p>
        </div>
        <div class="library-summary" id="library-summary">
          <span class="library-summary-item">📚 <strong>…</strong>&nbsp;historias</span>
          <span class="library-summary-item">🏷️ <strong>…</strong>&nbsp;categorías</span>
        </div>
      </section>
      <section class="section" id="recent-stories">
        <div class="section-header">
          <h2 class="section-title">Historias Recientes</h2>
          <a href="/historias" data-link class="section-link">Ver todas →</a>
        </div>
        <div class="book-grid" id="recent-grid">
          <div class="empty-state"><p>Cargando historias...</p></div>
        </div>
      </section>
      <section class="section" id="popular-stories">
        <div class="section-header">
          <h2 class="section-title">Historias Populares</h2>
        </div>
        <div class="book-grid" id="popular-grid">
          <div class="empty-state"><p>Cargando...</p></div>
        </div>
      </section>
      <section class="section" id="categories-section">
        <div class="section-header">
          <h2 class="section-title">Categorías</h2>
          <a href="/categorias" data-link class="section-link">Ver todas →</a>
        </div>
        <div class="categories-grid" id="categories-grid">
          <div class="empty-state"><p>Cargando categorías...</p></div>
        </div>
      </section>
      <section class="section" id="authors-section">
        <div class="section-header">
          <h2 class="section-title">Autores</h2>
          <a href="/autores" data-link class="section-link">Ver todos →</a>
        </div>
        <div class="authors-grid" id="authors-grid">
          <div class="empty-state"><p>Cargando autores...</p></div>
        </div>
      </section>
    </div>
  `;

  loadHomeData();
}

async function loadHomeData() {
  try {
    const [allStories, categories, authors] = await Promise.all([
      getStories({ onlyPublished: true, limit: 20 }),
      getCategories(),
      getAuthors(),
    ]);

    const summary = document.getElementById('library-summary');
    if (summary) {
      summary.innerHTML =
        '<span class="library-summary-item">📚 <strong>' + allStories.length + '</strong>&nbsp;historias</span>' +
        '<span class="library-summary-item">🏷️ <strong>' + categories.length + '</strong>&nbsp;categorías</span>';
    }

    const recent = allStories.slice(0, 6);
    const popular = [...allStories].sort((a, b) => (b.ratingCount || 0) - (a.ratingCount || 0)).slice(0, 6);

    document.getElementById('recent-grid').innerHTML = bookGridHTML(recent);
    document.getElementById('popular-grid').innerHTML = bookGridHTML(popular);
    renderCategoriesGrid(categories);
    renderAuthorsGrid(authors);
  } catch (error) {
    console.error('Error loading home data:', error);
  }
}

function renderCategoriesGrid(categories) {
  const grid = document.getElementById('categories-grid');
  if (!categories.length) {
    grid.innerHTML = '<div class="empty-state"><p>No hay categorías disponibles.</p></div>';
    return;
  }
  grid.innerHTML = categories.map(cat => `
    <a href="/categorias/${cat.slug}" data-link class="category-card">
      <h3>${cat.name}</h3>
      <p>${truncate(cat.description, 60) || 'Explorar historias'}</p>
    </a>
  `).join('');
}

function renderAuthorsGrid(authors) {
  const grid = document.getElementById('authors-grid');
  if (!authors.length) {
    grid.innerHTML = '<div class="empty-state"><p>No hay autores registrados.</p></div>';
    return;
  }
  grid.innerHTML = authors.map(author => `
    <a href="/autores/${author.slug}" data-link class="author-card">
      ${author.photoUrl
        ? `<img src="${author.photoUrl}" alt="${author.name}" class="author-card-avatar" loading="lazy">`
        : `<div class="author-card-avatar"></div>`
      }
      <div>
        <h3 class="author-card-name">${author.name}</h3>
        <p class="author-card-bio">${truncate(author.bio, 80)}</p>
      </div>
    </a>
  `).join('');
}
