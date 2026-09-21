import { getUser, isAdmin, setupAdmin, refreshAdminStatus } from '../services/auth.js';

export async function renderSetupAdminPage() {
  const main = document.getElementById('main-content');
  const user = getUser();

  if (!user) {
    main.innerHTML =
      '<div class="login-page">' +
        '<h1>Configurar Administrador</h1>' +
        '<div class="admin-card"><p>Necesitas iniciar sesión primero.</p>' +
        '<a href="/login" data-link class="btn btn-primary" style="margin-top:1rem">Iniciar sesión</a></div>' +
      '</div>';
    return;
  }

  const alreadyAdmin = isAdmin();

  main.innerHTML =
    '<div class="login-page">' +
      '<h1>Configurar Administrador</h1>' +
      '<div class="admin-card">' +
        '<p><strong>Usuario:</strong> ' + user.email + '</p>' +
        '<p><strong>UID:</strong> ' + user.uid + '</p>' +
        (alreadyAdmin
          ? '<div style="margin-top:1rem;padding:1rem;background:#d1fae5;border-radius:8px;color:#065f46">' +
              '✓ Ya eres administrador. <a href="/admin" data-link style="color:#065f46;font-weight:600">Ir al panel →</a>' +
            '</div>'
          : '<button class="btn btn-primary" id="setup-admin-btn" style="margin-top:1rem">Hacerme administrador</button>' +
            '<p id="setup-msg" style="margin-top:0.5rem;font-size:0.85rem;color:var(--text-tertiary)"></p>'
        ) +
      '</div>' +
    '</div>';

  if (!alreadyAdmin) {
    document.getElementById('setup-admin-btn').addEventListener('click', async function() {
      const msg = document.getElementById('setup-msg');
      this.disabled = true;
      this.textContent = 'Configurando...';

      try {
        await setupAdmin(user.uid);
        await refreshAdminStatus();
        msg.style.color = 'var(--color-success)';
        msg.textContent = '✓ Ahora eres administrador. Redirigiendo...';
        setTimeout(() => { window.location.href = '/admin'; }, 1500);
      } catch (err) {
        this.disabled = false;
        this.textContent = 'Hacerme administrador';
        msg.style.color = 'var(--color-error)';
        msg.textContent = 'Error: ' + err.message + '. Asegúrate de que las Security Rules permitan esta operación.';
      }
    });
  }
}
