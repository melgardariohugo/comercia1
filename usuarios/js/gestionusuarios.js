// --- Configuración ---
const API_BASE = "http://localhost:3000";

// --- Variables globales ---
let usuarios = [];
let usuariosSinFiltrar = [];
let usuarioActual = 0;
let columnaOrden = null;
let sentidoOrden = 1;
let textoBusquedaGlobalUsuarios = "";

// --- Ordenar por columnas ---
document.addEventListener("DOMContentLoaded", function () {
  document
    .querySelectorAll("#tablaUsuarios thead th[data-campo]")
    .forEach((th) => {
      th.style.cursor = "pointer";
      th.addEventListener("click", function () {
        const campo = th.getAttribute("data-campo");
        if (columnaOrden === campo) {
          sentidoOrden *= -1; // alterna asc/desc
        } else {
          columnaOrden = campo;
          sentidoOrden = 1; // por defecto ascendente
        }
        ordenarUsuarios();
        renderTabla();
        mostrarFlechitas();
      });
    });
});

// --- Utilidad: Mensajes emergentes ---
function mostrarMensaje(texto, tipo = "info") {
  const modal = document.getElementById("modalMensaje");
  const mensajeTexto = document.getElementById("mensajeTexto");
  mensajeTexto.textContent = texto;
  mensajeTexto.style.color =
    tipo === "error" ? "#f55353" : tipo === "ok" ? "#39e971" : "#3da0f5";
  modal.classList.remove("oculto");
}
function ocultarMensaje() {
  document.getElementById("modalMensaje").classList.add("oculto");
}
document.getElementById("cerrarModal").onclick = ocultarMensaje;

// --- Al cargar página: usuario y listado ---
window.addEventListener("DOMContentLoaded", () => {
  if (typeof mostrarDatosUsuarioUniversal === "function") {
    mostrarDatosUsuarioUniversal();
  }
  document
    .getElementById("buscadorUsuarios")
    .dispatchEvent(new Event("submit"));
});

// --- Buscar usuarios (solo combos, ya NO usa los inputs removidos) ---
document
  .getElementById("buscadorUsuarios")
  .addEventListener("submit", async function (e) {
    e.preventDefault();
    const form = e.target;
    const params = {
      nivel_acceso: document.getElementById("nivel_acceso_buscar").value,
      activo: form.activo.value,
      nro_comercio: form.nro_comercio.value.trim(),
    };
    try {
      const resp = await fetch(`${API_BASE}/api/usuarios/buscar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });
      if (!resp.ok) throw new Error("No se pudo buscar usuarios");
      usuarios = await resp.json();
      usuariosSinFiltrar = [...usuarios];
      usuarioActual = 0;
      columnaOrden = null;
      sentidoOrden = 1;
      textoBusquedaGlobalUsuarios = "";
      renderTabla();
      if (usuarios.length === 0)
        showNotify({
          msg: "No se encontraron usuarios que coincidan.",
          type: "info",
        });
      document.getElementById("busquedaGlobalUsuarios").value = "";
    } catch (err) {
      showNotify({
        msg: "Error al buscar usuarios: " + err.message,
        type: "error",
      });
    }
  });

// --- Botón ver todos ---
document.getElementById("btnVerTodos").onclick = function () {
  document.getElementById("buscadorUsuarios").reset();
  document.getElementById("nivel_acceso_buscar").value = "";
  document.getElementById("busquedaGlobalUsuarios").value = "";
  textoBusquedaGlobalUsuarios = "";
  document
    .getElementById("buscadorUsuarios")
    .dispatchEvent(new Event("submit"));
};

function mostrarFlechitas() {
  document.querySelectorAll("#tablaUsuarios thead th").forEach((th) => {
    const flecha = th.querySelector(".flecha-orden");
    if (flecha) {
      if (columnaOrden && th.getAttribute("data-campo") === columnaOrden) {
        flecha.textContent = sentidoOrden === 1 ? "▲" : "▼";
      } else {
        flecha.textContent = "";
      }
    }
  });
}

function ordenarUsuarios() {
  if (!columnaOrden) return;
  usuarios.sort((a, b) => {
    let valA = a[columnaOrden];
    let valB = b[columnaOrden];
    if (
      columnaOrden === "Id_usuario" ||
      columnaOrden === "nivel_acceso" ||
      columnaOrden === "nro_comercio" ||
      columnaOrden === "activo"
    ) {
      valA = Number(valA) || 0;
      valB = Number(valB) || 0;
      return (valA - valB) * sentidoOrden;
    }
    if (columnaOrden === "fecha_alta") {
      valA = valA ? new Date(valA).getTime() : 0;
      valB = valB ? new Date(valB).getTime() : 0;
      return (valA - valB) * sentidoOrden;
    }
    valA = (valA || "").toString().toLowerCase();
    valB = (valB || "").toString().toLowerCase();
    if (valA < valB) return -1 * sentidoOrden;
    if (valA > valB) return 1 * sentidoOrden;
    return 0;
  });
}

// --- Renderizar tabla usuarios ---
function renderTabla() {
  ordenarUsuarios();
  const tbody = document.querySelector("#tablaUsuarios tbody");
  tbody.innerHTML = "";
  // --- FILTRADO GLOBAL EN TIEMPO REAL ---
  let usuariosFiltrados = usuarios;
  if (textoBusquedaGlobalUsuarios.trim().length > 0) {
    const q = textoBusquedaGlobalUsuarios.trim().toLowerCase();
    usuariosFiltrados = usuarios.filter((usuario) => {
      return (
        (usuario.usuario && usuario.usuario.toLowerCase().includes(q)) ||
        (usuario.correo && usuario.correo.toLowerCase().includes(q)) ||
        (usuario.apellido && usuario.apellido.toLowerCase().includes(q)) ||
        (
          usuario.nro_comercio !== undefined &&
          usuario.nro_comercio !== null &&
          usuario.nro_comercio.toString().toLowerCase().includes(q)
        )
      );
    });
  }
  usuariosFiltrados.forEach((usuario, idx) => {
    const realIdx = usuarios.findIndex((u) => u === usuario);
    const fila = document.createElement("tr");
    fila.onclick = function () {
      usuarioActual = realIdx;
      resaltarActual();
      desplazarTablaSiEsNecesario();
    };
    fila.innerHTML = `
      <td>${usuario.Id_usuario ?? ""}</td>
      <td>${usuario.apellido ?? ""}</td>
      <td>${usuario.nombres ?? ""}</td>
      <td>${usuario.correo ?? ""}</td>
      <td>${usuario.usuario ?? ""}</td>
      <td>${usuario.nivel_acceso ?? ""}</td>
      <td>
        <button class="icon-btn ${
          usuario.activo == "1" ? "icon-activar" : "icon-desactivar"
        }"
          title="${usuario.activo == "1" ? "Activo" : "Inactivo"}"
          onclick="toggleActivo(${realIdx})">
          ${usuario.activo == "1" ? "✔️" : "❌"}
        </button>
      </td>
      <td>${usuario.nro_comercio ?? ""}</td>
      <td>${
        usuario.fecha_alta
          ? new Date(usuario.fecha_alta).toLocaleDateString()
          : ""
      }</td>
      <td>
        <button class="icon-btn icon-editar" title="Modificar" onclick="editarUsuario(${realIdx})">✏️</button>
        <button class="icon-btn icon-borrar" title="Borrar" onclick="borrarUsuario(${realIdx})">🗑️</button>
      </td>
    `;
    tbody.appendChild(fila);
  });
  resaltarActual();
  mostrarFlechitas();
}

// --- Busqueda global en tiempo real (frontend, NO backend) ---
document.addEventListener("DOMContentLoaded", function () {
  const inputBusquedaGlobal = document.getElementById("busquedaGlobalUsuarios");
  if (inputBusquedaGlobal) {
    inputBusquedaGlobal.addEventListener("input", function () {
      textoBusquedaGlobalUsuarios = this.value;
      renderTabla();
    });
  }
});

// --- Resaltar fila seleccionada ---
function resaltarActual() {
  const filas = document.querySelectorAll("#tablaUsuarios tbody tr");
  const q = textoBusquedaGlobalUsuarios.trim().toLowerCase();

  filas.forEach((f) => f.classList.remove("selected"));
  let usuariosFiltrados = usuarios.filter((usuario) => {
    return (
      (usuario.usuario && usuario.usuario.toLowerCase().includes(q)) ||
      (usuario.correo && usuario.correo.toLowerCase().includes(q)) ||
      (usuario.apellido && usuario.apellido.toLowerCase().includes(q)) ||
      (
        usuario.nro_comercio !== undefined &&
        usuario.nro_comercio !== null &&
        usuario.nro_comercio.toString().toLowerCase().includes(q)
      )
    );
  });
  const idxFiltrado = usuariosFiltrados.findIndex(
    (u) => u === usuarios[usuarioActual]
  );
  if (idxFiltrado >= 0 && filas[idxFiltrado])
    filas[idxFiltrado].classList.add("selected");
}

function getUsuariosFiltrados() {
  if (textoBusquedaGlobalUsuarios.trim().length === 0) return usuarios;
  const q = textoBusquedaGlobalUsuarios.trim().toLowerCase();
  return usuarios.filter(
    (usuario) =>
      (usuario.usuario && usuario.usuario.toLowerCase().includes(q)) ||
      (usuario.correo && usuario.correo.toLowerCase().includes(q)) ||
      (usuario.apellido && usuario.apellido.toLowerCase().includes(q)) ||
      (
        usuario.nro_comercio !== undefined &&
        usuario.nro_comercio !== null &&
        usuario.nro_comercio.toString().toLowerCase().includes(q)
      )
  );
}

// --- Navegación BOTONES ---
document.getElementById("btnAnterior").onclick = function () {
  if (usuarios.length === 0) return;
  usuarioActual = (usuarioActual - 1 + usuarios.length) % usuarios.length;
  resaltarActual();
  desplazarTablaSiEsNecesario();
};
document.getElementById("btnSiguiente").onclick = function () {
  if (usuarios.length === 0) return;
  usuarioActual = (usuarioActual + 1) % usuarios.length;
  resaltarActual();
  desplazarTablaSiEsNecesario();
};
function desplazarTablaSiEsNecesario() {
  let usuariosFiltrados = usuarios;
  if (textoBusquedaGlobalUsuarios.trim().length > 0) {
    const q = textoBusquedaGlobalUsuarios.trim().toLowerCase();
    usuariosFiltrados = usuarios.filter((usuario) => {
      return (
        (usuario.usuario && usuario.usuario.toLowerCase().includes(q)) ||
        (usuario.correo && usuario.correo.toLowerCase().includes(q)) ||
        (usuario.apellido && usuario.apellido.toLowerCase().includes(q)) ||
        (
          usuario.nro_comercio !== undefined &&
          usuario.nro_comercio !== null &&
          usuario.nro_comercio.toString().toLowerCase().includes(q)
        )
      );
    });
  }
  const idxFiltrado = usuariosFiltrados.findIndex(
    (u) => u === usuarios[usuarioActual]
  );
  const filas = document.querySelectorAll("#tablaUsuarios tbody tr");
  if (idxFiltrado >= 0 && filas[idxFiltrado])
    filas[idxFiltrado].scrollIntoView({
      block: "center",
      behavior: "smooth",
    });
}

// --- NAVEGACIÓN POR TECLADO ---
 
document.addEventListener("keydown", function (e) {
  if (
    document.activeElement &&
    (document.activeElement.tagName === "INPUT" ||
      document.activeElement.tagName === "SELECT" ||
      document.activeElement.tagName === "TEXTAREA" ||
      document.activeElement.isContentEditable)
  ) {
    return;
  }
  if (usuarios.length === 0) return;

  let cambiado = false;

  switch (e.key) {
    case "ArrowDown":
    case "ArrowRight":
      if (usuarioActual < usuarios.length - 1) {
        usuarioActual++;
        cambiado = true;
      }
      break;
    case "ArrowUp":
    case "ArrowLeft":
      if (usuarioActual > 0) {
        usuarioActual--;
        cambiado = true;
      }
      break;
    case "PageDown":
    case "AvPag":
    case "Next":
      if (usuarioActual < usuarios.length - 1) {
        usuarioActual = Math.min(usuarios.length - 1, usuarioActual + 10);
        cambiado = true;
      }
      break;
    case "PageUp":
    case "RePag":
    case "Prior":
      if (usuarioActual > 0) {
        usuarioActual = Math.max(0, usuarioActual - 10);
        cambiado = true;
      }
      break;
    case "Home":
      if (usuarioActual !== 0) {
        usuarioActual = 0;
        cambiado = true;
      }
      break;
    case "End":
      if (usuarioActual !== usuarios.length - 1) {
        usuarioActual = usuarios.length - 1;
        cambiado = true;
      }
      break;
    case "Enter":
      // Abrir modal de edición sobre usuarioActual SOLO si hay usuarios
      if (usuarios.length > 0 && usuarios[usuarioActual]) {
        editarUsuario(usuarioActual);
        e.preventDefault();
      }
      break;
  }
  if (cambiado) {
    resaltarActual();
    desplazarTablaSiEsNecesario();
    e.preventDefault();
  }
});

// --- Activar/desactivar usuario ---
window.toggleActivo = async function (idx) {
  const usuario = usuarios[idx];
  try {
    const resp = await fetch(
      `${API_BASE}/api/usuarios/${usuario.Id_usuario}/activar`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activo: usuario.activo == "1" ? 0 : 1 }),
      }
    );
    if (!resp.ok) throw new Error("No se pudo cambiar el estado");
    usuario.activo = usuario.activo == "1" ? "0" : "1";
    showNotify({ msg: "Estado actualizado.", type: "success" });
    renderTabla();
  } catch (err) {
    showNotify({
      msg: "Error al actualizar estado: " + err.message,
      type: "error",
    });
  }
};

// --- Borrar usuario (con modal visual) ---
window.borrarUsuario = function (idx) {
  usuarioAEliminar = idx;
  document.getElementById("modalConfirmarBorrar").classList.remove("oculto");
};

// Botón cancelar en modal de confirmación
document.getElementById("btnCancelarBorrar").onclick = function () {
  usuarioAEliminar = null;
  document.getElementById("modalConfirmarBorrar").classList.add("oculto");
};

// Botón confirmar borrado
let usuarioAEliminar = null;
document.getElementById("btnConfirmarBorrar").onclick = async function () {
  if (usuarioAEliminar === null) return;
  const idx = usuarioAEliminar;
  usuarioAEliminar = null;
  document.getElementById("modalConfirmarBorrar").classList.add("oculto");
  try {
    const usuario = usuarios[idx];
    const resp = await fetch(`${API_BASE}/api/usuarios/${usuario.Id_usuario}`, {
      method: "DELETE",
    });
    if (!resp.ok) throw new Error("No se pudo borrar el usuario");
    showNotify({ msg: "Usuario borrado exitosamente.", type: "success" });
    usuarios.splice(idx, 1);
    renderTabla();
  } catch (err) {
    showNotify({ msg: "Error al borrar: " + err.message, type: "error" });
  }
};

// --- Modal edición: abrir, cargar datos, cerrar ---
window.editarUsuario = function (idx) {
  const usuario = usuarios[idx];
  abrirModalEditar(usuario);
};

function abrirModalEditar(usuario) {
  document.getElementById("edit_Id_usuario").value = usuario.Id_usuario ?? "";
  document.getElementById("edit_apellido").value = usuario.apellido ?? "";
  document.getElementById("edit_nombres").value = usuario.nombres ?? "";
  document.getElementById("edit_correo").value = usuario.correo ?? "";
  document.getElementById("edit_usuario").value = usuario.usuario ?? "";
  document.getElementById("edit_nivel_acceso").value =
    usuario.nivel_acceso !== undefined && usuario.nivel_acceso !== null
      ? String(usuario.nivel_acceso)
      : "";
  document.getElementById("edit_activo").value =
    usuario.activo !== undefined && usuario.activo !== null
      ? String(usuario.activo)
      : "";
  document.getElementById("edit_nro_comercio").value =
    usuario.nro_comercio ?? "";
  document.getElementById("edit_fecha_alta").value = usuario.fecha_alta
    ? usuario.fecha_alta.split("T")[0]
    : "";
  document
    .querySelectorAll(".input-error")
    .forEach((el) => (el.textContent = ""));
  document.getElementById("modalEditarUsuario").classList.remove("oculto");
  
  // AGREGADO: Foco automático en apellido
  setTimeout(() => {
    const inputApellido = document.getElementById("edit_apellido");
    if (inputApellido) inputApellido.focus();
  }, 100);
}


// --- Cerrar modal edición ---
document.getElementById("btnCerrarModalEditarUsuario").onclick = function () {
  document.getElementById("modalEditarUsuario").classList.add("oculto");
};

// --- Validaciones para modal edición ---
function validarUsuarioEditar(data) {
  let ok = true;
  if (!data.apellido.trim()) {
    document.getElementById("err_apellido").textContent = "Requerido";
    ok = false;
  } else {
    document.getElementById("err_apellido").textContent = "";
  }
  if (!data.nombres.trim()) {
    document.getElementById("err_nombres").textContent = "Requerido";
    ok = false;
  } else {
    document.getElementById("err_nombres").textContent = "";
  }
  if (!data.correo.trim()) {
    document.getElementById("err_correo").textContent = "Requerido";
    ok = false;
  } else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(data.correo.trim())) {
    document.getElementById("err_correo").textContent = "Correo inválido";
    ok = false;
  } else {
    document.getElementById("err_correo").textContent = "";
  }
  if (!data.usuario.trim()) {
    document.getElementById("err_usuario").textContent = "Requerido";
    ok = false;
  } else if (data.usuario.trim().length < 4) {
    document.getElementById("err_usuario").textContent = "Mínimo 4 caracteres";
    ok = false;
  } else {
    document.getElementById("err_usuario").textContent = "";
  }
  if (!data.nivel_acceso) {
    document.getElementById("err_nivel_acceso").textContent =
      "Seleccione nivel";
    ok = false;
  } else {
    document.getElementById("err_nivel_acceso").textContent = "";
  }
  if (data.activo !== "1" && data.activo !== "0") {
    document.getElementById("err_activo").textContent = "Seleccione";
    ok = false;
  } else {
    document.getElementById("err_activo").textContent = "";
  }
  if (
    !data.nro_comercio ||
    isNaN(data.nro_comercio) ||
    data.nro_comercio <= 0
  ) {
    document.getElementById("err_nro_comercio").textContent =
      "Debe ser un número válido";
    ok = false;
  } else {
    document.getElementById("err_nro_comercio").textContent = "";
  }
  if (!data.fecha_alta) {
    document.getElementById("err_fecha_alta").textContent = "Falta fecha";
    ok = false;
  } else {
    document.getElementById("err_fecha_alta").textContent = "";
  }
  return ok;
}

// --- Guardar cambios (PUT) ---
document.getElementById("formEditarUsuario").onsubmit = async function (e) {
  e.preventDefault();
  const data = {
    apellido: document.getElementById("edit_apellido").value.trim(),
    nombres: document.getElementById("edit_nombres").value.trim(),
    correo: document.getElementById("edit_correo").value.trim(),
    usuario: document.getElementById("edit_usuario").value.trim(),
    nivel_acceso: document.getElementById("edit_nivel_acceso").value,
    activo: document.getElementById("edit_activo").value,
    nro_comercio: document.getElementById("edit_nro_comercio").value,
    fecha_alta: document.getElementById("edit_fecha_alta").value,
  };
  const id = document.getElementById("edit_Id_usuario").value;

  if (!validarUsuarioEditar(data)) return;

  try {
    const resp = await fetch(`${API_BASE}/api/usuarios/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!resp.ok) throw new Error("No se pudo modificar el usuario");
    showNotify({ msg: "Usuario modificado correctamente.", type: "success" });

    setTimeout(() => {
      document.getElementById("modalEditarUsuario").classList.add("oculto");
      document.getElementById("modalMensaje").classList.add("oculto");
      document
        .getElementById("buscadorUsuarios")
        .dispatchEvent(new Event("submit"));
    }, 600);
  } catch (err) {
    showNotify({ msg: "Error al modificar: " + err.message, type: "error" });
  }
};

// --- Volver al menú principal ---
document.getElementById("btnVolver").onclick = function () {
  window.location.href = "../../menu/html/menuprincipal.html";
};
