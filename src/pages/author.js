import { getAuthorBySlug } from '../services/authors.js';
import { getStories } from '../services/stories.js';
import { renderStars, truncate } from '../utils/helpers.js';

export async function renderAuthorPage(params) {
  const main = document.getElementById('main-content');
  main.innerHTML = '<div class="container section"><div class="empty-state"><p>Cargando autor...</p></div></div>';

  try {
    const author = await getAuthorBySlug(params.slug);
    if (!author) {
      main.innerHTML = '<div class="container section"><div class="empty-state"><h3>Autor no encontrado</h3><a href="/autores" data-link>Volver a autores</a></div></div>';
      return;
    }

    const stories = await getStories({ authorId: author.id });

    main.innerHTML =
      '<div class="author-page">' +
        '<div class="author-header">' +
          (author.photoUrl ? '<img src="' + author.photoUrl + '" alt="' + author.name + '" class="author-card-avatar author-avatar" loading="lazy">' : '<div class="author-avatar"></div>') +
          '<div class="author-info">' +
            '<h1>' + author.name + '</h1>' +
            (author.bio ? '<p class="author-bio">' + author.bio + '</p>' : '') +
            (author.description ? '<p class="author-bio">' + author.description + '</p>' : '') +
            (author.socialLinks && author.socialLinks.length ?
              '<div class="author-social-links">' +
                author.socialLinks.map(l =>
                  '<a href="' + l.url + '" target="_blank" rel="noopener">' + (l.label || l.url) + '</a>'
                ).join('') +
              '</div>' : '') +
          '</div>' +
        '</div>' +
        '<h2 style="margin-bottom:1rem">Historias publicadas</h2>' +
        '<div class="stories-grid">' +
          (stories.length ? stories.map(s =>
            '<a href="/historias/' + s.slug + '" data-link class="story-card">' +
              (s.coverImageUrl ? '<img src="' + s.coverImageUrl + '" alt="' + s.title + '" class="story-card-cover" loading="lazy">' : '<div class="story-card-cover"></div>') +
              '<div class="story-card-body">' +
                '<h3 class="story-card-title">' + s.title + '</h3>' +
                '<p class="story-card-desc">' + truncate(s.description, 100) + '</p>' +
                '<div class="story-card-meta">' +
                  '<span class="story-card-rating">' + renderStars(s.averageRating || 0) + ' ' + (s.averageRating ? s.averageRating.toFixed(1) : '0.0') + '</span>' +
                  '<span>' + (s.chapterCount || 0) + ' capítulos</span>' +
                '</div>' +
              '</div>' +
            '</a>'
          ).join('') : '<div class="empty-state"><p>Este autor aún no ha publicado historias.</p></div>') +
        '</div>' +
      '</div>';
  } catch (error) {
    console.error('Error loading author:', error);
  }
}
