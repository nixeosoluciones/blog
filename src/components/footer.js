import { getCategories } from '../services/categories.js';

export async function renderFooter() {
  const footer = document.getElementById('main-footer');

  let categoriesHTML = '';
  try {
    const categories = await getCategories();
    if (categories.length) {
      categoriesHTML = categories.slice(0, 5).map(cat =>
        `<a href="/categorias/${cat.slug}" data-link>${cat.name}</a>`
      ).join('');
    } else {
      categoriesHTML = '<p style="color:var(--text-tertiary);font-size:0.75rem">Sin categorías aún</p>';
    }
  } catch (e) {
    categoriesHTML = '';
  }

  footer.innerHTML = `
    <div class="footer">
      <div class="footer-inner">
        <div class="footer-brand">
          <h3>Fansite Latam</h3>
          <p>Plataforma de historias alternativas, fan fiction y contenido de fans.</p>
        </div>
        <div class="footer-section">
          <h4>Navegación</h4>
          <a href="/" data-link>Inicio</a>
          <a href="/historias" data-link>Historias</a>
          <a href="/autores" data-link>Autores</a>
          <a href="/categorias" data-link>Categorías</a>
        </div>
        <div class="footer-section">
          <h4>Categorías</h4>
          ${categoriesHTML}
        </div>
        <div class="footer-section">
          <h4>Sitio</h4>
          <a href="/editorial" data-link>Editorial</a>
          <a href="/login" data-link>Acceso admin</a>
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; ${new Date().getFullYear()} <a href="https://nixeosoluciones.com" target="_blank" rel="noopener">nixeosoluciones.com</a> — Fansite Latam. Todos los derechos reservados.</p>
      </div>
    </div>
  `;
}
