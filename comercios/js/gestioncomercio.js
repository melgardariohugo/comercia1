// --- autodetección de entorno ---
let API_BASE;
let tablaResponsive;

API_BASE = "http://localhost:3000";

// --- Ordenamiento al clickear encabezado ---

// ----------- Modal Universal DHM -----------
// Pone esto al principio del archivo JS:

function mostrarModalDHM({
  mensaje,
  onOk,
  okTexto = "Sí, borrar",
  cancelarTexto = "Cancelar",
}) {
  const modal = document.getElementById("dhmModal");
  document.getElementById("dhmModalMensaje").textContent = mensaje;
  const btnOk = document.getElementById("dhmModalOk");
  const btnCancelar = document.getElementById("dhmModalCancelar");
  btnOk.textContent = okTexto;
  btnCancelar.textContent = cancelarTexto;

  // Limpiar listeners viejos para evitar duplicados
  btnOk.onclick = null;
  btnCancelar.onclick = null;

  btnOk.onclick = function () {
    modal.classList.add("oculto");
    if (onOk) onOk();
  };
  btnCancelar.onclick = function () {
    modal.classList.add("oculto");
  };
  modal.classList.remove("oculto");
  
modal.classList.remove("oculto");

// Refuerzo: requestAnimationFrame e intervalo para máxima compatibilidad
requestAnimationFrame(() => {
  const inputFocus = document.getElementById("edit_nro_comercio");
  if (inputFocus) inputFocus.focus();
});
modal.classList.remove("oculto");

// Focus robusto en el input (máximo 10 intentos durante 500ms)
let intentos = 0;
function intentarFocoInput() {
  const input = document.getElementById("edit_nro_comercio");
  if (input && input.offsetParent !== null) {
    input.focus();
  } else if (intentos < 10) {
    intentos++;
    setTimeout(intentarFocoInput, 50);
  }
}
intentarFocoInput();

}

// ----------- Variables globales ----------
let comercios = [];
let comercioActual = 0;
let columnaOrden = null; // campo actual por el que se ordena
let sentidoOrden = 1; // 1 ascendente, -1 descendente
let textoBusquedaGlobal = "";

// ----------- Utilidades para mensajes emergentes --------
function mostrarMensaje(texto, tipo = "info") {
  showNotify({ msg: texto, type: tipo === "ok" ? "success" : tipo });
}
function ocultarMensaje() {
  document.getElementById("modalMensaje").classList.add("oculto");
}
document.getElementById("cerrarModal").onclick = ocultarMensaje;

// --- Ordenamiento al clickear encabezado ---

// Actualiza la visibilidad de las flechitas según scroll
function actualizarFlechitasTabla() {
  if (!tablaResponsive) return;
  const maxScroll = tablaResponsive.scrollWidth - tablaResponsive.clientWidth;
  if (maxScroll <= 2) {
    flechaIzq.classList.add("oculta");
    flechaDer.classList.add("oculta");
    return;
  }
  // Si no está al inicio, mostrar flecha izquierda
  if (tablaResponsive.scrollLeft > 3) {
    flechaIzq.classList.remove("oculta");
  } else {
    flechaIzq.classList.add("oculta");
  }
  // Si no está al final, mostrar flecha derecha
  if (tablaResponsive.scrollLeft < maxScroll - 3) {
    flechaDer.classList.remove("oculta");
  } else {
    flechaDer.classList.add("oculta");
  }
}

// Actualizar al scrollear la tabla
if (tablaResponsive) {
  tablaResponsive.addEventListener("scroll", actualizarFlechitasTabla);
  // Llamá al cargar
  setTimeout(actualizarFlechitasTabla, 500);
}
window.addEventListener("resize", actualizarFlechitasTabla);
flechaIzq = document.getElementById("flechaIzq");
flechaDer = document.getElementById("flechaDer");

// Actualiza la visibilidad de las flechitas según scroll
function actualizarFlechitasTabla() {
  if (!tablaResponsive) return;
  const maxScroll = tablaResponsive.scrollWidth - tablaResponsive.clientWidth;
  if (maxScroll <= 2) {
    flechaIzq.classList.add("oculta");
    flechaDer.classList.add("oculta");
    return;
  }
  // Si no está al inicio, mostrar flecha izquierda
  if (tablaResponsive.scrollLeft > 3) {
    flechaIzq.classList.remove("oculta");
  } else {
    flechaIzq.classList.add("oculta");
  }
  // Si no está al final, mostrar flecha derecha
  if (tablaResponsive.scrollLeft < maxScroll - 3) {
    flechaDer.classList.remove("oculta");
  } else {
    flechaDer.classList.add("oculta");
  }
}

// Actualizar al scrollear la tabla
if (tablaResponsive) {
  tablaResponsive.addEventListener("scroll", actualizarFlechitasTabla);
  // Llamá al cargar
  setTimeout(actualizarFlechitasTabla, 500);
}
window.addEventListener("resize", actualizarFlechitasTabla);
if (flechaIzq && flechaDer && tablaResponsive) {
  flechaIzq.addEventListener("click", () => {
    tablaResponsive.scrollBy({ left: -120, behavior: "smooth" });
  });
  flechaDer.addEventListener("click", () => {
    tablaResponsive.scrollBy({ left: 120, behavior: "smooth" });
  });
}

document.addEventListener("DOMContentLoaded", function () {
  // Referencias DOM
  tablaResponsive = document.querySelector(".tabla-responsive");
  flechaIzq = document.getElementById("flechaIzq");
  flechaDer = document.getElementById("flechaDer");

  // Eventos flechas
  if (flechaIzq && flechaDer && tablaResponsive) {
    flechaIzq.addEventListener("click", () => {
      tablaResponsive.scrollBy({ left: -120, behavior: "smooth" });
    });
    flechaDer.addEventListener("click", () => {
      tablaResponsive.scrollBy({ left: 120, behavior: "smooth" });
    });
    tablaResponsive.addEventListener("scroll", actualizarFlechitasTabla);
    setTimeout(actualizarFlechitasTabla, 500);
  }
  window.addEventListener("resize", actualizarFlechitasTabla);

  // Click en th para ordenar
  document
    .querySelectorAll("#tablaComercios thead th[data-campo]")
    .forEach((th) => {
      th.style.cursor = "pointer";
      th.addEventListener("click", function () {
        const campo = th.getAttribute("data-campo");
        if (columnaOrden === campo) {
          sentidoOrden *= -1;
        } else {
          columnaOrden = campo;
          sentidoOrden = 1;
        }
        ordenarComercios();
        renderTabla();
        mostrarFlechitas();
      });
    });
});





// ----------- Navegación por TECLADO (flechas, AvPág/RePág, Home/End) ----------


document.addEventListener("keydown", function (e) {
  // Si hay un input activo, no navegues
  if (
    document.activeElement &&
    (document.activeElement.tagName === "INPUT" ||
      document.activeElement.tagName === "SELECT" ||
      document.activeElement.tagName === "TEXTAREA" ||
      document.activeElement.isContentEditable)
  )
    return;

  // --- NAVEGACIÓN HORIZONTAL CON FLECHAS ---
  if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
    if (tablaResponsive) {
      const dx = e.key === "ArrowLeft" ? -120 : 120;
      tablaResponsive.scrollBy({ left: dx, behavior: "smooth" });
      e.preventDefault();
      return;
    }
  }

  // --- NAVEGACIÓN VERTICAL (SELECCIÓN DE FILAS) ---
  if (comercios.length === 0) return;

  let cambiado = false;
  switch (e.key) {
    case "ArrowDown":
      if (comercioActual < comercios.length - 1) {
        comercioActual++;
        cambiado = true;
      }
      break;
    case "ArrowUp":
      if (comercioActual > 0) {
        comercioActual--;
        cambiado = true;
      }
      break;
    case "PageDown":
    case "AvPag":
    case "Next":
      if (comercioActual < comercios.length - 1) {
        comercioActual = Math.min(comercios.length - 1, comercioActual + 10);
        cambiado = true;
      }
      break;
    case "PageUp":
    case "RePag":
    case "Prior":
      if (comercioActual > 0) {
        comercioActual = Math.max(0, comercioActual - 10);
        cambiado = true;
      }
      break;
    case "Home":
      if (comercioActual !== 0) {
        comercioActual = 0;
        cambiado = true;
      }
      break;
    case "End":
      if (comercioActual !== comercios.length - 1) {
        comercioActual = comercios.length - 1;
        cambiado = true;
      }
      break;
    case "Enter":
      // --- ACA SUMÁS EL ENTER PROFESIONAL ---
      // Solo si no está abierto el modal de edición:
      if (
        !document.getElementById("modalEditarComercio")?.classList.contains("oculto") // El modal ya está abierto
      ) break;

      if (comercios[comercioActual]) {
        editarComercio(comercioActual);
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

































// ----------- Al cargar la página, mostrar usuario y cargar comercios -----------
window.addEventListener("DOMContentLoaded", () => {
  if (typeof mostrarDatosUsuarioUniversal === "function") {
    mostrarDatosUsuarioUniversal();
  }
  document
    .getElementById("buscadorComercios")
    .dispatchEvent(new Event("submit"));
});

// ----------- Buscar comercios (AJAX) -----------
document
  .getElementById("buscadorComercios")
  .addEventListener("submit", async function (e) {
    e.preventDefault();
    const form = e.target;
    const params = {
      activo: form.activo.value,
    };
    try {
      const resp = await fetch(`${API_BASE}/api/comercios/buscar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });
      if (!resp.ok) throw new Error("No se pudo buscar comercios");
      comercios = await resp.json();
      comercioActual = 0;
      // RESETEAR ORDEN
      columnaOrden = null;
      sentidoOrden = 1;
      renderTabla();
      if (comercios.length === 0)
        mostrarMensaje("No se encontraron comercios que coincidan.", "info");
    } catch (err) {
      mostrarMensaje("Error al buscar comercios: " + err.message, "error");
    }
  });
function ordenarComercios() {
  if (!columnaOrden) return;
  comercios.sort((a, b) => {
    let valA = a[columnaOrden];
    let valB = b[columnaOrden];
    // Numéricos
    if (
      columnaOrden === "Id_comercio" ||
      columnaOrden === "nro_comercio" ||
      columnaOrden === "nro_contacto" ||
      columnaOrden === "nro_sucursal" ||
      columnaOrden === "activo"
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
function mostrarFlechitas() {
  document.querySelectorAll("#tablaComercios thead th").forEach((th) => {
    const flecha = th.querySelector(".flecha-orden");
    if (flecha) {
      if (columnaOrden && th.getAttribute("data-campo") === columnaOrden) {
        //flecha.textContent = sentidoOrden === 1 ? " ↑" : " ↓";
        flecha.textContent = sentidoOrden === 1 ? "▲" : "▼";
      } else {
        flecha.textContent = "";
      }
    }
  });
}
// ----------- Renderizar la tabla de comercios ----------
function renderTabla() {
  const tbody = document.querySelector("#tablaComercios tbody");
  tbody.innerHTML = "";

  // 1. Filtrado global EN VIVO, solo si hay texto en el input global
  let comerciosFiltrados = comercios;
  if (textoBusquedaGlobal.trim().length > 0) {
    const q = textoBusquedaGlobal.trim();
    const esCortoYNumerico = /^\d{1,2}$/.test(q);

    if (esCortoYNumerico) {
      // Filtrar SOLO por nro_sucursal
      comerciosFiltrados = comercios.filter(
        (comercio) =>
          comercio.nro_sucursal &&
          comercio.nro_sucursal.toString().toLowerCase().includes(q)
      );
    } else {
      // Filtro global (como antes)
      const qLower = q.toLowerCase();
      comerciosFiltrados = comercios.filter((comercio) => {
        return (
          (comercio.nro_sucursal &&
            comercio.nro_sucursal.toString().toLowerCase().includes(qLower)) ||
          (comercio.Cuit &&
            comercio.Cuit.toString().toLowerCase().includes(qLower)) ||
          (comercio.Cuil &&
            comercio.Cuil.toString().toLowerCase().includes(qLower)) ||
          (comercio.nom_comercio &&
            comercio.nom_comercio.toLowerCase().includes(qLower))
        );
      });
    }
  }

  comerciosFiltrados.forEach((comercio, idx) => {
    const fila = document.createElement("tr");
    // ATENCIÓN: acá el índice REAL de comercios puede no coincidir si hay filtro global
    fila.tabIndex = 0;
    fila.onclick = function () {
      // Encontrar el índice real en el array original
      const realIdx = comercios.findIndex((c) => c === comercio);
      comercioActual = realIdx;
      resaltarActual();
      desplazarTablaSiEsNecesario();
    };
    fila.innerHTML = `
            <td>${comercio.Id_comercio ?? ""}</td>
            <td>${comercio.nro_comercio ?? ""}</td>
            <td>${comercio.nom_comercio ?? ""}</td>
            <td>${comercio.razonsocial ?? ""}</td>
            <td>${comercio.Cuil ?? ""}</td>
            <td>${comercio.Cuit ?? ""}</td>
            <td>${comercio.direccion ?? ""}</td>
            <td>${comercio.localidad ?? ""}</td>
            <td>${comercio.partido ?? ""}</td>
            <td>${comercio.provincia ?? ""}</td>
            <td>${comercio.cod_postal ?? ""}</td>
            <td>${comercio.correo ?? ""}</td>
            <td>${comercio.responsable ?? ""}</td>
            <td>${comercio.nro_contacto ?? ""}</td>
            <td>${comercio.nro_sucursal ?? ""}</td>
            <td>${
              comercio.fecha_alta
                ? new Date(comercio.fecha_alta).toLocaleDateString()
                : ""
            }</td>
            <td>
                <button class="icon-btn ${
                  comercio.activo == "1" ? "icon-activar" : "icon-desactivar"
                }" 
                    title="${comercio.activo == "1" ? "Activo" : "Inactivo"}" 
                    onclick="toggleActivo(${comercios.findIndex(
                      (c) => c === comercio
                    )})">
                    ${comercio.activo == "1" ? "✔️" : "❌"}
                </button>
            </td>
            <td>
                <button class="icon-btn icon-editar" title="Modificar" onclick="editarComercio(${comercios.findIndex(
                  (c) => c === comercio
                )})">✏️</button>
                <button class="icon-btn icon-borrar" title="Borrar" onclick="borrarComercio(${comercios.findIndex(
                  (c) => c === comercio
                )})">🗑️</button>
            </td>
        `;
    tbody.appendChild(fila);
  });
  resaltarActual();
  mostrarFlechitas();
}

// ----------- Resaltar fila actual ----------
function resaltarActual() {
  const filas = document.querySelectorAll("#tablaComercios tbody tr");
  filas.forEach((f) => f.classList.remove("selected"));
  if (comercios[comercioActual] && filas[comercioActual])
    filas[comercioActual].classList.add("selected");
}

// ----------- Navegación entre comercios (botones) ----------
document.getElementById("btnAnterior").onclick = function () {
  if (comercios.length === 0) return;
  comercioActual = (comercioActual - 1 + comercios.length) % comercios.length;
  resaltarActual();
  desplazarTablaSiEsNecesario();
};
document.getElementById("btnSiguiente").onclick = function () {
  if (comercios.length === 0) return;
  comercioActual = (comercioActual + 1) % comercios.length;
  resaltarActual();
  desplazarTablaSiEsNecesario();
};

// ----------- Acciones de fila ----------
// ---- MODAL de Edición ---- (sin cambios)
window.editarComercio = function (idx) {
  const c = comercios[idx];
  document.getElementById("edit_Id_comercio").value = c.Id_comercio ?? "";
  document.getElementById("edit_nro_comercio").value = c.nro_comercio ?? "";
  document.getElementById("edit_nom_comercio").value = c.nom_comercio ?? "";
  document.getElementById("edit_razonsocial").value = c.razonsocial ?? "";
  document.getElementById("edit_Cuil").value = c.Cuil ?? "";
  document.getElementById("edit_cuit").value = c.Cuit ?? "";
  document.getElementById("edit_direccion").value = c.direccion ?? "";
  document.getElementById("edit_localidad").value = c.localidad ?? "";
  document.getElementById("edit_partido").value = c.partido ?? "";
  document.getElementById("edit_provincia").value = c.provincia ?? "";
  document.getElementById("edit_cod_postal").value = c.cod_postal ?? "";
  document.getElementById("edit_correo").value = c.correo ?? "";
  document.getElementById("edit_responsable").value = c.responsable ?? "";
  document.getElementById("edit_nro_contacto").value = c.nro_contacto ?? "";
  document.getElementById("edit_nro_sucursal").value = c.nro_sucursal ?? "";
  document.getElementById("edit_fecha_alta").value = c.fecha_alta
    ? c.fecha_alta.substring(0, 10)
    : "";
  limpiarErrores();
  document.getElementById("modalEditarComercio").classList.remove("oculto");

  // ---- FOCO ROBUSTO AL ABRIR EL MODAL ----
  let intentos = 0;
  function intentarFocoInput() {
    const input = document.getElementById("edit_nro_comercio");
    if (input && input.offsetParent !== null) {
      input.focus();
    } else if (intentos < 10) {
      intentos++;
      setTimeout(intentarFocoInput, 50);
    }
  }
  intentarFocoInput();
};

// ---- Validación dinámica del formulario ----
function limpiarErrores() {
  document
    .querySelectorAll(".input-error")
    .forEach((span) => (span.textContent = ""));
}
function mostrarError(inputId, mensaje) {
  document.getElementById("err_" + inputId).textContent = mensaje;
}

// Validación campo por campo
function validarFormularioEditar() {
  let valido = true;
  limpiarErrores();
  // nro_comercio
  const nro = document.getElementById("edit_nro_comercio").value.trim();
  if (!/^\d{1,4}$/.test(nro)) {
    mostrarError("nro_comercio", "Ingrese un N° válido");
    valido = false;
  }
  // nom_comercio
  if (!document.getElementById("edit_nom_comercio").value.trim()) {
    mostrarError("nom_comercio", "Campo obligatorio");
    valido = false;
  }
  // razonsocial
  if (!document.getElementById("edit_razonsocial").value.trim()) {
    mostrarError("razonsocial", "Campo obligatorio");
    valido = false;
  }
  // Cuil
  const cuil = document.getElementById("edit_Cuil").value.trim();
  if (!/^\d{11}$/.test(cuil)) {
    mostrarError("Cuil", "11 dígitos numéricos");
    valido = false;
  }
  // Cuit
  const cuit = document.getElementById("edit_cuit").value.trim();
  if (!/^\d{11}$/.test(cuit)) {
    mostrarError("cuit", "11 dígitos numéricos");
    valido = false;
  }
  // direccion
  if (!document.getElementById("edit_direccion").value.trim()) {
    mostrarError("direccion", "Campo obligatorio");
    valido = false;
  }
  // localidad
  if (!document.getElementById("edit_localidad").value.trim()) {
    mostrarError("localidad", "Campo obligatorio");
    valido = false;
  }
  // partido
  if (!document.getElementById("edit_partido").value.trim()) {
    mostrarError("partido", "Campo obligatorio");
    valido = false;
  }
  // provincia
  if (!document.getElementById("edit_provincia").value.trim()) {
    mostrarError("provincia", "Campo obligatorio");
    valido = false;
  }
  // cod_postal
  if (!document.getElementById("edit_cod_postal").value.trim()) {
    mostrarError("cod_postal", "Campo obligatorio");
    valido = false;
  }
  // correo
  const correo = document.getElementById("edit_correo").value.trim();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(correo)) {
    mostrarError("correo", "Correo inválido");
    valido = false;
  }
  // responsable
  if (!document.getElementById("edit_responsable").value.trim()) {
    mostrarError("responsable", "Campo obligatorio");
    valido = false;
  }
  // nro_contacto
  if (!document.getElementById("edit_nro_contacto").value.trim()) {
    mostrarError("nro_contacto", "Campo obligatorio");
    valido = false;
  }
  // nro_sucursal
  const suc = document.getElementById("edit_nro_sucursal").value.trim();
  if (!/^\d{1,2}$/.test(suc)) {
    mostrarError("nro_sucursal", "Hasta 2 dígitos");
    valido = false;
  }
  // fecha_alta
  if (!document.getElementById("edit_fecha_alta").value.trim()) {
    mostrarError("fecha_alta", "Campo obligatorio");
    valido = false;
  }
  return valido;
}

// ---- Guardar edición de comercio ----
var formEditar = document.getElementById("formEditarComercio");
if (formEditar) {
  formEditar.onsubmit = async function (e) {
    e.preventDefault();
    if (!validarFormularioEditar()) return;

    const id = document.getElementById("edit_Id_comercio").value;
    const datos = {
      nro_comercio: document.getElementById("edit_nro_comercio").value,
      nom_comercio: document.getElementById("edit_nom_comercio").value,
      razonsocial: document.getElementById("edit_razonsocial").value,
      Cuil: document.getElementById("edit_Cuil").value,
      Cuit: document.getElementById("edit_cuit").value,
      direccion: document.getElementById("edit_direccion").value,
      localidad: document.getElementById("edit_localidad").value,
      partido: document.getElementById("edit_partido").value,
      provincia: document.getElementById("edit_provincia").value,
      cod_postal: document.getElementById("edit_cod_postal").value,
      correo: document.getElementById("edit_correo").value,
      responsable: document.getElementById("edit_responsable").value,
      nro_contacto: document.getElementById("edit_nro_contacto").value,
      nro_sucursal: document.getElementById("edit_nro_sucursal").value,
      fecha_alta: document.getElementById("edit_fecha_alta").value,
    };
    try {
      const resp = await fetch(`${API_BASE}/api/comercios/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos),
      });
      if (!resp.ok) throw new Error("No se pudo modificar el comercio");
      showNotify({ msg: "Comercio modificado correctamente.", type: "ok" });
      document.getElementById("modalEditarComercio").classList.add("oculto");
      document
        .getElementById("buscadorComercios")
        .dispatchEvent(new Event("submit"));
    } catch (err) {
      showNotify({ msg: "Comercio no modificado", type: "warning" });
    }
  };
}

// ---- Cerrar modal ----
var btnCerrarModalEditar = document.getElementById("btnCerrarModalEditar");
if (btnCerrarModalEditar) {
  btnCerrarModalEditar.onclick = function () {
    document.getElementById("modalEditarComercio").classList.add("oculto");
  };
}

// ----------- Acciones de fila -----------

// ----------- USO DEL MODAL UNIVERSAL PARA BORRADO -----------
window.borrarComercio = function (idx) {
  mostrarModalDHM({
    mensaje: "¿Seguro que desea borrar este comercio?",
    onOk: async function () {
      try {
        const resp = await fetch(
          `${API_BASE}/api/comercios/${
            comercios[idx].Id_comercio ?? comercios[idx].id
          }`,
          {
            method: "DELETE",
          }
        );
        if (!resp.ok) throw new Error("No se pudo borrar el comercio");
        comercios = await resp.json();
        showNotify({ msg: "Comercio borrado exitosamente.", type: "ok" });
        comercios.splice(idx, 1);
        renderTabla();
      } catch (err) {
        showNotify({ msg: "Error no se pudo borrado", type: "error" });
      }
    },
    okTexto: "Sí, borrar",
    cancelarTexto: "Cancelar",
  });
};

window.toggleActivo = async function (idx) {
  const comercio = comercios[idx];
  try {
    const resp = await fetch(
      `${API_BASE}/api/comercios/${
        comercio.Id_comercio ?? comercio.id
      }/activar`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activo: comercio.activo == "1" ? 0 : 1 }),
      }
    );
    if (!resp.ok) throw new Error("No se pudo cambiar el estado");
    comercio.activo = comercio.activo == "1" ? "0" : "1";
    showNotify({ msg: "Estado actualizado.", type: "ok" });
    renderTabla();
  } catch (err) {
    showNotify({ msg: "Error al actualizar estado", type: "error" });
  }
};

// ----------- Desplazar tabla para que se vea la fila seleccionada -----------
function desplazarTablaSiEsNecesario() {
  const filas = document.querySelectorAll("#tablaComercios tbody tr");
  if (filas[comercioActual])
    filas[comercioActual].scrollIntoView({
      block: "center",
      behavior: "smooth",
    });
}

// ----------- Botón volver al menú principal -----------
window.addEventListener("DOMContentLoaded", function () {
  const btnVolver = document.getElementById("btnVolver");
  if (btnVolver) {
    btnVolver.addEventListener("click", function (e) {
      e.preventDefault();
      window.location.href = "comercio.html";
    });
  } else {
    showNotify({
      msg: "NO se encontró el botón #btnVolver en el DOM",
      type: "warning",
    });
  }
});
// --- Búsqueda global en tiempo real ---
document.addEventListener("DOMContentLoaded", function () {
  const inputBusquedaGlobal = document.getElementById("busquedaGlobal");
  if (inputBusquedaGlobal) {
    inputBusquedaGlobal.addEventListener("input", function () {
      textoBusquedaGlobal = this.value;
      renderTabla();
    });
  }
});
