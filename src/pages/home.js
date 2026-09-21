import { getStories } from '../services/stories.js';
import { getCategories } from '../services/categories.js';
import { getAuthors } from '../services/authors.js';
import { renderStars, truncate, formatDate } from '../utils/helpers.js';

export async function renderHomePage() {
  const main = document.getElementById('main-content');
  main.innerHTML = `
    <div class="hero">
      <div class="container">
        <h1>Historias Alternativas</h1>
        <p>Descubre mundos alternativos, fan fiction y relatos creados por la comunidad.</p>
        <a href="/historias" data-link class="btn btn-lg" style="background:white;color:var(--color-primary)">Explorar historias</a>
      </div>
    </div>
    <div class="container">
      <section class="section" id="recent-stories">
        <div class="section-header">
          <h2 class="section-title">Historias Recientes</h2>
          <a href="/historias" data-link class="section-link">Ver todas →</a>
        </div>
        <div class="stories-grid" id="recent-grid">
          <div class="empty-state"><p>Cargando historias...</p></div>
        </div>
      </section>
      <section class="section" id="popular-stories">
        <div class="section-header">
          <h2 class="section-title">Historias Populares</h2>
        </div>
        <div class="stories-grid" id="popular-grid">
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

    const recent = allStories.slice(0, 6);
    const popular = [...allStories].sort((a, b) => (b.ratingCount || 0) - (a.ratingCount || 0)).slice(0, 6);

    renderStoriesGrid('recent-grid', recent);
    renderStoriesGrid('popular-grid', popular);
    renderCategoriesGrid(categories);
    renderAuthorsGrid(authors);
  } catch (error) {
    console.error('Error loading home data:', error);
  }
}

function renderStoriesGrid(containerId, stories) {
  const grid = document.getElementById(containerId);
  if (!stories.length) {
    grid.innerHTML = '<div class="empty-state"><p>No hay historias disponibles.</p></div>';
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
        <p class="story-card-desc">${truncate(story.description, 100)}</p>
        <div class="story-card-meta">
          <span class="story-card-rating">${renderStars(story.averageRating || 0)} ${story.averageRating ? story.averageRating.toFixed(1) : '0.0'}</span>
          <span>${story.chapterCount || 0} capítulos</span>
        </div>
      </div>
    </a>
  `).join('');
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
      <h3 class="author-card-name">${author.name}</h3>
      <p class="author-card-bio">${truncate(author.bio, 80)}</p>
    </a>
  `).join('');
}
