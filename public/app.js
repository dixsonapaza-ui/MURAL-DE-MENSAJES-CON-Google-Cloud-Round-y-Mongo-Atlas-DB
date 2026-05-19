/* ══════════════════════════════════════════════════════════════
   APP.JS — Lógica completa del frontend FLORO
   Sin frameworks. Vanilla JavaScript.
   ══════════════════════════════════════════════════════════════ */

/**
 * API_URL vacía = rutas relativas al mismo servidor.
 * Frontend y backend están en el mismo contenedor de Cloud Run,
 * así que /api/auth/login resuelve correctamente tanto en
 * localhost:8080 como en tu-app.run.app sin cambiar nada.
 */
const API_URL = '';

const AVATAR_COLORS = ['#534AB7', '#E54D4D', '#1D9E75', '#D4A843', '#4A8FE7', '#E5734D'];

/**
 * Validación de entrada — rechaza espacios en blanco y caracteres especiales.
 * Solo permite letras, números, @, . y _ en emails.
 * Solo permite letras y números en contraseñas.
 */
function hasWhitespace(str) {
  return /\s/.test(str);
}
function hasSpecialChars(str) {
  return /[^a-zA-Z0-9]/.test(str);
}
function isValidEmail(str) {
  return /^[a-zA-Z0-9._]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(str);
}

/* ══════════════════════════════════════════════════════════════
   INICIALIZACIÓN — Detectar página y arrancar
   ══════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('auth-card')) {
    initAuth();
  } else if (document.getElementById('feed-list')) {
    initApp();
  }
});

/* ══════════════════════════════════════════════════════════════
   PÁGINA AUTH — Login y Registro
   ══════════════════════════════════════════════════════════════ */

function initAuth() {
  if (localStorage.getItem('ag_token')) {
    window.location.href = 'app.html';
    return;
  }

  var tabs = document.querySelectorAll('.tab');
  var loginForm = document.getElementById('login-form');
  var registerForm = document.getElementById('register-form');

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      tabs.forEach(function (t) { t.classList.remove('active'); });
      tab.classList.add('active');
      hideMessages();
      if (tab.dataset.tab === 'login') {
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
      } else {
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
      }
    });
  });

  loginForm.addEventListener('submit', function (e) {
    e.preventDefault();
    handleLogin();
  });

  registerForm.addEventListener('submit', function (e) {
    e.preventDefault();
    handleRegister();
  });
}

async function handleLogin() {
  var email = document.getElementById('login-email').value.trim();
  var password = document.getElementById('login-password').value;
  var btn = document.getElementById('login-btn');
  var errorEl = document.getElementById('login-error');

  hideMessages();

  if (!email || !password) {
    showMessage(errorEl, 'Completa todos los campos');
    return;
  }

  if (hasWhitespace(email) || hasWhitespace(password)) {
    showMessage(errorEl, 'No se permiten espacios en blanco');
    return;
  }

  if (!isValidEmail(email)) {
    showMessage(errorEl, 'Formato de email inválido');
    return;
  }

  if (hasSpecialChars(password)) {
    showMessage(errorEl, 'La contraseña solo puede contener letras y números');
    return;
  }

  setLoading(btn, true);

  try {
    var res = await fetch(API_URL + '/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email, password: password })
    });
    var data = await res.json();

    if (!res.ok) {
      showMessage(errorEl, data.error || 'Credenciales incorrectas');
      return;
    }

    localStorage.setItem('ag_token', data.token);
    localStorage.setItem('ag_email', email);
    window.location.href = 'app.html';
  } catch (_err) {
    showMessage(errorEl, 'Error de conexión con el servidor');
  } finally {
    setLoading(btn, false);
  }
}

async function handleRegister() {
  var email = document.getElementById('register-email').value.trim();
  var password = document.getElementById('register-password').value;
  var btn = document.getElementById('register-btn');
  var errorEl = document.getElementById('register-error');
  var successEl = document.getElementById('register-success');

  hideMessages();

  if (!email || !password) {
    showMessage(errorEl, 'Completa todos los campos');
    return;
  }

  if (hasWhitespace(email) || hasWhitespace(password)) {
    showMessage(errorEl, 'No se permiten espacios en blanco');
    return;
  }

  if (!isValidEmail(email)) {
    showMessage(errorEl, 'Formato de email inválido');
    return;
  }

  if (hasSpecialChars(password)) {
    showMessage(errorEl, 'La contraseña solo puede contener letras y números');
    return;
  }

  if (password.length < 6) {
    showMessage(errorEl, 'La contraseña debe tener al menos 6 caracteres');
    return;
  }

  setLoading(btn, true);

  try {
    var res = await fetch(API_URL + '/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email, password: password })
    });
    var data = await res.json();

    if (res.status === 409) {
      showMessage(errorEl, 'Este email ya está registrado');
      return;
    }

    if (!res.ok) {
      showMessage(errorEl, data.error || 'Error al crear la cuenta');
      return;
    }

    showMessage(successEl, 'Cuenta creada. Ahora puedes entrar.');
    document.getElementById('register-email').value = '';
    document.getElementById('register-password').value = '';
  } catch (_err) {
    showMessage(errorEl, 'Error de conexión con el servidor');
  } finally {
    setLoading(btn, false);
  }
}

/* ══════════════════════════════════════════════════════════════
   PÁGINA APP — Muro de Mensajes
   ══════════════════════════════════════════════════════════════ */

function initApp() {
  var token = getToken();
  if (!token) return;

  var email = getEmail();
  var initials = email.split('@')[0].substring(0, 2).toUpperCase();

  document.getElementById('user-email').textContent = email;
  document.getElementById('user-avatar').textContent = initials;

  mostrarSkeletons();
  cargarMensajes();
  checkServerStatus();

  var textarea = document.getElementById('mensaje-input');
  var charCount = document.getElementById('char-count');
  var counter = textarea.closest('.composer-card').querySelector('.char-counter');

  textarea.addEventListener('input', function () {
    var len = textarea.value.length;
    charCount.textContent = len;
    counter.classList.remove('near-limit', 'at-limit');
    if (len >= 280) {
      counter.classList.add('at-limit');
    } else if (len >= 240) {
      counter.classList.add('near-limit');
    }
  });

  document.getElementById('btn-publish').addEventListener('click', function () {
    var texto = textarea.value.trim();
    if (texto) publicarMensaje(texto);
  });

  textarea.addEventListener('keydown', function (e) {
    if (e.ctrlKey && e.key === 'Enter') {
      var texto = textarea.value.trim();
      if (texto) publicarMensaje(texto);
    }
  });

  document.getElementById('btn-refresh').addEventListener('click', function () {
    var btn = document.getElementById('btn-refresh');
    btn.classList.add('spinning');
    cargarMensajes().finally(function () {
      setTimeout(function () { btn.classList.remove('spinning'); }, 400);
    });
  });

  document.getElementById('btn-logout').addEventListener('click', logout);
}

function mostrarSkeletons() {
  var feedList = document.getElementById('feed-list');
  var html = '';
  for (var i = 0; i < 4; i++) {
    html +=
      '<div class="message-card skeleton-card">' +
        '<div class="skeleton skeleton-avatar"></div>' +
        '<div class="skeleton-content">' +
          '<div class="skeleton skeleton-line skeleton-short"></div>' +
          '<div class="skeleton skeleton-line"></div>' +
          '<div class="skeleton skeleton-line skeleton-medium"></div>' +
        '</div>' +
      '</div>';
  }
  feedList.innerHTML = html;
}

async function cargarMensajes() {
  var feedList = document.getElementById('feed-list');

  try {
    var res = await fetch(API_URL + '/api/mensajes');
    var mensajes = await res.json();

    if (!Array.isArray(mensajes) || mensajes.length === 0) {
      feedList.innerHTML =
        '<div class="empty-state">' +
          '<div class="empty-icon">📭</div>' +
          '<p>No hay mensajes aún</p>' +
          '<p class="empty-hint">Sé el primero en publicar algo</p>' +
        '</div>';
      document.getElementById('stat-mensajes').textContent = '0';
      return;
    }

    feedList.innerHTML = mensajes.map(function (msg, idx) {
      var authorEmail = (msg.autor && msg.autor.email) ? msg.autor.email : 'Anónimo';
      var initials = authorEmail.split('@')[0].substring(0, 2).toUpperCase();
      var color = generarColorAvatar(authorEmail);
      var tiempo = tiempoRelativo(msg.createdAt);

      return (
        '<article class="message-card" style="animation-delay:' + (idx * 0.04) + 's">' +
          '<div class="message-avatar" style="background-color:' + color + '">' + initials + '</div>' +
          '<div class="message-content">' +
            '<div class="message-header">' +
              '<span class="message-author">' + escapeHtml(authorEmail) + '</span>' +
              '<span class="message-time">' + tiempo + '</span>' +
            '</div>' +
            '<p class="message-text">' + escapeHtml(msg.texto) + '</p>' +
          '</div>' +
        '</article>'
      );
    }).join('');

    document.getElementById('stat-mensajes').textContent = mensajes.length;
  } catch (_err) {
    feedList.innerHTML =
      '<div class="empty-state">' +
        '<div class="empty-icon">⚠️</div>' +
        '<p>Error al cargar mensajes</p>' +
        '<p class="empty-hint">Intenta actualizar la página</p>' +
      '</div>';
  }
}

async function publicarMensaje(texto) {
  var btn = document.getElementById('btn-publish');
  var textarea = document.getElementById('mensaje-input');
  var charCount = document.getElementById('char-count');
  var token = getToken();
  if (!token) return;

  setLoading(btn, true);

  try {
    var res = await fetch(API_URL + '/api/mensajes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({ texto: texto })
    });

    if (res.status === 401) {
      localStorage.removeItem('ag_token');
      localStorage.removeItem('ag_email');
      window.location.href = 'index.html';
      return;
    }

    if (res.ok) {
      textarea.value = '';
      charCount.textContent = '0';
      var counter = textarea.closest('.composer-card').querySelector('.char-counter');
      counter.classList.remove('near-limit', 'at-limit');
      await cargarMensajes();
    }
  } catch (_err) {
    // Fallo silencioso — el usuario puede reintentar
  } finally {
    setLoading(btn, false);
  }
}

async function checkServerStatus() {
  var statusEl = document.getElementById('stat-status');
  try {
    var res = await fetch(API_URL + '/health');
    if (res.ok) {
      statusEl.className = 'stat-value stat-online';
      statusEl.innerHTML = '<span class="status-dot"></span> Online';
    } else {
      statusEl.className = 'stat-value stat-offline';
      statusEl.innerHTML = '<span class="status-dot"></span> Offline';
    }
  } catch (_err) {
    statusEl.className = 'stat-value stat-offline';
    statusEl.innerHTML = '<span class="status-dot"></span> Offline';
  }
}

/* ══════════════════════════════════════════════════════════════
   UTILIDADES
   ══════════════════════════════════════════════════════════════ */

function getToken() {
  var token = localStorage.getItem('ag_token');
  if (!token) {
    window.location.href = 'index.html';
    return null;
  }
  return token;
}

function getEmail() {
  return localStorage.getItem('ag_email') || '';
}

function logout() {
  localStorage.removeItem('ag_token');
  localStorage.removeItem('ag_email');
  window.location.href = 'index.html';
}

function tiempoRelativo(fecha) {
  var ahora = Date.now();
  var diff = ahora - new Date(fecha).getTime();
  var segs = Math.floor(diff / 1000);
  var mins = Math.floor(segs / 60);
  var horas = Math.floor(mins / 60);
  var dias = Math.floor(horas / 24);

  if (mins < 1) return 'hace un momento';
  if (mins < 60) return 'hace ' + mins + ' min';
  if (horas < 24) return 'hace ' + horas + 'h';
  if (dias < 7) return 'hace ' + dias + 'd';
  return new Date(fecha).toLocaleDateString('es-ES');
}

function generarColorAvatar(email) {
  var hash = 0;
  for (var i = 0; i < email.length; i++) {
    hash = email.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function escapeHtml(text) {
  var div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function setLoading(btn, loading) {
  if (loading) {
    btn.classList.add('loading');
    btn.disabled = true;
  } else {
    btn.classList.remove('loading');
    btn.disabled = false;
  }
}

function showMessage(el, text) {
  el.textContent = text;
  el.classList.add('visible');
}

function hideMessages() {
  var msgs = document.querySelectorAll('.form-message');
  msgs.forEach(function (m) { m.classList.remove('visible'); });
}
