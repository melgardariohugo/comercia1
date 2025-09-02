// --- autodetección del entorno ---
let API_BASE;
API_BASE = "http://localhost:3000";

//usar para cuando este en produccion
//if (
//    window.location.hostname === "localhost" ||
//    window.location.hostname === "127.0.0.1" ||
//    window.location.hostname.startsWith("192.168.") ||
//    window.location.hostname === "0.0.0.0"
//) {
//    API_BASE = "http://localhost:3000"; // o tu puerto backend local
//} else {
//    API_BASE = "https://TU-DOMINIO.com"; // Cambia esto por el dominio real del backend en producción
//}

const form = document.getElementById('loginForm');
const usuarioInput = document.getElementById('usuario');
const claveInput = document.getElementById('clave');
const btnRegresar = document.getElementById('btnRegresar');
const showHideBtn = document.querySelector('.show-hide');
document.getElementById("usuario").focus();

function limpiarInputs() {
  usuarioInput.value = '';
  claveInput.value = '';
  usuarioInput.focus();
}

showHideBtn.addEventListener('click', () => {
  claveInput.type = claveInput.type === 'password' ? 'text' : 'password';
  showHideBtn.textContent = claveInput.type === 'password' ? '\u{1F441}' : '🙈';
});

function validarClave(clave) {
  return (
    clave.length >= 8 && clave.length <= 12 &&
    /[A-Z]/.test(clave) &&
    /[a-z]/.test(clave) &&
    /\d/.test(clave)
  );
}

form.addEventListener('submit', async function (e) {
  e.preventDefault();
  const usuario = usuarioInput.value.trim();
  const clave = claveInput.value.trim();

  if (!usuario || !clave) {
    showNotify({
      msg: 'Debe completar usuario y clave.',
      type: 'error'
    });
    return;
  }
  if (!validarClave(clave)) {
    showNotify({
      msg: 'La clave debe tener entre 8 y 12 caracteres, con mayúsculas, minúsculas y al menos un número.',
      type: 'error'
    });
    claveInput.value = '';
    claveInput.focus();
    return;
  }

  try {
    const resp = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario, clave })
    });

    // Intentá leer SIEMPRE el json, aún si resp.ok es false (ejemplo: 401)
    const data = await resp.json();

    if (resp.ok) {
      // Arma el objeto del usuario con los datos del backend
      const usuarioLogueado = {
        nivel_acceso: data.nivel_acceso,
        apellido: data.apellido,
        nombres: data.nombre, // O 'nombres' si en tu backend es así
        nro_comercio: data.nro_comercio
      };
      // Guarda el usuario como un solo objeto en localStorage
      localStorage.setItem('usuarioLogueado', JSON.stringify(usuarioLogueado));
      
      // Limpia los ítems viejos, por si quedaron
      localStorage.removeItem('nivel_acceso');
      localStorage.removeItem('apellido');
      localStorage.removeItem('nombre');
      localStorage.removeItem('nro_comercio');

      showNotify({
        msg: `Bienvenido/a ${data.nombre} ${data.apellido}`,
        type: 'success'
      });

      form.style.animation = 'fadeout .85s cubic-bezier(.8,-0.01,.31,.99)';
      setTimeout(() => { window.location.href = '../../menu/html/menuprincipal.html'; }, 900);



    } else {
      // SIEMPRE mostrar el mensaje de error que manda el backend
      showNotify({
        msg: data.error || 'Usuario o clave incorrectos.',
        type: 'error'
      });
      limpiarInputs();
    }

  } catch (error) {
    showNotify({
      msg: 'Error de conexión. Intente más tarde.',
      type: 'error'
    });
    limpiarInputs();
  }
});

btnRegresar.addEventListener('click', () => {
  limpiarInputs();
  window.location.href = '../../index.html';
});

const animStyle = document.createElement('style');
animStyle.textContent = `
@keyframes fadeout {
  to { opacity: 0; transform: scale(.8) rotateY(25deg) translateY(-30px); filter: blur(5px); }
}
`;
document.head.appendChild(animStyle);
