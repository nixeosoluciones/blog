import { login, isAdmin, refreshAdminStatus } from '../services/auth.js';

export async function renderLoginPage() {
  const main = document.getElementById('main-content');
  main.innerHTML =
    '<div class="login-page">' +
      '<h1>Iniciar sesión</h1>' +
      '<div class="admin-card">' +
        '<form id="login-form">' +
          '<div class="form-group">' +
            '<label class="form-label">Correo electrónico</label>' +
            '<input type="email" class="form-input" id="login-email" required autocomplete="email">' +
          '</div>' +
          '<div class="form-group">' +
            '<label class="form-label">Contraseña</label>' +
            '<input type="password" class="form-input" id="login-password" required autocomplete="current-password">' +
          '</div>' +
          '<p id="login-error" style="color:var(--color-error);font-size:0.85rem;margin-bottom:1rem"></p>' +
          '<button type="submit" class="btn btn-primary btn-lg" style="width:100%">Entrar</button>' +
        '</form>' +
      '</div>' +
    '</div>';

  document.getElementById('login-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const errorEl = document.getElementById('login-error');
    const btn = document.querySelector('button[type="submit"]');
    errorEl.textContent = '';
    btn.disabled = true;
    btn.textContent = 'Entrando...';

    try {
      await login(email, password);
      await refreshAdminStatus();
      if (isAdmin()) {
        window.location.href = '/admin';
      } else {
        window.location.href = '/setup-admin';
      }
    } catch (err) {
      errorEl.textContent = 'Credenciales incorrectas. Intenta de nuevo.';
      btn.disabled = false;
      btn.textContent = 'Entrar';
    }
  });
}
