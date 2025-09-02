// --- Configuración de API_BASE ---
const API_BASE = "http://localhost:3000";

// --- Mostrar datos usuario en encabezado ---
document.addEventListener('DOMContentLoaded', function () {
   if (typeof mostrarDatosUsuarioUniversal === "function") {
        mostrarDatosUsuarioUniversal();
    }
    const inputComercio = document.getElementById('nro_comercio');
    if (inputComercio && inputComercio.value !== '') {
        obtenerProximoNroRubro(inputComercio.value);
    }    
});

// --- Buscar el próximo nro_rubro para ese comercio ---
function obtenerProximoNroRubro(nro_comercio) {
    // Permitir 0 como válido
    if (nro_comercio === '' || nro_comercio === null || nro_comercio === undefined) {
        document.getElementById('nro_rubro').value = '';
        return;
    }
    fetch(`${API_BASE}/api/rubros/proximo-nro-rubro/${nro_comercio}`)
        .then(res => res.json())
        .then(data => {
            const next = (data && data.proximo_nro_rubro) ? data.proximo_nro_rubro : 1;
            document.getElementById('nro_rubro').value = next;
        })
        .catch(() => {
            document.getElementById('nro_rubro').value = '';
        });
}
document.getElementById('formRubros').addEventListener('submit', function (e) {
    e.preventDefault();
    const nro_comercio = document.getElementById('nro_comercio').value.trim();
    const nro_rubro = document.getElementById('nro_rubro').value.trim();
    const cod_rubro = document.getElementById('cod_rubro').value.trim();
    const rubro = document.getElementById('rubro').value.trim();

    // Validación
    if (!nro_comercio || !nro_rubro || !cod_rubro || !rubro) {
        showNotify({ msg: "Todos los campos deben estar completos.", type: "error" });
        return;
    }

    fetch(`${API_BASE}/api/rubros`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nro_comercio, nro_rubro, cod_rubro, rubro })
    })
    .then(res => res.json())
    .then(data => {
        if (data.exito) {
            showNotify({ msg: "Rubro guardado correctamente.", type: "ok" });
            document.getElementById('cod_rubro').value = '';
            document.getElementById('rubro').value = '';
            obtenerProximoNroRubro(nro_comercio);
        } else {
            showNotify({ msg: data.mensaje || "Ocurrió un error al guardar.", type: "error" });
        }
    })
    .catch(() => showNotify({ msg: "Error de conexión al guardar.", type: "error" }));
});

// --- Acción del botón Gest-Rubros ---
const btnGestRubros = document.getElementById('btnGestRubros');
if (btnGestRubros) {
    btnGestRubros.addEventListener('click', function() {
        window.location.href = 'gestionrubros.html';
    });
}
document.addEventListener("DOMContentLoaded", function() {
    const input = document.getElementById("cod_rubro");
    if (input) input.focus();
});
