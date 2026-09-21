import { getEditorial } from '../services/settings.js';
import { renderTipTapContent } from '../utils/sanitize.js';

export async function renderEditorialPage() {
  const main = document.getElementById('main-content');
  main.innerHTML = '<div class="editorial-page"><div class="empty-state"><p>Cargando...</p></div></div>';

  try {
    const editorial = await getEditorial();
    if (!editorial) {
      main.innerHTML =
        '<div class="editorial-page">' +
          '<h1>Sobre nosotros</h1>' +
          '<div class="editorial-content">' +
            '<p>Plataforma dedicada a publicar historias alternativas y contenido creado por fans.</p>' +
            '<p>Próximamente encontrarás más información aquí.</p>' +
          '</div>' +
        '</div>';
      return;
    }

    main.innerHTML =
      '<div class="editorial-page">' +
        (editorial.photoUrl ? '<img src="' + editorial.photoUrl + '" alt="' + (editorial.projectName || 'Editorial') + '" style="max-width:300px;border-radius:var(--radius-lg);margin-bottom:1.5rem" loading="lazy">' : '') +
        '<h1>' + (editorial.projectName || 'Sobre nosotros') + '</h1>' +
        (editorial.authorName ? '<p style="color:var(--text-tertiary);margin-bottom:1.5rem">por ' + editorial.authorName + '</p>' : '') +
        '<div class="editorial-content">' +
          (editorial.content ? renderTipTapContent(editorial.content) : '<p>' + (editorial.description || '') + '</p>') +
        '</div>' +
        (editorial.socialLinks && editorial.socialLinks.length ?
          '<div class="author-social-links" style="margin-top:2rem">' +
            editorial.socialLinks.map(l =>
              '<a href="' + l.url + '" target="_blank" rel="noopener">' + (l.label || l.url) + '</a>'
            ).join('') +
          '</div>' : '') +
      '</div>';
  } catch (error) {
    console.error('Error loading editorial:', error);
  }
}
