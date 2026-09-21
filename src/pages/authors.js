import { getAuthors } from '../services/authors.js';
import { truncate } from '../utils/helpers.js';

export async function renderAuthorsPage() {
  const main = document.getElementById('main-content');
  main.innerHTML = '<div class="container section"><div class="section-header"><h1 class="section-title">Autores</h1></div><div class="authors-grid" id="authors-list"><div class="empty-state"><p>Cargando autores...</p></div></div></div>';

  try {
    const authors = await getAuthors();
    const list = document.getElementById('authors-list');
    if (!authors.length) {
      list.innerHTML = '<div class="empty-state"><h3>No hay autores</h3><p>Próximamente habrá autores registrados.</p></div>';
      return;
    }
    list.innerHTML = authors.map(a =>
      '<a href="/autores/' + a.slug + '" data-link class="author-card">' +
        (a.photoUrl ? '<img src="' + a.photoUrl + '" alt="' + a.name + '" class="author-card-avatar" loading="lazy">' : '<div class="author-card-avatar"></div>') +
        '<h3 class="author-card-name">' + a.name + '</h3>' +
        '<p class="author-card-bio">' + truncate(a.bio, 80) + '</p>' +
      '</a>'
    ).join('');
  } catch (error) {
    console.error('Error loading authors:', error);
  }
}
