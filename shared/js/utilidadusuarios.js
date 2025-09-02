function mostrarDatosUsuarioUniversal() {
    const usuarioLogueadoRaw = localStorage.getItem('usuarioLogueado');
    const spanUsuario = document.getElementById('datos-usuario');
    const inputComercio = document.getElementById('nro_comercio');
    
    // Si existe el span
    if (spanUsuario) {
        if (!usuarioLogueadoRaw) {
            spanUsuario.innerHTML = `<span style="color:#f77"><strong>Usuario no logueado</strong></span>`;
        } else {
            try {
                const usuarioLogueado = JSON.parse(usuarioLogueadoRaw) || {};
                const nivel_acceso = usuarioLogueado.nivel_acceso ?? "-";
                const apellido = (usuarioLogueado.apellido ?? "").toUpperCase();
                const nombres = (usuarioLogueado.nombres ?? "").replace(/\b\w/g, l => l.toUpperCase());
                const nro_comercio = usuarioLogueado.nro_comercio ?? "";
                spanUsuario.innerHTML =
                    `<strong>Nivel:</strong> ${nivel_acceso} &nbsp;|&nbsp; ` +
                    `<strong>Usuario:</strong> ${apellido} ${nombres} &nbsp;|&nbsp; ` +
                    `<strong>Comercio:</strong> ${nro_comercio}`;
            } catch (e) {
                spanUsuario.innerHTML = `<span style="color:#f77"><strong>Usuario no logueado</strong></span>`;
            }
        }
    }

    // Si existe el input de nro_comercio, poner valor y solo readonly (no disabled)
    if (inputComercio) {
        try {
            const usuarioLogueado = usuarioLogueadoRaw ? JSON.parse(usuarioLogueadoRaw) : {};
            inputComercio.value = usuarioLogueado.nro_comercio ?? "";
        } catch (e) {
            inputComercio.value = "";
        }
        inputComercio.setAttribute('readonly', true);
        // inputComercio.setAttribute('disabled', true); // Solo si NO necesitás enviar en el form
    }
}
