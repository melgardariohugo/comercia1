// --- autodetección de entorno ---
let API_BASE;
API_BASE = "http://localhost:3000";

//usar para cuando este en produccion
//if (
//    window.location.hostname === "localhost" ||
//    window.location.hostname === "127.0.0.1" ||
//    window.location.hostname.startsWith("192.168.") ||
//    window.location.hostname === "0.0.0.0"
//) {
//    API_BASE = "http://localhost:3000"; // Cambia si tu backend local usa otro puerto
//} else {
//    API_BASE = "https://TU-DOMINIO.com"; // Cambia esto por tu dominio real en producción
//}

const form = document.getElementById('resetForm');
const clave = document.getElementById('clave');
const btnRegresar = document.getElementById('btnRegresar');
const showHideBtn = document.querySelector('.show-hide');

// Mostrar/Ocultar clave
showHideBtn.addEventListener('click', () => {
  clave.type = clave.type === 'password' ? 'text' : 'password';
  showHideBtn.textContent = clave.type === 'password' ? '\u{1F441}' : '🙈';
});

// Validar clave
function validarClave(texto) {
  return (
    texto.length >= 8 && texto.length <= 12 &&
    /[A-Z]/.test(texto) &&
    /[a-z]/.test(texto) &&
    /\d/.test(texto)
  );
}

// Tomar token de la URL
function getToken() {
  const params = new URLSearchParams(window.location.search);
  return params.get('token');
}

function mostrarErrorYSalir(msg) {
  showNotify({ msg, type: 'error' });
  document.getElementById('resetForm').style.display = 'none';
}

// Al cargar la página, validar token
document.addEventListener('DOMContentLoaded', async () => {
  const token = getToken();
  if (!token) {
    mostrarErrorYSalir('Enlace inválido o expirado.');
    return;
  }
  try {
    const resp = await fetch(`${API_BASE}/validar-token/${token}`);
    const data = await resp.json();
    if (!data.success) {
      mostrarErrorYSalir(data.error || 'Enlace inválido o expirado.');
    }
  } catch {
    mostrarErrorYSalir('No se pudo validar el enlace. Intente más tarde.');
  }
});

form.addEventListener('submit', async function(e) {
  e.preventDefault();
  if (!clave.value.trim()) {
    showNotify({ msg: 'Ingrese su nueva clave.', type: 'error' });
    clave.focus();
    return;
  }
  if (!validarClave(clave.value)) {
    showNotify({ msg: 'La clave debe tener 8-12 caracteres, mayúsculas, minúsculas y número.', type: 'error' });
    clave.value = '';
    clave.focus();
    return;
  }
  const token = getToken();
  if (!token) {
    showNotify({ msg: 'Enlace inválido o expirado.', type: 'error' });
    return;
  }
  try {
    const resp = await fetch(`${API_BASE}/resetear-clave`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, clave: clave.value.trim() })
    });
    const data = await resp.json();
    if (resp.ok && data.success) {
      showNotify({
        msg: '¡Clave actualizada! Ya puedes iniciar sesión.',
        type: 'success'
      });
      form.style.animation = 'fadeout .9s cubic-bezier(.8,-0.01,.31,.99)';
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 3500);
    } else {
      showNotify({ msg: data.error || 'Error al restablecer clave.', type: 'error' });
    }
  } catch {
    showNotify({ msg: 'Error de conexión. Intente más tarde.', type: 'error' });
  }
});

btnRegresar.addEventListener('click', () => {
  window.location.href = 'login.html';
});

// Animación fadeout
const animStyle = document.createElement('style');
animStyle.textContent = `
@keyframes fadeout {
  to { opacity: 0; transform: scale(.8) rotateY(25deg) translateY(-30px); filter: blur(5px); }
}
`;
document.head.appendChild(animStyle);
