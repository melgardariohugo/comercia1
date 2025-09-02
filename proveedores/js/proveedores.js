// --- autodetección del entorno ---
let API_BASE = "http://localhost:3000";

// --- Modal mensaje ---
function mostrarMensaje(texto, tipo = "info") {
    const modal = document.getElementById('modalMensaje');
    const mensajeTexto = document.getElementById('mensajeTexto');
    mensajeTexto.textContent = texto;
    mensajeTexto.style.color =
        tipo === 'error' ? '#ff6161' :
        tipo === 'ok' ? '#39e971' : '#43d0e3';
    modal.classList.remove('modal-oculto');
}
function ocultarMensaje() {
    document.getElementById('modalMensaje').classList.add('modal-oculto');
}

// --- NUEVO: obtener el próximo número de proveedor disponible para el comercio
async function obtenerProximoNroProveedor(nro_comercio) {
    try {
        const resp = await fetch(`${API_BASE}/api/proveedores/proximo/${nro_comercio}`);
        const data = await resp.json();
        if (data.ok && data.proximo) {
            return data.proximo;
        }
        return 1; // Si hay error, por defecto 1
    } catch {
        return 1;
    }
}

window.addEventListener('DOMContentLoaded', async () => {
    mostrarDatosUsuarioUniversal();
    document.getElementById('cerrarModal').onclick = ocultarMensaje;

    // Obtener nro_comercio del usuario logueado
    let nroComercioActual = null;
    const usuarioLogueadoRaw = localStorage.getItem('usuarioLogueado');
    if (usuarioLogueadoRaw) {
        try {
            const usuarioLogueado = JSON.parse(usuarioLogueadoRaw);
            if (
                usuarioLogueado &&
                usuarioLogueado.nro_comercio !== undefined &&
                document.getElementById('nro_comercio')
            ) {
                document.getElementById('nro_comercio').value = usuarioLogueado.nro_comercio;
                nroComercioActual = usuarioLogueado.nro_comercio;
                // --- NUEVO: Autocompletar nro_proveedor SOLO si tenemos nro_comercio
                if (nroComercioActual !== null && nroComercioActual !== undefined) {
                    const proximo = await obtenerProximoNroProveedor(nroComercioActual);
                    console.log("Próximo número que trae el backend:", proximo);
                    document.getElementById('nro_proveedor').value = proximo;
                } else {
                    console.log("nroComercioActual es null o undefined");
                }
            } else {
                console.log("No hay usuarioLogueado o falta nro_comercio/documento");
            }
        } catch (e) {
            console.error("Error al parsear usuarioLogueadoRaw:", e);
        }
    } else {
        console.log("No hay usuarioLogueadoRaw en localStorage");
    }

    // Setea fecha_alta
    document.getElementById('fecha_alta').value = new Date().toISOString().slice(0, 10);

    // Incremento y decremento nro_proveedor
    document.getElementById('btnMenos').onclick = function() {
        const input = document.getElementById('nro_proveedor');
        input.value = Math.max(1, parseInt(input.value || 1) - 1);
    };
    document.getElementById('btnMas').onclick = function() {
        const input = document.getElementById('nro_proveedor');
        input.value = parseInt(input.value || 1) + 1;
    };

    // Web click/dblclick, abre en ventana nueva
    document.getElementById('web_proveedor').addEventListener('dblclick', function() {
        if (this.value) window.open(this.value, "_blank");
    });
    document.getElementById('web_proveedor').addEventListener('click', function() {
        if (this.value && this.value.startsWith("http")) window.open(this.value, "_blank");
    });

    // Botón Gest. Proveedor: ir a gestionproveedores.html
    document.getElementById('btnGestProveedor').onclick = function () {
        window.location.href = "gestionproveedores.html";
    };

    // Botón Volver: al menú principal
    document.getElementById('btnVolver').onclick = function () {
        window.location.href = "../../menu/html/menuprincipal.html";
    };

    // Validación y envío
    document.getElementById('formProveedor').onsubmit = async function(e) {
        e.preventDefault();
        limpiarErrores();

        // --- Obtener datos
        const nro_comercio = document.getElementById('nro_comercio').value.trim();
        const nro_proveedor = document.getElementById('nro_proveedor').value.trim();
        const nom_proveedor = document.getElementById('nom_proveedor').value.trim();
        const web_proveedor = document.getElementById('web_proveedor').value.trim();
        const correo = document.getElementById('correo').value.trim();
        const direccion = document.getElementById('direccion').value.trim();
        const contacto = document.getElementById('contacto').value.trim();
        const tel_contacto = document.getElementById('tel_contacto').value.trim();
        const fecha_alta = document.getElementById('fecha_alta').value.trim();

        // --- Validaciones
        let primerFoco = null;
        if (!nro_proveedor || isNaN(nro_proveedor) || parseInt(nro_proveedor) < 1) {
            setError('nro_proveedor', 'N° proveedor válido');
            primerFoco = primerFoco || 'nro_proveedor';
        }
        if (!nom_proveedor || nom_proveedor.length > 50) {
            setError('nom_proveedor', 'Nombre (máx 50)');
            primerFoco = primerFoco || 'nom_proveedor';
        }
        if (!web_proveedor || web_proveedor.length > 100 || !/^https?:\/\/[^ "]+$/.test(web_proveedor)) {
            setError('web_proveedor', 'Web válida, ej: https://...');
            primerFoco = primerFoco || 'web_proveedor';
        }
        if (!correo || correo.length > 160 || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(correo)) {
            setError('correo', 'Correo válido (máx 160)');
            primerFoco = primerFoco || 'correo';
        }
        if (!direccion || direccion.length > 200) {
            setError('direccion', 'Dirección (máx 200)');
            primerFoco = primerFoco || 'direccion';
        }
        if (!contacto || contacto.length > 50) {
            setError('contacto', 'Contacto (máx 50)');
            primerFoco = primerFoco || 'contacto';
        }
        if (!tel_contacto || !/^\d{6,15}$/.test(tel_contacto)) {
            setError('tel_contacto', 'Tel. sólo números (6 a 15 dígitos)');
            primerFoco = primerFoco || 'tel_contacto';
        }
         if (!fecha_alta) {
            showNotify({ msg: 'Error: falta fecha de alta', type: 'error' });
            return;
        }

        if (primerFoco) {
            document.getElementById(primerFoco).focus();
            return;
        }

        // --- Guardar proveedor vía backend
        try {
            const resp = await fetch(`${API_BASE}/api/proveedores/alta`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    nro_comercio, nro_proveedor, nom_proveedor, web_proveedor,
                    correo, direccion, contacto, tel_contacto, fecha_alta
                })
            });
            const data = await resp.json();
            if (resp.ok && data.ok) {
                showNotify({ msg: 'Proveedor guardado correctamente.', type: 'success' });
                document.getElementById('formProveedor').reset();
              
                // Vuelve a setear el nro_comercio y la fecha después de limpiar
                const usuarioLogueadoRaw2 = localStorage.getItem('usuarioLogueado');
                let nroComercioActual2 = null;
                if (usuarioLogueadoRaw2) {
                    try {
                        const usuarioLogueado2 = JSON.parse(usuarioLogueadoRaw2);
                        if (
                            usuarioLogueado2 &&
                            usuarioLogueado2.nro_comercio !== undefined &&
                            document.getElementById('nro_comercio')
                        ) {
                            document.getElementById('nro_comercio').value = usuarioLogueado2.nro_comercio;
                            nroComercioActual2 = usuarioLogueado2.nro_comercio;
                        }
                    } catch (e) {}
                }
                document.getElementById('fecha_alta').value = fecha_alta;
                // --- NUEVO: volver a autocompletar nro_proveedor
                if (nroComercioActual2 !== null && nroComercioActual2 !== undefined) {
                    const proximo = await obtenerProximoNroProveedor(nroComercioActual2);
                    document.getElementById('nro_proveedor').value = proximo;
                }
            } else {
                showNotify({ msg: data.mensaje || "No se pudo guardar.", type: 'error' });
            }
        } catch (err) {
            showNotify({ msg: 'Error de conexión.', type: 'error' });
        }
    };
});

// --- Errores en formulario ---
function setError(inputId, mensaje) {
    document.getElementById('err_' + inputId).textContent = mensaje;
    document.getElementById(inputId).setAttribute('title', mensaje);
}
function limpiarErrores() {
    document.querySelectorAll('.input-error').forEach(e => e.textContent = '');
    document.querySelectorAll('input').forEach(e => e.removeAttribute('title'));
}

document.addEventListener("DOMContentLoaded", function() {
    const input = document.getElementById("nom_proveedor");
    if (input) input.focus();
});


