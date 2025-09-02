let API_BASE = "http://localhost:3000";

// --- Estado de filtros, orden y página ---
let filtros = {
  nro_comercio: localStorage.getItem("nro_comercio") || "",
  nro_proveedor: "",
  correo: "",
  nom_proveedor: "",
  orden_campo: "nro_proveedor",
  orden_dir: "asc",
};
let proveedores = [];
let paginaActual = 1;
const filasPorPagina = 10;

// --- Eventos iniciales ---
window.addEventListener("DOMContentLoaded", () => {
  if (typeof mostrarDatosUsuarioUniversal === "function") {
    mostrarDatosUsuarioUniversal();
  }
  //  document.getElementById('cerrarModal').onclick = ocultarMensaje;
  document.getElementById("btnVolver").onclick = function () {
    window.location.href = "proveedores.html";
  };

  document.getElementById("filtrar_nro_proveedor").oninput =
    document.getElementById("filtrar_correo").oninput =
    document.getElementById("filtrar_nombre").oninput =
      () => {
        filtros.nro_proveedor = document
          .getElementById("filtrar_nro_proveedor")
          .value.trim();
        filtros.correo = document.getElementById("filtrar_correo").value.trim();
        filtros.nom_proveedor = document
          .getElementById("filtrar_nombre")
          .value.trim();
        paginaActual = 1;
        cargarListaProveedores();
      };

  document.getElementById("filtrosProveedor").onsubmit = (e) => {
    e.preventDefault();
    filtros.nro_proveedor = document
      .getElementById("filtrar_nro_proveedor")
      .value.trim();
    filtros.correo = document.getElementById("filtrar_correo").value.trim();
    filtros.nom_proveedor = document
      .getElementById("filtrar_nombre")
      .value.trim();
    paginaActual = 1;
    cargarListaProveedores();
  };

  document.querySelectorAll("th[data-ordenar]").forEach((th) => {
    th.onclick = function () {
      const campo = this.getAttribute("data-ordenar");
      if (filtros.orden_campo === campo) {
        filtros.orden_dir = filtros.orden_dir === "asc" ? "desc" : "asc";
      } else {
        filtros.orden_campo = campo;
        filtros.orden_dir = "asc";
      }
      cargarListaProveedores();
    };
  });

  document.addEventListener("keydown", navegarTablaTeclado);
  cargarListaProveedores();
});

// --- Cargar lista de proveedores ---
async function cargarListaProveedores() {
  try {
    const resp = await fetch(`${API_BASE}/api/gestionproveedores/listar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(filtros),
    });
    proveedores = await resp.json();
    if (resp.ok) {
      mostrarTablaProveedores();
      if (proveedores.length === 0) {
        showNotify({
          msg: "No se encontraron proveedores que coincidan.",
          type: "info",
        });
      }
    } else {
      showNotify({ msg: "Error al cargar proveedores", type: "error" });
    }
  } catch (err) {
    showNotify({ msg: "Error de conexión", type: "error" });
  }
}

// --- Mostrar tabla de proveedores con animación, enlaces y paginación ---
function mostrarTablaProveedores() {
  const tbody = document.getElementById("tbodyProveedores");
  tbody.innerHTML = "";
  let ini = (paginaActual - 1) * filasPorPagina;
  let fin = Math.min(proveedores.length, ini + filasPorPagina);
 for (let i = ini; i < fin; i++) {
  const p = proveedores[i];
  const tr = document.createElement("tr");
  tr.tabIndex = 0;
  tr.setAttribute("data-index", i);
  tr.innerHTML = `
          <td>${p.nro_proveedor}</td>
          <td>${p.nom_proveedor}</td>
          <td>${
            p.web_proveedor
              ? `<a href="${p.web_proveedor}" target="_blank" class="enlace-web">${p.web_proveedor}</a>`
              : ""
          }</td>
          <td>${
            p.correo
              ? `<a href="mailto:${p.correo}" class="enlace-correo">${p.correo}</a>`
              : ""
          }</td>
          <td>${p.direccion || ""}</td>
          <td>${p.contacto || ""}</td>
          <td>${p.tel_contacto || ""}</td>
          <td>${p.fecha_alta ? p.fecha_alta.slice(0, 10) : ""}</td>
          <td>
          <div class="acciones-proveedor">
          <button class="btn-editar" title="Editar" onclick="abrirModalEditar(${
            p.Id_proveedor
          })">✏️</button>
          <button class="btn-borrar" title="Borrar" onclick="borrarProveedor(${
            p.Id_proveedor
          })">🗑️</button>
      </div>
          </td>
      `;
  tr.onfocus = () => tr.classList.add("row-focus");
  tr.onblur = () => tr.classList.remove("row-focus");
  // --- AGREGADO PARA ENTER ---
  tr.addEventListener("keydown", function(e) {
    if (e.key === "Enter") {
      window.abrirModalEditar(p.Id_proveedor);
      e.preventDefault();
      e.stopPropagation();
    }
  });
  tbody.appendChild(tr);
}

  paginacionProveedores();
}

// --- Paginación visual y teclas especiales ---
function paginacionProveedores() {
  const totalPaginas = Math.max(
    1,
    Math.ceil(proveedores.length / filasPorPagina)
  );
  const paginador = document.getElementById("paginadorProveedores");
  paginador.innerHTML = "";
  if (totalPaginas <= 1) return;
  let crearBtn = (txt, pag) => {
    let b = document.createElement("button");
    b.textContent = txt;
    b.onclick = () => {
      paginaActual = pag;
      mostrarTablaProveedores();
    };
    b.className = "btn-pag";
    if (pag === paginaActual) b.classList.add("pag-activa");
    paginador.appendChild(b);
  };
  crearBtn("«", 1);
  for (let p = 1; p <= totalPaginas; p++) {
    if (
      totalPaginas > 8 &&
      Math.abs(p - paginaActual) > 2 &&
      p > 1 &&
      p < totalPaginas
    ) {
      if (p === 2 || p === totalPaginas - 1) crearBtn("...", paginaActual);
      continue;
    }
    crearBtn(p, p);
  }
  crearBtn("»", totalPaginas);
}

// --- Navegación teclado: Inicio, Fin, AvPag, RePag, Flechas Arriba/Abajo ---
function navegarTablaTeclado(e) {
  const rows = document.querySelectorAll("#tbodyProveedores tr");
  if (!rows.length) return;
  let focusIndex = Array.from(rows).findIndex(
    (row) => row === document.activeElement
  );
  if (e.key === "ArrowDown") {
    if (focusIndex >= 0 && focusIndex < rows.length - 1)
      rows[focusIndex + 1].focus();
    else if (focusIndex === -1) rows[0].focus();
    e.preventDefault();
  }
  if (e.key === "ArrowUp") {
    if (focusIndex > 0) rows[focusIndex - 1].focus();
    e.preventDefault();
  }
  if (e.key === "PageDown") {
    if (paginaActual < Math.ceil(proveedores.length / filasPorPagina)) {
      paginaActual++;
      mostrarTablaProveedores();
      setTimeout(() => rows[0]?.focus(), 100);
    }
    e.preventDefault();
  }
  if (e.key === "PageUp") {
    if (paginaActual > 1) {
      paginaActual--;
      mostrarTablaProveedores();
      setTimeout(() => rows[0]?.focus(), 100);
    }
    e.preventDefault();
  }
  if (e.key === "Home") {
    paginaActual = 1;
    mostrarTablaProveedores();
    setTimeout(() => rows[0]?.focus(), 100);
    e.preventDefault();
  }
  if (e.key === "End") {
    paginaActual = Math.ceil(proveedores.length / filasPorPagina);
    mostrarTablaProveedores();
    setTimeout(() => rows[0]?.focus(), 100);
    e.preventDefault();
  }
}

// --- Modal editar proveedor ---
window.abrirModalEditar = async function (Id_proveedor) {
  try {
    const resp = await fetch(
      `${API_BASE}/api/gestionproveedores/${Id_proveedor}`
    );
    const p = await resp.json();
    if (!p || resp.status !== 200) {
      showNotify({ msg: "Proveedor no encontrado", type: "error" });
      return;
    }
    document.getElementById("edit_Id_proveedor").value = p.Id_proveedor;
    document.getElementById("edit_nro_comercio").value = p.nro_comercio;
    document.getElementById("edit_nro_proveedor").value = p.nro_proveedor;
    document.getElementById("edit_nom_proveedor").value = p.nom_proveedor;
    document.getElementById("edit_web_proveedor").value = p.web_proveedor;
    document.getElementById("edit_correo").value = p.correo;
    document.getElementById("edit_direccion").value = p.direccion;
    document.getElementById("edit_contacto").value = p.contacto;
    document.getElementById("edit_tel_contacto").value = p.tel_contacto;
    document.getElementById("edit_fecha_alta").value = p.fecha_alta
      ? p.fecha_alta.slice(0, 10)
      : "";
    document
      .getElementById("modalEditarProveedor")
      .classList.remove("modal-oculto");

    const nivel_acceso = localStorage.getItem("nivel_acceso");
    document.getElementById("edit_nro_comercio").readOnly =
      nivel_acceso !== "0";
    document.getElementById("edit_nro_proveedor").readOnly =
      nivel_acceso !== "0";

    document.getElementById("formEditarProveedor").onsubmit = (ev) => {
      ev.preventDefault();
      guardarEdicionProveedor();
    };

    document.getElementById("modalEditarProveedor").onclick = function (e) {
      if (e.target === this) cerrarModalEditar();
    };
    document.onkeydown = function (e) {
      if (e.key === "Escape") cerrarModalEditar();
    };

    // === FOCO EN INPUT NOM_PROVEEDOR AL ABRIR EL MODAL ===
    setTimeout(() => {
      const input = document.getElementById("edit_nom_proveedor");
      if (input) input.focus();
    }, 120);
    let intentos = 0;
    function intentarFocoProveedor() {
      const input = document.getElementById("edit_nom_proveedor");
      if (input && input.offsetParent !== null) {
        input.focus();
      } else if (intentos < 10) {
        intentos++;
        setTimeout(intentarFocoProveedor, 50);
      }
    }
    intentarFocoProveedor();

  } catch (err) {
    showNotify({ msg: "Error al obtener datos", type: "error" });
  }
};

window.cerrarModalEditar = function () {
  document.getElementById("modalEditarProveedor").classList.add("modal-oculto");
  document.onkeydown = null;
};

window.guardarEdicionProveedor = async function () {
  const Id_proveedor = document.getElementById("edit_Id_proveedor").value;
  const datos = {
    nro_comercio: document.getElementById("edit_nro_comercio").value.trim(),
    nro_proveedor: document.getElementById("edit_nro_proveedor").value.trim(),
    nom_proveedor: document.getElementById("edit_nom_proveedor").value.trim(),
    web_proveedor: document.getElementById("edit_web_proveedor").value.trim(),
    correo: document.getElementById("edit_correo").value.trim(),
    direccion: document.getElementById("edit_direccion").value.trim(),
    contacto: document.getElementById("edit_contacto").value.trim(),
    tel_contacto: document.getElementById("edit_tel_contacto").value.trim(),
    fecha_alta: document.getElementById("edit_fecha_alta").value.trim(),
    nivel_acceso: localStorage.getItem("nivel_acceso"),
  };
  // Validación simple
  if (!datos.nro_comercio || !datos.nro_proveedor || !datos.nom_proveedor) {
    document.getElementById("modalProveedorError").textContent =
      "Debe completar todos los campos obligatorios.";
    return;
  }
  try {
    const resp = await fetch(
      `${API_BASE}/api/gestionproveedores/${Id_proveedor}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos),
      }
    );
    const data = await resp.json();
    if (resp.ok && data.ok) {
      showNotify({
        msg: "Proveedor actualizado correctamente",
        type: "success",
      });
      cerrarModalEditar();
      cargarListaProveedores();
    } else {
      document.getElementById("modalProveedorError").textContent =
        data.mensaje || "No se pudo actualizar";
    }
  } catch (err) {
    document.getElementById("modalProveedorError").textContent =
      "Error de conexión";
  }
};

window.borrarProveedor = function (Id_proveedor) {
  // Modal personalizado, NO alert ni confirm
  const modal = document.getElementById("modalConfirmarBorrarProveedor");
  const btnConfirmar = document.getElementById("btnConfirmarBorrarProveedor");
  const btnCancelar = document.getElementById("btnCancelarBorrarProveedor");

  modal.classList.remove("oculto");

  // Limpiar handlers previos para evitar duplicados
  btnConfirmar.onclick = null;
  btnCancelar.onclick = null;

  // Confirmar borrado
  btnConfirmar.onclick = async function () {
    modal.classList.add("oculto");
    try {
      const resp = await fetch(
        `${API_BASE}/api/gestionproveedores/${Id_proveedor}`,
        {
          method: "DELETE",
        }
      );
      const data = await resp.json();
      if (resp.ok && data.ok) {
        showNotify({ msg: "Proveedor borrado correctamente", type: "success" });
        cargarListaProveedores();
      } else {
        showNotify({ msg: data.mensaje || "No se pudo borrar", type: "error" });
      }
    } catch (err) {
      showNotify({ msg: "Error de conexión", type: "error" });
    }
  };

  // Cancelar y cerrar
  btnCancelar.onclick = function () {
    modal.classList.add("oculto");
  };

  // Cerrar con ESC y click afuera
  function cerrarConEscOClick(e) {
    if (e.type === "keydown" && e.key === "Escape") {
      modal.classList.add("oculto");
      document.removeEventListener("keydown", cerrarConEscOClick);
    }
    if (e.type === "click" && e.target === modal) {
      modal.classList.add("oculto");
      document.removeEventListener("keydown", cerrarConEscOClick);
    }
  }
  document.addEventListener("keydown", cerrarConEscOClick);
  modal.onclick = cerrarConEscOClick;
};
