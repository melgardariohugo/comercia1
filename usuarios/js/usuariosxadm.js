const API_BASE = "http://localhost:3000";
let columnaOrden = null;
let sentidoOrden = 1; // 1=ascendente, -1=descendente
let usuarios = [];
let textoBusquedaGlobalUsuarios = "";

// --- IMPORTANTE: llamar a la función universal (asegúrate de tener <script src="utilidadusuarios.js"></script> antes de este script) ---
// Llama a mostrarDatosUsuarioUniversal() para rellenar encabezado y el input nro_comercio si existe.
window.addEventListener("DOMContentLoaded", () => {
  mostrarDatosUsuarioUniversal();

  // Ocultar input nro_comercio, siempre está fijo para todos los niveles
  const inputNroComercio = document.querySelector('input[name="nro_comercio"]');
  if (inputNroComercio) {
    inputNroComercio.style.display = "none";
  }

  // === RESTO DE TU LÓGICA (no se toca nada) ===
  const user = mostrarDatosUsuario();

  if (user && user.nro_comercio !== undefined) {
    cargarUsuarios(user.nro_comercio);
  }

  const form = document.getElementById("formBuscarUsuarios");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      const user = mostrarDatosUsuario();
      if (!user || user.nro_comercio === undefined) return;
      cargarUsuarios(user.nro_comercio);
    });
  }

  const btnVolver = document.getElementById("btnVolver");
  if (btnVolver) {
    btnVolver.addEventListener("click", () => {
      window.location.href = "../../menu/html/menuprincipal.html";
    });
  }

  // Configurar botones cerrar y submit modal editar usuario
  const modalEditar = document.getElementById("modalEditarUsuario");
  const btnCerrarModalEditar = document.getElementById(
    "btnCerrarModalEditarUsuario"
  );
  const formEditar = document.getElementById("formEditarUsuario");

  if (btnCerrarModalEditar) {
    btnCerrarModalEditar.addEventListener("click", () => {
      modalEditar.classList.add("oculto");
      formEditar.reset();
      limpiarErroresEdicion();
    });
  }

  if (formEditar) {
    formEditar.addEventListener("submit", function (e) {
      e.preventDefault();
      actualizarUsuario();
    });
  }

  // Navegación con botones anterior y siguiente
  const btnAnterior = document.getElementById("btnAnterior");
  const btnSiguiente = document.getElementById("btnSiguiente");

  btnAnterior?.addEventListener("click", () => {
    cambiarSeleccion(-1);
  });
  btnSiguiente?.addEventListener("click", () => {
    cambiarSeleccion(1);
  });

  const inputBusquedaGlobal = document.getElementById("busquedaGlobalUsuarios");
  if (inputBusquedaGlobal) {
    inputBusquedaGlobal.addEventListener("input", function () {
      textoBusquedaGlobalUsuarios = this.value.trim().toLowerCase();
      renderUsuarios();
    });
  }
  const btnVerTodos = document.getElementById("btnVerTodos");
  if (btnVerTodos) {
    btnVerTodos.addEventListener("click", function () {
      textoBusquedaGlobalUsuarios = "";
      document.getElementById("busquedaGlobalUsuarios").value = "";
      document.getElementById("nivel_acceso_buscar").value = "";
      document.querySelector('select[name="activo"]').value = "";
      cargarUsuarios(mostrarDatosUsuario().nro_comercio);
    });
  }

  // Navegación con teclado: flechas, Inicio, Fin, PageUp, PageDown
  document.addEventListener("keydown", (e) => {
    switch (e.key) {
      case "ArrowUp":
        e.preventDefault();
        cambiarSeleccion(-1);
        break;
      case "ArrowDown":
        e.preventDefault();
        cambiarSeleccion(1);
        break;
      case "Home":
        e.preventDefault();
        seleccionarFilaPorIndice(0);
        break;
      case "End":
        e.preventDefault();
        const filas = document.querySelectorAll("#tablaUsuarios tbody tr");
        seleccionarFilaPorIndice(filas.length - 1);
        break;
      case "PageUp":
        e.preventDefault();
        cambiarSeleccion(-10);
        break;
      case "PageDown":
        e.preventDefault();
        cambiarSeleccion(10);
        break;
    }
  });
});

// Tu función mostrarDatosUsuario sigue existiendo aquí abajo
function mostrarDatosUsuario() {
  const usuarioLogueadoRaw = localStorage.getItem("usuarioLogueado");
  const spanUsuario = document.getElementById("datos-usuario");
  if (!usuarioLogueadoRaw || !spanUsuario) return;

  let usuarioLogueado;
  try {
    usuarioLogueado = JSON.parse(usuarioLogueadoRaw);
  } catch {
    spanUsuario.innerHTML = `<span style="color:#f77"><strong>Usuario no logueado</strong></span>`;
    return;
  }

  const nivel_acceso = usuarioLogueado.nivel_acceso ?? "-";
  const apellido = usuarioLogueado.apellido ?? "";
  const nombres = usuarioLogueado.nombres ?? "";
  const nro_comercio = usuarioLogueado.nro_comercio ?? "-";

  spanUsuario.innerHTML = `
        <strong>Nivel:</strong> ${nivel_acceso} &nbsp;|&nbsp;
        <strong>Usuario:</strong> ${apellido} ${nombres} &nbsp;|&nbsp;
        <strong>Comercio:</strong> ${nro_comercio}
    `;
  return { nro_comercio, nivel_acceso };
}

window.addEventListener("DOMContentLoaded", () => {
  const user = mostrarDatosUsuario();

  const inputNroComercio = document.querySelector('input[name="nro_comercio"]');
  if (inputNroComercio) {
    inputNroComercio.style.display = "none";
  }

  if (user && user.nro_comercio !== undefined) {
    cargarUsuarios(user.nro_comercio);
  }

  const form = document.getElementById("formBuscarUsuarios");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      const user = mostrarDatosUsuario();
      if (!user || user.nro_comercio === undefined) return;

      cargarUsuarios(user.nro_comercio);
    });
  }
  // Configurar botones cerrar y submit modal editar usuario
  const modalEditar = document.getElementById("modalEditarUsuario");
  const btnCerrarModalEditar = document.getElementById(
    "btnCerrarModalEditarUsuario"
  );
  const formEditar = document.getElementById("formEditarUsuario");

  if (btnCerrarModalEditar) {
    btnCerrarModalEditar.addEventListener("click", () => {
      modalEditar.classList.add("oculto");
      formEditar.reset();
      limpiarErroresEdicion();
    });
  }

  if (formEditar) {
    formEditar.addEventListener("submit", function (e) {
      e.preventDefault();
      actualizarUsuario();
    });
  }

  const btnAnterior = document.getElementById("btnAnterior");
  const btnSiguiente = document.getElementById("btnSiguiente");

  btnAnterior?.addEventListener("click", () => {
    cambiarSeleccion(-1);
  });
  btnSiguiente?.addEventListener("click", () => {
    cambiarSeleccion(1);
  });

  document.addEventListener("keydown", (e) => {
    switch (e.key) {
      case "ArrowUp":
        e.preventDefault();
        cambiarSeleccion(-1);
        break;
      case "ArrowDown":
        e.preventDefault();
        cambiarSeleccion(1);
        break;
      case "Home":
        e.preventDefault();
        seleccionarFilaPorIndice(0);
        break;
      case "End":
        e.preventDefault();
        const filas = document.querySelectorAll("#tablaUsuarios tbody tr");
        seleccionarFilaPorIndice(filas.length - 1);
        break;
      case "PageUp":
        e.preventDefault();
        cambiarSeleccion(-10);
        break;
      case "PageDown":
        e.preventDefault();
        cambiarSeleccion(10);
        break;
    }
  });
});

async function cargarUsuarios(nro_comercio) {
  const form = document.getElementById("formBuscarUsuarios");

  const params = {
    nro_comercio,
    usuario: form?.usuario?.value.trim() || "",
    correo: form?.correo?.value.trim() || "",
    apellido: form?.apellido?.value.trim() || "",
    nivel_acceso_filtro: form
      ? document.getElementById("nivel_acceso_buscar").value
      : "",
    activo: form?.activo?.value || "",
  };

  try {
    const resp = await fetch(`${API_BASE}/api/usuariosxadm/buscar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    if (!resp.ok) throw new Error("Error al buscar usuarios");
    const usuariosObtenidos = await resp.json();
    usuarios = usuariosObtenidos;
    renderUsuarios(); // SIN parámetro
    seleccionarFilaPorIndice(0);
  } catch (error) {}
}

function ordenarUsuarios() {
  if (!columnaOrden) return;
  usuarios.sort((a, b) => {
    let valA = a[columnaOrden];
    let valB = b[columnaOrden];
    // Numéricos
    if (
      columnaOrden === "Id_usuario" ||
      columnaOrden === "nivel_acceso" ||
      columnaOrden === "activo" ||
      columnaOrden === "nro_comercio"
    ) {
      valA = Number(valA) || 0;
      valB = Number(valB) || 0;
      return (valA - valB) * sentidoOrden;
    }
    // Fechas
    if (columnaOrden === "fecha_alta") {
      valA = valA ? new Date(valA).getTime() : 0;
      valB = valB ? new Date(valB).getTime() : 0;
      return (valA - valB) * sentidoOrden;
    }
    // Textos
    valA = (valA || "").toString().toLowerCase();
    valB = (valB || "").toString().toLowerCase();
    if (valA < valB) return -1 * sentidoOrden;
    if (valA > valB) return 1 * sentidoOrden;
    return 0;
  });
}
function toggleActivo(id, estadoActual, nro_comercio) {
  const user = mostrarDatosUsuario();
  if (!user) return;

  const nuevoEstado = estadoActual === 1 ? 0 : 1;

  fetch(`${API_BASE}/api/usuariosxadm/${id}/activar`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      activo: nuevoEstado,
      nro_comercio: nro_comercio,
    }),
  })
    .then((res) => {
      if (!res.ok) throw new Error("Error al cambiar estado");
      return res.json();
    })
    .then(() => {
      cargarUsuarios(user.nro_comercio);
      showNotify({
        msg: `Usuario ${
          nuevoEstado === 1 ? "activado" : "desactivado"
        } correctamente`,
        type: "success",
      });
    })
    .catch((err) => {
      showNotify({
        msg: "Error al cambiar estado: " + err.message,
        type: "error",
      });
    });
}

// ... (todo igual, solo este cambio en el manejo del modal de edición)
function editarUsuario(id, nro_comercio) {
  const modalEditar = document.getElementById("modalEditarUsuario");
  const formEditar = document.getElementById("formEditarUsuario");
  limpiarErroresEdicion();

  const user = mostrarDatosUsuario();
  if (!user) {
    showNotify({ msg: "Usuario no logueado", type: "error" });
    return;
  }

  fetch(`${API_BASE}/api/usuariosxadm/buscar`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      Id_usuario: id,
      nro_comercio: nro_comercio,
    }),
  })
    .then((res) => {
      if (!res.ok) throw new Error("Error al obtener datos del usuario");
      return res.json();
    })
    .then((data) => {
      if (!data || data.length === 0) throw new Error("Usuario no encontrado");

      const usuario = data[0];
      formEditar.edit_Id_usuario.value = usuario.Id_usuario ?? "";
      formEditar.edit_apellido.value = usuario.apellido ?? "";
      formEditar.edit_nombres.value = usuario.nombres ?? "";
      formEditar.edit_correo.value = usuario.correo ?? "";
      formEditar.edit_usuario.value = usuario.usuario ?? "";
      formEditar.edit_nivel_acceso.value = usuario.nivel_acceso ?? "";
      formEditar.edit_activo.value = usuario.activo ?? "";
      formEditar.edit_nro_comercio.value = usuario.nro_comercio ?? "";
      formEditar.edit_nro_comercio.readOnly = true;
      formEditar.edit_fecha_alta.value = usuario.fecha_alta
        ? new Date(usuario.fecha_alta).toISOString().slice(0, 10)
        : "";

      // MOSTRAR MODAL Y HACER FOCO EN EL INPUT
      modalEditar.classList.remove("oculto");
      setTimeout(() => {
        const inputApellido = document.getElementById("edit_apellido");
        if (inputApellido) inputApellido.focus();
      }, 120);
    })
    .catch((err) => {
      showNotify({
        msg: "Error al cargar usuario: " + err.message,
        type: "error",
      });
    });
}

function limpiarErroresEdicion() {
  const errorSpans = document.querySelectorAll(
    "#formEditarUsuario .input-error"
  );
  errorSpans.forEach((span) => (span.textContent = ""));
}

function validarFormularioEdicion() {
  const formEditar = document.getElementById("formEditarUsuario");
  let valid = true;

  limpiarErroresEdicion();

  if (!formEditar.edit_apellido.value.trim()) {
    document.getElementById("err_apellido").textContent =
      "Apellido es obligatorio";
    valid = false;
  }
  if (!formEditar.edit_nombres.value.trim()) {
    document.getElementById("err_nombres").textContent =
      "Nombres son obligatorios";
    valid = false;
  }
  if (!formEditar.edit_correo.value.trim()) {
    document.getElementById("err_correo").textContent = "Correo es obligatorio";
    valid = false;
  } else {
    const re = /\S+@\S+\.\S+/;
    if (!re.test(formEditar.edit_correo.value.trim())) {
      document.getElementById("err_correo").textContent = "Correo no válido";
      valid = false;
    }
  }
  if (!formEditar.edit_usuario.value.trim()) {
    document.getElementById("err_usuario").textContent =
      "Usuario es obligatorio";
    valid = false;
  }
  if (formEditar.edit_nivel_acceso.value === "") {
    document.getElementById("err_nivel_acceso").textContent =
      "Seleccione nivel de acceso";
    valid = false;
  }
  if (formEditar.edit_activo.value === "") {
    document.getElementById("err_activo").textContent =
      "Seleccione estado activo";
    valid = false;
  }
  if (!formEditar.edit_nro_comercio.value.trim()) {
    document.getElementById("err_nro_comercio").textContent =
      "N° Comercio es obligatorio";
    valid = false;
  }
  if (!formEditar.edit_fecha_alta.value.trim()) {
    document.getElementById("err_fecha_alta").textContent =
      "Fecha de alta es obligatoria";
    valid = false;
  }

  return valid;
}
function actualizarUsuario() {
  if (!validarFormularioEdicion()) return;

  const formEditar = document.getElementById("formEditarUsuario");
  const id = formEditar.edit_Id_usuario.value;
  const datos = {
    apellido: formEditar.edit_apellido.value.trim(),
    nombres: formEditar.edit_nombres.value.trim(),
    correo: formEditar.edit_correo.value.trim(),
    usuario: formEditar.edit_usuario.value.trim(),
    nivel_acceso: formEditar.edit_nivel_acceso.value,
    activo: formEditar.edit_activo.value,
    nro_comercio: formEditar.edit_nro_comercio.value,
    fecha_alta: formEditar.edit_fecha_alta.value,
  };

  fetch(`${API_BASE}/api/usuariosxadm/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos),
  })
    .then((res) => {
      if (!res.ok) throw new Error("Error al actualizar usuario");
      return res.json();
    })
    .then(() => {
      showNotify({ msg: "Usuario actualizado correctamente", type: "success" });
      document.getElementById("modalEditarUsuario").classList.add("oculto");
      cargarUsuarios(datos.nro_comercio);
    })
    .catch((err) => {
      showNotify({
        msg: "Error al actualizar usuario: " + err.message,
        type: "error",
      });
    });
}

function borrarUsuario(id, nro_comercio) {
  const user = mostrarDatosUsuario();
  if (!user) return;

  const modalConfirmar = document.getElementById("modalConfirmarBorrar");
  if (!modalConfirmar) {
    if (!confirm("¿Seguro que desea borrar este usuario?")) return;
    procederBorrar(id, nro_comercio);
    return;
  }
  modalConfirmar.classList.remove("oculto");

  const btnConfirmar = document.getElementById("btnConfirmarBorrar");
  const btnCancelar = document.getElementById("btnCancelarBorrar");

  function limpiarEventos() {
    btnConfirmar.removeEventListener("click", onConfirmar);
    btnCancelar.removeEventListener("click", onCancelar);
  }

  function onConfirmar() {
    limpiarEventos();
    modalConfirmar.classList.add("oculto");
    procederBorrar(id, nro_comercio);
  }

  function onCancelar() {
    limpiarEventos();
    modalConfirmar.classList.add("oculto");
  }

  btnConfirmar.addEventListener("click", onConfirmar);
  btnCancelar.addEventListener("click", onCancelar);
}
function procederBorrar(id, nro_comercio) {
  fetch(`${API_BASE}/api/usuariosxadm/${id}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      nro_comercio: nro_comercio,
    }),
  })
    .then((res) => {
      if (!res.ok) throw new Error("Error al borrar usuario");
      return res.json();
    })
    .then(() => {
      cargarUsuarios(nro_comercio);
      showNotify({ msg: "Usuario borrado correctamente", type: "success" });
    })
    .catch((err) => {
      showNotify({
        msg: "Error al borrar usuario: " + err.message,
        type: "error",
      });
    });
}

function renderUsuarios() {
  ordenarUsuarios();
  const tbody = document.querySelector("#tablaUsuarios tbody");
  tbody.innerHTML = "";
  let lista = usuarios;

  // --- Filtrado universal ---
  if (textoBusquedaGlobalUsuarios && textoBusquedaGlobalUsuarios.length > 0) {
    const q = textoBusquedaGlobalUsuarios;
    lista = lista.filter(
      (usuario) =>
        (usuario.usuario && usuario.usuario.toLowerCase().includes(q)) ||
        (usuario.correo && usuario.correo.toLowerCase().includes(q)) ||
        (usuario.apellido && usuario.apellido.toLowerCase().includes(q))
    );
  }
  // ...el resto del render igual pero usar "lista.forEach"...
  lista.forEach((usuario) => {
    const activo = usuario.activo === 1 ? 1 : 0;
    const iconoActivo = activo === 1 ? "✔️" : "❌";

    const tr = document.createElement("tr");
    tr.innerHTML = `
            <td>${usuario.Id_usuario ?? ""}</td>
            <td>${usuario.apellido ?? ""}</td>
            <td>${usuario.nombres ?? ""}</td>
            <td>${usuario.correo ?? ""}</td>
            <td>${usuario.usuario ?? ""}</td>
            <td>${usuario.nivel_acceso ?? ""}</td>
            <td>${activo}</td>
            <td>${usuario.nro_comercio ?? ""}</td>
            <td>${
              usuario.fecha_alta
                ? new Date(usuario.fecha_alta).toLocaleDateString()
                : ""
            }</td>
            <td>
                <button class="btn-accion btn-activar ${
                  activo === 1 ? "activo" : "inactivo"
                }" title="Activar/Desactivar usuario" onclick="toggleActivo(${
      usuario.Id_usuario
    }, ${activo}, '${usuario.nro_comercio ?? ""}')">${iconoActivo}</button>
                <button class="btn-accion btn-editar" title="Editar usuario" onclick="editarUsuario(${
                  usuario.Id_usuario
                }, '${usuario.nro_comercio ?? ""}')">✏️</button>
                <button class="btn-accion btn-borrar" title="Borrar usuario" onclick="borrarUsuario(${
                  usuario.Id_usuario
                }, '${usuario.nro_comercio ?? ""}')">🗑️</button>
            </td>
        `;
    tbody.appendChild(tr);
  });
}

function cambiarSeleccion(direccion) {
  const filas = document.querySelectorAll("#tablaUsuarios tbody tr");
  if (filas.length === 0) return;

  let indexActual = -1;
  filas.forEach((fila, i) => {
    if (fila.classList.contains("selected")) {
      indexActual = i;
    }
  });

  if (indexActual === -1) {
    seleccionarFilaPorIndice(0);
    return;
  }

  let nuevoIndex = indexActual + direccion;
  if (nuevoIndex < 0) nuevoIndex = 0;
  if (nuevoIndex >= filas.length) nuevoIndex = filas.length - 1;

  seleccionarFilaPorIndice(nuevoIndex);
}

function seleccionarFilaPorIndice(indice) {
  const filas = document.querySelectorAll("#tablaUsuarios tbody tr");
  if (filas.length === 0) return;

  filas.forEach((fila) => fila.classList.remove("selected"));
  if (indice >= 0 && indice < filas.length) {
    filas[indice].classList.add("selected");
    filas[indice].scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
}

function mostrarMensaje(texto, tipo = "info") {
  const modal = document.getElementById("modalMensaje");
  const mensajeTexto = document.getElementById("mensajeTexto");
  const cerrarModalBtn = document.getElementById("cerrarModal");

  if (!modal || !mensajeTexto || !cerrarModalBtn) {
    alert(texto);
    return;
  }

  let color = "#333";
  if (tipo === "error") color = "#f44336";
  else if (tipo === "success") color = "#4caf50";
  else if (tipo === "warning") color = "#ff9800";

  mensajeTexto.textContent = texto;
  mensajeTexto.style.color = color;
  modal.classList.remove("oculto");

  cerrarModalBtn.onclick = () => {
    modal.classList.add("oculto");
  };
  modal.onclick = (e) => {
    if (e.target === modal) {
      modal.classList.add("oculto");
    }
  };
}
// Activar el click en los th para ordenar
document.addEventListener("DOMContentLoaded", function () {
  document
    .querySelectorAll("#tablaUsuarios thead th[data-campo]")
    .forEach((th) => {
      th.style.cursor = "pointer";
      // Agregar flechita visual si no existe
      if (!th.querySelector(".flecha-orden")) {
        th.innerHTML += `<span class="flecha-orden"></span>`;
      }
      th.addEventListener("click", function () {
        const campo = th.getAttribute("data-campo");
        if (columnaOrden === campo) {
          sentidoOrden *= -1; // alterna asc/desc
        } else {
          columnaOrden = campo;
          sentidoOrden = 1; // por defecto ascendente
        }
        renderUsuarios();
        mostrarFlechitas();
      });
    });
});

function mostrarFlechitas() {
  document
    .querySelectorAll("#tablaUsuarios thead th[data-campo]")
    .forEach((th) => {
      const campo = th.getAttribute("data-campo");
      const span = th.querySelector(".flecha-orden");
      if (!span) return;
      if (campo === columnaOrden) {
        span.textContent = sentidoOrden === 1 ? " ▲" : " ▼";
      } else {
        span.textContent = "";
      }
    });
}
// --- ABRIR MODAL DE EDICIÓN CON ENTER ---
// Se ejecuta sólo si no hay ningún input ni textarea en foco y hay filas.
document.addEventListener("keydown", function (e) {
  if (
    document.activeElement &&
    (document.activeElement.tagName === "INPUT" ||
      document.activeElement.tagName === "SELECT" ||
      document.activeElement.tagName === "TEXTAREA" ||
      document.activeElement.isContentEditable)
  )
    return;

  if (e.key === "Enter") {
    const filas = document.querySelectorAll("#tablaUsuarios tbody tr");
    if (!filas.length) return;

    let indexActual = -1;
    filas.forEach((fila, i) => {
      if (fila.classList.contains("selected")) indexActual = i;
    });

    // Si ninguna seleccionada, seleccioná la primera
    if (indexActual === -1) {
      seleccionarFilaPorIndice(0);
      indexActual = 0;
    }

    // Buscar el usuario según la lista filtrada actual (como en renderUsuarios)
    let lista = usuarios;
    if (textoBusquedaGlobalUsuarios && textoBusquedaGlobalUsuarios.length > 0) {
      const q = textoBusquedaGlobalUsuarios;
      lista = lista.filter(
        (usuario) =>
          (usuario.usuario && usuario.usuario.toLowerCase().includes(q)) ||
          (usuario.correo && usuario.correo.toLowerCase().includes(q)) ||
          (usuario.apellido && usuario.apellido.toLowerCase().includes(q))
      );
    }

    if (indexActual >= 0 && indexActual < lista.length) {
      const usuario = lista[indexActual];
      editarUsuario(usuario.Id_usuario, usuario.nro_comercio);
      e.preventDefault();
    }
  }
});
