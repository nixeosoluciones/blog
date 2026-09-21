export function renderFooter() {
  const footer = document.getElementById('main-footer');
  footer.innerHTML = `
    <div class="footer">
      <div class="footer-inner">
        <div class="footer-brand">
          <h3>Blog Dr. House</h3>
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
          <a href="/categorias/drama" data-link>Drama</a>
          <a href="/categorias/ciencia-ficcion" data-link>Ciencia Ficción</a>
          <a href="/categorias/historia-alternativa" data-link>Historia Alternativa</a>
          <a href="/categorias/fan-fiction" data-link>Fan Fiction</a>
        </div>
        <div class="footer-section">
          <h4>Sitio</h4>
          <a href="/editorial" data-link>Editorial</a>
          <a href="/login" data-link>Acceso admin</a>
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; ${new Date().getFullYear()} Blog Dr. House. Todos los derechos reservados.</p>
      </div>
    </div>
  `;
}
