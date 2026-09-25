import { getAuthorBySlug } from '../services/authors.js';
import { getStories } from '../services/stories.js';
import { bookGridHTML } from '../components/bookCard.js';

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
        '<div class="book-grid">' +
          (stories.length ? bookGridHTML(stories) : '<div class="empty-state"><p>Este autor aún no ha publicado historias.</p></div>') +
        '</div>' +
      '</div>';
  } catch (error) {
    console.error('Error loading author:', error);
  }
}
