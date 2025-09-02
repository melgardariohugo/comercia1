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

const form = document.getElementById('recuperarForm');
const correo = document.getElementById('correo');
const btnRegresar = document.getElementById('btnRegresar');

function limpiarInput() {
  correo.value = '';
  correo.focus();
}

form.addEventListener('submit', async function(e) {
  e.preventDefault();

  if (!correo.value.trim()) {
    showNotify({ msg: 'Por favor, ingresa tu correo.', type: 'error' });
    correo.focus();
    return;
  }
  try {
    const resp = await fetch(`${API_BASE}/recuperar-clave`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ correo: correo.value.trim() })
    });
    const data = await resp.json();
    if (resp.ok && data.success) {
      showNotify({
        msg: 'Si el correo existe, recibirás un enlace para recuperar tu clave. Revisa tu bandeja de entrada o spam.',
        type: 'success'
      });
      form.style.animation = 'fadeout .9s cubic-bezier(.8,-0.01,.31,.99)';
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 3500);
    } else {
      showNotify({
        msg: data.error || 'No se pudo procesar el pedido. Intente más tarde.',
        type: 'error'
      });
      limpiarInput();
    }
  } catch (error) {
    showNotify({
      msg: 'Error de conexión. Intente más tarde.',
      type: 'error'
    });
  }
});

btnRegresar.addEventListener('click', () => {
  limpiarInput();
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
