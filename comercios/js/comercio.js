// --- autodetección de entorno ---
let API_BASE;
API_BASE = "http://localhost:3000";

// Helper para setear la fecha de alta
function setFechaAltaHoy() {
    const fechaHoy = new Date().toISOString().slice(0,10);
    document.getElementById('fecha_alta').value = fechaHoy;
}

function limpiarFormulario() {
    document.querySelectorAll('#formComercio input:not([id="fecha_alta"]), #formComercio select').forEach(input => {
        input.value = "";
    });
    try {
        const usuario = JSON.parse(localStorage.getItem('usuarioLogueado'));
        if (usuario && 'nro_comercio' in usuario) {
            document.getElementById('nro_comercio').value = usuario.nro_comercio;
        }
    } catch (e) {}
}

document.addEventListener("DOMContentLoaded", () => {
    if (typeof mostrarDatosUsuarioUniversal === "function") {
        mostrarDatosUsuarioUniversal();
    }
    setFechaAltaHoy();

        // Boton gestioncomercio
    document.getElementById('btnGestComercio').addEventListener('click', () => {
        window.location.href = "gestioncomercio.html";
    });

    // Validación y guardado
    document.getElementById('formComercio').addEventListener('submit', async function(e) {
        e.preventDefault();
        // Validación campos obligatorios
        let form = e.target;
        let incompleto = null;
        Array.from(form.elements).forEach(el => {
            if (
                (el.tagName === "INPUT" || el.tagName === "SELECT") &&
                el.type !== "button" && !el.disabled && !el.value
            ) {
                incompleto = el;
            }
        });
        if (incompleto) {
            showNotify({
                msg: "Completa el campo: " +
                    (incompleto.previousElementSibling ? incompleto.previousElementSibling.textContent : incompleto.name),
                type: "error"
            });
            incompleto.focus();
            return;
        }

        // Validaciones especiales
        const email = form.correo.value.trim();
        if (!/^[^@]+@[^@]+\.[^@]+$/.test(email)) {
            showNotify({ msg: "Correo inválido", type: "error" });
            form.correo.focus();
            return;
        }
        const cuil = form.cuil.value.trim();
        if (!/^\d{11}$/.test(cuil)) {
            showNotify({ msg: "CUIL inválido (11 dígitos)", type: "error" });
            form.cuil.focus();
            return;
        }
        const cuit = form.cuit.value.trim();
        if (!/^\d{11}$/.test(cuit)) {
            showNotify({ msg: "CUIT inválido (11 dígitos)", type: "error" });
            form.cuit.focus();
            return;
        }
        const nro_contacto = form.nro_contacto.value.trim();
        if (!/^\d{7,15}$/.test(nro_contacto)) {
            showNotify({ msg: "N° Contacto inválido (sólo números, 7 a 15 cifras)", type: "error" });
            form.nro_contacto.focus();
            return;
        }

        // Armar datos
        const datos = {
            nro_comercio: form.nro_comercio.value,
            nom_comercio: form.nom_comercio.value,
            razonsocial: form.razonsocial.value,
            cuil: form.cuil.value,
            cuit: form.cuit.value,
            direccion: form.direccion.value,
            localidad: form.localidad.value,
            partido: form.partido.value,
            provincia: form.provincia.value,
            cod_postal: form.cod_postal.value,
            correo: form.correo.value,
            responsable: form.responsable.value,
            nro_contacto: form.nro_contacto.value,
            nro_sucursal: form.nro_sucursal.value,
            fecha_alta: form.fecha_alta.value,
        };

        // --- Fetch autodetectando entorno ---
        try {
            const resp = await fetch(`${API_BASE}/api/comercio/guardar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datos)
            });
            const res = await resp.json();
            if (resp.ok && (res.ok || res.success)) {
                showNotify({
                    msg: "Comercio registrado correctamente.",
                    type: "success"
                });
                limpiarFormulario();
                setFechaAltaHoy();
            } else {
                showNotify({
                    msg: res.error || "No se pudo registrar el comercio.",
                    type: "error"
                });
            }
        } catch (err) {
            showNotify({
                msg: "Error de conexión: " + err,
                type: "error"
            });
        }
    });
});
document.addEventListener("DOMContentLoaded", function() {
    const input = document.getElementById("nom_comercio");
    if (input) input.focus();
});
