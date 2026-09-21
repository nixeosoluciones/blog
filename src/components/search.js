import { getStories } from '../services/stories.js';
import { getAuthors } from '../services/authors.js';
import { getCategories } from '../services/categories.js';
import { getTags } from '../services/tags.js';
import { slugify, truncate } from '../utils/helpers.js';

export function initSearchModal() {
  const root = document.getElementById('modal-root');
  root.innerHTML =
    '<div class="modal-overlay search-modal" id="search-overlay" style="display:none">' +
      '<div class="modal">' +
        '<div class="modal-header">' +
          '<h2 class="modal-title">Buscar</h2>' +
          '<button class="modal-close" id="close-search">✕</button>' +
        '</div>' +
        '<div class="search-input-wrapper">' +
          '<input type="text" class="form-input" id="search-input" placeholder="Buscar historias, autores, categorías..." autofocus>' +
        '</div>' +
        '<div class="search-results" id="search-results"></div>' +
      '</div>' +
    '</div>';

  document.getElementById('close-search').addEventListener('click', closeSearch);
  document.getElementById('search-overlay').addEventListener('click', function(e) {
    if (e.target === this) closeSearch();
  });

  let debounceTimer;
  document.getElementById('search-input').addEventListener('input', function() {
    clearTimeout(debounceTimer);
    const query = this.value.trim();
    if (query.length < 2) {
      document.getElementById('search-results').innerHTML = '';
      return;
    }
    debounceTimer = setTimeout(() => performSearch(query), 300);
  });

  window.addEventListener('open-search', openSearch);
  document.addEventListener('keydown', function(e) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      openSearch();
    }
    if (e.key === 'Escape') closeSearch();
  });
}

function openSearch() {
  const overlay = document.getElementById('search-overlay');
  overlay.style.display = 'flex';
  setTimeout(() => document.getElementById('search-input').focus(), 100);
}

function closeSearch() {
  document.getElementById('search-overlay').style.display = 'none';
  document.getElementById('search-input').value = '';
  document.getElementById('search-results').innerHTML = '';
}

async function performSearch(query) {
  const results = document.getElementById('search-results');
  results.innerHTML = '<p style="color:var(--text-tertiary);padding:0.5rem">Buscando...</p>';

  try {
    const [stories, authors, categories, tags] = await Promise.all([
      getStories({ onlyPublished: true, limit: 20 }),
      getAuthors(),
      getCategories(),
      getTags(),
    ]);

    const q = query.toLowerCase();
    let html = '';

    const matchedStories = stories.filter(s =>
      s.title.toLowerCase().includes(q) || (s.description && s.description.toLowerCase().includes(q))
    );
    if (matchedStories.length) {
      html += matchedStories.slice(0, 5).map(s =>
        '<a href="/historias/' + s.slug + '" data-link class="search-result-item" onclick="window.__closeSearch()">' +
          '<div class="search-result-type">Historia</div>' +
          '<div class="search-result-title">' + s.title + '</div>' +
          '<div class="search-result-desc">' + truncate(s.description, 80) + '</div>' +
        '</a>'
      ).join('');
    }

    const matchedAuthors = authors.filter(a => a.name.toLowerCase().includes(q));
    if (matchedAuthors.length) {
      html += matchedAuthors.slice(0, 3).map(a =>
        '<a href="/autores/' + a.slug + '" data-link class="search-result-item" onclick="window.__closeSearch()">' +
          '<div class="search-result-type">Autor</div>' +
          '<div class="search-result-title">' + a.name + '</div>' +
          '<div class="search-result-desc">' + truncate(a.bio, 60) + '</div>' +
        '</a>'
      ).join('');
    }

    const matchedCategories = categories.filter(c => c.name.toLowerCase().includes(q));
    if (matchedCategories.length) {
      html += matchedCategories.slice(0, 3).map(c =>
        '<a href="/categorias/' + c.slug + '" data-link class="search-result-item" onclick="window.__closeSearch()">' +
          '<div class="search-result-type">Categoría</div>' +
          '<div class="search-result-title">' + c.name + '</div>' +
        '</a>'
      ).join('');
    }

    const matchedTags = tags.filter(t => t.name.toLowerCase().includes(q));
    if (matchedTags.length) {
      html += matchedTags.slice(0, 3).map(t =>
        '<a href="/etiquetas/' + t.slug + '" data-link class="search-result-item" onclick="window.__closeSearch()">' +
          '<div class="search-result-type">Etiqueta</div>' +
          '<div class="search-result-title">#' + t.name + '</div>' +
        '</a>'
      ).join('');
    }

    if (!html) {
      html = '<p style="color:var(--text-tertiary);padding:1rem;text-align:center">No se encontraron resultados para "' + query + '"</p>';
    }

    results.innerHTML = html;
  } catch (error) {
    results.innerHTML = '<p style="color:var(--color-error);padding:1rem">Error al buscar.</p>';
  }
}

window.__closeSearch = closeSearch;
