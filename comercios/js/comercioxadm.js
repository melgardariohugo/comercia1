const API_BASE = "http://localhost:3000";
let columnaOrden = null;
let sentidoOrden = 1;
let comercios = [];
let textoBusquedaGlobalComercios = "";

// MOSTRAR DATOS USUARIO EN HEADER Y COMPLETAR nro_comercio (universal)
window.addEventListener("DOMContentLoaded", () => {
  if (typeof mostrarDatosUsuarioUniversal === "function") {
    mostrarDatosUsuarioUniversal();
  }

  // Obtener usuario desde localStorage para lógica interna
  const userRaw = localStorage.getItem("usuarioLogueado");
  let user = {};
  if (userRaw) {
    try {
      user = JSON.parse(userRaw);
    } catch {
      user = {};
    }
  }

  // Si hay nro_comercio válido, cargar comercios
  if (
    user.nro_comercio !== undefined &&
    user.nro_comercio !== null &&
    user.nro_comercio !== ""
  ) {
    cargarComercios(user.nro_comercio);
  }

  // Botón volver
  const btnVolver = document.getElementById("btnVolver");
  if (btnVolver) {
    btnVolver.addEventListener("click", () => {
      window.location.href = "../../menu/html/menuprincipal.html";
    });
  }

  // Botones navegación fila
  const btnAnterior = document.getElementById("btnAnterior");
  const btnSiguiente = document.getElementById("btnSiguiente");
  btnAnterior?.addEventListener("click", () => cambiarSeleccion(-1));
  btnSiguiente?.addEventListener("click", () => cambiarSeleccion(1));

  // Evento teclado para navegación filas y scroll formulario
 window.addEventListener("keydown", (event) => {
  // Evitar conflicto si un input, select o textarea está enfocado
  if (
    document.activeElement &&
    (
      document.activeElement.tagName === "INPUT" ||
      document.activeElement.tagName === "SELECT" ||
      document.activeElement.tagName === "TEXTAREA" ||
      document.activeElement.isContentEditable
    )
  ) {
    return;
  }

  const filas = document.querySelectorAll("#tablaComercios tbody tr");
  if (!filas.length) return;

  let indexActual = -1;
  filas.forEach((fila, i) => {
    if (fila.classList.contains("selected")) indexActual = i;
  });

  switch (event.key) {
    case "ArrowUp":
      cambiarSeleccion(-1);
      event.preventDefault();
      break;
    case "ArrowDown":
      cambiarSeleccion(1);
      event.preventDefault();
      break;
    case "Home":
      seleccionarFilaPorIndice(0);
      event.preventDefault();
      break;
    case "End":
      seleccionarFilaPorIndice(filas.length - 1);
      event.preventDefault();
      break;
    case "PageUp":
      cambiarSeleccion(-5);
      event.preventDefault();
      break;
    case "PageDown":
      cambiarSeleccion(5);
      event.preventDefault();
      break;
    case "ArrowLeft":
      desplazarTabla(-150);
      event.preventDefault();
      break;
    case "ArrowRight":
      desplazarTabla(150);
      event.preventDefault();
      break;
    case "Enter":
      // >>>>>>>>>>>>>>>> ABRIR MODAL AL ENTER <<<<<<<<<<<<<<<<<
      if (indexActual >= 0) {
        // Buscamos el índice real en el array original de comercios
        const comerciosFiltrados = getComerciosFiltrados();
        const comercioFila = comerciosFiltrados[indexActual];
        if (comercioFila) {
          const idxReal = comercios.findIndex(c => c.Id_comercio === comercioFila.Id_comercio);
          if (idxReal !== -1) {
            editarComercio(idxReal);
          }
        }
      }
      event.preventDefault();
      break;
  }
});

  // Buscador universal (filtro en tiempo real)
  const inputBusquedaGlobal = document.getElementById(
    "busquedaGlobalComercios"
  );
  if (inputBusquedaGlobal) {
    inputBusquedaGlobal.addEventListener("input", function () {
      textoBusquedaGlobalComercios = this.value.trim().toLowerCase();
      renderTabla();
    });
  }
});

document.addEventListener("DOMContentLoaded", function () {
  document
    .querySelectorAll("#tablaComercios thead th[data-campo]")
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
        ordenarComercios();
        renderTabla();
        mostrarFlechitas();
      });
    });
});

// --- Cargar comercios ---
async function cargarComercios(nro_comercio) {
  const params = { nro_comercio };
  try {
    const resp = await fetch(`${API_BASE}/api/comercioxadm/buscar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    if (!resp.ok) throw new Error("No se pudo buscar comercios");
    comercios = await resp.json();
    renderTabla();
  } catch (err) {
    showNotify({ msg: "Error al buscar comercio", type: "error" });
  }
}

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
      columnaOrden === "nro_sucursal"
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

function getComerciosFiltrados() {
  let comerciosFiltrados = comercios;
  if (textoBusquedaGlobalComercios.length > 0) {
    const q = textoBusquedaGlobalComercios;
    if (/^\d+$/.test(q)) {
      // Coincidencias EXACTAS en nro_sucursal
      const coincidenSucursal = comercios.filter(
        (comercio) =>
          comercio.nro_sucursal !== undefined &&
          comercio.nro_sucursal !== null &&
          comercio.nro_sucursal.toString() === q
      );
      if (coincidenSucursal.length > 0) {
        comerciosFiltrados = coincidenSucursal;
      } else {
        // Si no hay coincidencia exacta en sucursal, buscar parcial en los otros campos
        comerciosFiltrados = comercios.filter(
          (comercio) =>
            (comercio.Cuit &&
              comercio.Cuit.toString().toLowerCase().includes(q)) ||
            (comercio.nom_comercio &&
              comercio.nom_comercio.toLowerCase().includes(q))
        );
      }
    } else {
      // Si hay letras o es mixto, buscar coincidencia parcial en los otros campos
      comerciosFiltrados = comercios.filter(
        (comercio) =>
          (comercio.Cuit &&
            comercio.Cuit.toString().toLowerCase().includes(q)) ||
          (comercio.nom_comercio &&
            comercio.nom_comercio.toLowerCase().includes(q))
      );
    }
  }
  window.__COMERCIOS_FILTRADOS__ = comerciosFiltrados; // Para modales
  return comerciosFiltrados;
}

function renderTabla() {
  ordenarComercios();
  const tbody = document.querySelector("#tablaComercios tbody");
  tbody.innerHTML = "";

  // Usar la función de filtrado global
  const comerciosFiltrados = getComerciosFiltrados();

  comerciosFiltrados.forEach((comercio, idx) => {
    // Buscar el índice REAL en el array original (para que editar/borrar funcionen)
    const idxReal = comercios.findIndex(
      (c) => c.Id_comercio === comercio.Id_comercio
    );

    const tr = document.createElement("tr");
    tr.innerHTML = `
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
        <button class="icon-btn icon-editar" title="Editar comercio" onclick="editarComercio(${idxReal})">✏️</button>
        <button class="icon-btn icon-borrar" title="Borrar comercio" onclick="borrarComercio(${idxReal})">🗑️</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
  seleccionarFilaPorIndice(0);
}

// Cambiar selección fila según dirección (negativo = arriba, positivo = abajo)
function cambiarSeleccion(direccion) {
  const filas = document.querySelectorAll("#tablaComercios tbody tr");
  if (filas.length === 0) return;

  let indexActual = -1;
  filas.forEach((fila, i) => {
    if (fila.classList.contains("selected")) indexActual = i;
  });

  let nuevoIndex = indexActual + direccion;
  if (nuevoIndex < 0) nuevoIndex = 0;
  if (nuevoIndex >= filas.length) nuevoIndex = filas.length - 1;

  seleccionarFilaPorIndice(nuevoIndex);
}

function seleccionarFilaPorIndice(indice) {
  const filas = document.querySelectorAll("#tablaComercios tbody tr");
  if (filas.length === 0) return;

  filas.forEach((fila) => fila.classList.remove("selected"));
  if (indice >= 0 && indice < filas.length) {
    filas[indice].classList.add("selected");
    filas[indice].scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
}

// Desplazar horizontalmente la tabla de resultados
function desplazarTabla(pixels) {
  const tablaContenedor = document.querySelector(".tabla-responsive");
  if (!tablaContenedor) return;
  tablaContenedor.scrollLeft += pixels;
}

// Función para mostrar mensajes (adaptar según tu implementación)
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

// === IMPLEMENTACIÓN DE FUNCIONES NUEVAS ===
async function editarComercio(idx) {
  const comercio = comercios?.[idx];
  if (!comercio) return mostrarMensaje("No se encontró el comercio", "error");

  // Llenar el formulario
  const form = document.getElementById("formEditarComercio");
  if (!form) return;

  // Rellenar todos los campos que coincidan en nombre
  for (const key in comercio) {
    const input = form.querySelector(`[name="${key}"]`);
    if (input) input.value = comercio[key] ?? "";
  }

  // Corregir campo CUIT y CUIL si no se llenó por el bucle
  if (form.querySelector('[name="cuit"]') && comercio.Cuit !== undefined) {
    form.querySelector('[name="cuit"]').value = comercio.Cuit;
  }
  if (form.querySelector('[name="cuil"]') && comercio.Cuil !== undefined) {
    form.querySelector('[name="cuil"]').value = comercio.Cuil;
  }
  if (form.querySelector('[name="fecha_alta"]') && comercio.fecha_alta) {
    let fecha = comercio.fecha_alta;
    if (fecha.length > 10) fecha = fecha.split("T")[0];
    form.querySelector('[name="fecha_alta"]').value = fecha;
  }

  // --- MOSTRAR MODAL ---
  const modal = document.getElementById("modalEditarComercio");
  if (modal) modal.classList.remove("oculto");

  // --- FOCO AUTOMÁTICO EN EL INPUT "edit_nom_comercio" ---
  setTimeout(() => {
    const input = document.getElementById("edit_nom_comercio");
    if (input) input.focus();
  }, 120);

  // Cerrar modal
  const cerrarBtn = document.getElementById("btnCerrarModalEditar");
  cerrarBtn.onclick = () => modal.classList.add("oculto");

  // Guardar cambios
  form.onsubmit = async function (e) {
    e.preventDefault();
    const formData = new FormData(form);
    const datos = {};
    formData.forEach((val, key) => (datos[key] = val));

    // Normalizar campos para el backend
    if (datos.cuit !== undefined) {
      datos.Cuit = datos.cuit;
      delete datos.cuit;
    }
    if (datos.cuil !== undefined) {
      datos.Cuil = datos.cuil;
      delete datos.cuil;
    }

    try {
      const resp = await fetch(
        `${API_BASE}/api/comercioxadm/${comercio.Id_comercio}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(datos),
        }
      );
      const resJson = await resp.json();
      if (resJson.success) {
        modal.classList.add("oculto");
        showNotify({ msg: "Comercio actualizado correctamente", type: "ok" });
        cargarComercios(comercio.nro_comercio);
      } else {
        throw new Error(resJson.error || "Error desconocido");
      }
    } catch (err) {
      showNotify({ msg: "Error al guardar", type: "error" });
    }
  };
}



async function borrarComercio(idx) {
  const comercio = comercios?.[idx];
  if (!comercio) return mostrarMensaje("No se encontró el comercio", "error");

  // Mostrar modal personalizado de confirmación
  const modal = document.getElementById("modalConfirmarBorrado");
  const texto = document.getElementById("textoConfirmacion");
  const btnSi = document.getElementById("btnConfirmarBorrado");
  const btnNo = document.getElementById("btnCancelarBorrado");

  if (!modal || !btnSi || !btnNo || !texto) {
    alert("Falta modal de confirmación"); // fallback
    return;
  }

  texto.textContent = "¿Seguro que desea borrar este comercio?";
  modal.classList.remove("oculto");

  // Quitar listeners anteriores
  const nuevoSi = btnSi.cloneNode(true);
  const nuevoNo = btnNo.cloneNode(true);
  btnSi.parentNode.replaceChild(nuevoSi, btnSi);
  btnNo.parentNode.replaceChild(nuevoNo, btnNo);

  nuevoNo.onclick = () => modal.classList.add("oculto");

  nuevoSi.onclick = async () => {
    modal.classList.add("oculto");
    try {
      const resp = await fetch(
        `${API_BASE}/api/comercioxadm/${comercio.Id_comercio}`,
        {
          method: "DELETE",
        }
      );
      const resJson = await resp.json();
      if (resJson.success) {
        showNotify({ msg: "Comercio eliminado correctamente", type: "ok" });
        cargarComercios(comercio.nro_comercio);
      } else {
        throw new Error(resJson.error || "Error desconocido");
      }
    } catch (err) {
      showNotify({ msg: "Error al borrar", type: "error" });
    }
  };
}

function mostrarFlechitas() {
  document
    .querySelectorAll("#tablaComercios thead th[data-campo]")
    .forEach((th) => {
      const flecha = th.querySelector(".flecha-orden");
      if (!flecha) return;
      const campo = th.getAttribute("data-campo");
      if (columnaOrden === campo) {
        flecha.textContent = sentidoOrden === 1 ? "▲" : "▼";
        flecha.style.opacity = 1;
      } else {
        flecha.textContent = "";
        flecha.style.opacity = 0.5;
      }
    });
}
