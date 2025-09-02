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

const form = document.getElementById('registroForm');
const apellido = document.getElementById('apellido');
const nombres = document.getElementById('nombres');
const correo = document.getElementById('correo');
const usuario = document.getElementById('usuario');
const clave = document.getElementById('clave');
const btnRegresar = document.getElementById('btnRegresar');
const showHideBtn = document.querySelector('.show-hide');
document.getElementById("apellido").focus();
// Mostrar/Ocultar clave
showHideBtn.addEventListener('click', () => {
  clave.type = clave.type === 'password' ? 'text' : 'password';
  showHideBtn.textContent = clave.type === 'password' ? '\u{1F441}' : '🙈';
});

function limpiarInputs() {
  apellido.value = '';
  nombres.value = '';
  correo.value = '';
  usuario.value = '';
  clave.value = '';
  apellido.focus();
}

function validarClave(texto) {
  return (
    texto.length >= 8 && texto.length <= 12 &&
    /[A-Z]/.test(texto) &&
    /[a-z]/.test(texto) &&
    /\d/.test(texto)
  );
}

form.addEventListener('submit', async function(e) {
  e.preventDefault();

  if (
    !apellido.value.trim() ||
    !nombres.value.trim() ||
    !correo.value.trim() ||
    !usuario.value.trim() ||
    !clave.value.trim()
  ) {
    showNotify({ msg: 'Completa todos los campos.', type: 'error' });
    return;
  }
  if (!validarClave(clave.value)) {
    showNotify({
      msg: 'La clave debe tener entre 8 y 12 caracteres, con mayúsculas, minúsculas y al menos un número.',
      type: 'error'
    });
    clave.value = '';
    clave.focus();
    return;
  }

  // Enviar registro al backend
  try {
    const resp = await fetch(`${API_BASE}/registro`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apellido: apellido.value.trim(),
        nombres: nombres.value.trim(),
        correo: correo.value.trim(),
        usuario: usuario.value.trim(),
        clave: clave.value.trim()
      })
    });
    const data = await resp.json();
    if (resp.ok && data.success) {
      showNotify({
        msg: '¡Registro exitoso! Esperá que el administrador active tu cuenta.',
        type: 'success'
      });
      form.style.animation = 'fadeout .9s cubic-bezier(.8,-0.01,.31,.99)';
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 1800);
    } else {
      showNotify({
        msg: data.error || 'Error al registrar. Intentá de nuevo.',
        type: 'error'
      });
      limpiarInputs();
    }
  } catch (error) {
    showNotify({
      msg: 'Error de conexión. Intente más tarde.',
      type: 'error'
    });
  }
});

// Botón Regresar
btnRegresar.addEventListener('click', () => {
  limpiarInputs();
  window.location.href = '../../index.html';
});

// Animación fadeout
const animStyle = document.createElement('style');
animStyle.textContent = `
@keyframes fadeout {
  to { opacity: 0; transform: scale(.8) rotateY(25deg) translateY(-30px); filter: blur(5px); }
}
`;
document.head.appendChild(animStyle);
