import { onAuthChange, logout, isAdmin } from '../services/auth.js';
import { getThemePreference, setThemePreference } from '../utils/helpers.js';

let headerRendered = false;

export function renderHeader() {
  const header = document.getElementById('main-header');
  const theme = getThemePreference();

  header.innerHTML = `
    <div class="header">
      <div class="header-inner">
        <a href="/" class="header-logo" data-link>
          <div class="header-logo-icon">H</div>
          <span>Blog Dr. House</span>
        </a>
        <nav class="header-nav">
          <a href="/" data-link>Inicio</a>
          <a href="/historias" data-link>Historias</a>
          <a href="/autores" data-link>Autores</a>
          <a href="/categorias" data-link>Categorías</a>
          <a href="/editorial" data-link>Editorial</a>
        </nav>
        <div class="header-actions">
          <button class="search-btn" id="open-search">
            🔍 <span>Buscar</span>
          </button>
          <button class="theme-toggle" id="theme-toggle" title="Cambiar tema">
            ${theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <div id="auth-area"></div>
          <button class="hamburger" id="hamburger-btn">☰</button>
        </div>
      </div>
    </div>
    <div class="mobile-menu" id="mobile-menu">
      <a href="/" data-link>Inicio</a>
      <a href="/historias" data-link>Historias</a>
      <a href="/autores" data-link>Autores</a>
      <a href="/categorias" data-link>Categorías</a>
      <a href="/editorial" data-link>Editorial</a>
      <div id="mobile-auth-area"></div>
    </div>
  `;

  document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
  document.getElementById('hamburger-btn').addEventListener('click', toggleMobileMenu);
  document.getElementById('open-search').addEventListener('click', openSearch);

  updateAuthArea();

  if (!headerRendered) {
    headerRendered = true;
    onAuthChange(() => updateAuthArea());
  }
}

function toggleTheme() {
  const current = getThemePreference();
  const next = current === 'dark' ? 'light' : 'dark';
  setThemePreference(next);
  document.documentElement.setAttribute('data-theme', next);
  const btn = document.getElementById('theme-toggle');
  if (btn) btn.textContent = next === 'dark' ? '☀️' : '🌙';
}

function toggleMobileMenu() {
  const menu = document.getElementById('mobile-menu');
  menu.classList.toggle('active');
}

function updateAuthArea() {
  const authArea = document.getElementById('auth-area');
  const mobileAuthArea = document.getElementById('mobile-auth-area');
  if (!authArea) return;

  const user = window.__getCurrentUser ? window.__getCurrentUser() : null;
  const admin = isAdmin();

  let html;
  if (user && admin) {
    html = '<a href="/admin" data-link class="btn btn-primary btn-sm" style="background:#10b981;border-color:#10b981">⚡ Admin</a>' +
           ' <button onclick="window.__logout()" class="btn btn-ghost btn-sm">Salir</button>';
  } else if (user) {
    html = '<a href="/setup-admin" data-link class="btn btn-secondary btn-sm">Configurar admin</a>' +
           ' <button onclick="window.__logout()" class="btn btn-ghost btn-sm">Salir</button>';
  } else {
    html = '<a href="/login" data-link class="btn btn-primary btn-sm">Iniciar sesión</a>';
  }

  authArea.innerHTML = html;
  if (mobileAuthArea) {
    mobileAuthArea.innerHTML = '<div style="padding:0.75rem 1rem">' + html + '</div>';
  }

  window.__logout = () => logout();
}

function openSearch() {
  window.dispatchEvent(new CustomEvent('open-search'));
}
