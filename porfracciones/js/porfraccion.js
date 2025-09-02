//const API_BASE = "http://localhost:3000";
const API_BASE = "http://localhost:3000/api/porfracciones";
//const API_BASE = "http://localhost:3000/api";

// --- Mostrar datos usuario en encabezado y ejecutar lógica principal ---
window.addEventListener("DOMContentLoaded", () => {
  if (typeof mostrarDatosUsuarioUniversal === "function") {
    mostrarDatosUsuarioUniversal();
  }

  const buscador = document.getElementById("buscadorUsuarios");
  if (buscador) {
    buscador.dispatchEvent(new Event("submit"));
  }

  // Solo chequeo aquí, el resto del código usará esta variable global
  const usuario = JSON.parse(localStorage.getItem("usuarioLogueado"));
  window.nro_comercio = usuario?.nro_comercio;

  // Mostrar advertencia solo si no hay nro_comercio (pero permitir el 0)
  if (window.nro_comercio == null) {
    showNotify({
      msg: "Error: no se pudo determinar el comercio del usuario",
      type: "error",
    });
    const formIva = document.getElementById("formIva");
    if (formIva) formIva.style.display = "none";
    const tablaIva = document.getElementById("tablaIva");
    if (tablaIva)
      tablaIva.innerHTML = "<tr><td colspan='2'>Error de acceso</td></tr>";
    return;
  }
});

// ------- 1. Manejo inicial y referencias ----------
const form = document.getElementById("form-fraccion");
const inputNroComercio = document.getElementById("nro_comercio");
const inputNroFraccion = document.getElementById("nro_fraccion");
const inputFraccion = document.getElementById("fraccion");
const comboUnidad = document.getElementById("cod_fraccion");
const btnListar = document.getElementById("btn-listar");
const contListado = document.getElementById("listado-fracciones");

let estadoListado = false; // Para alternar Listar/Ocultar

// --- 2. Inicializar campos con nro_comercio y nro_fraccion ---
document.addEventListener("DOMContentLoaded", async () => {
  inputNroComercio.value = window.nro_comercio ?? "";
  await actualizarNroFraccion();
  inputFraccion.value = "";
  inputFraccion.focus();
});

// --- 3. Cambiar unidad: recalcula nro_fraccion y actualiza listado si está abierto ---
comboUnidad.addEventListener("change", async () => {
  await actualizarNroFraccion();
  if (estadoListado) cargarListado();
});

// --- 4. Guardar fraccion ---
// --- 4. Guardar fraccion ---
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const datos = {
    cod_fraccion: comboUnidad.value,
    nro_fraccion: Number(inputNroFraccion.value),
    fraccion: inputFraccion.value.trim(),
    nro_comercio: window.nro_comercio,
  };
  if (!datos.fraccion) {
    showNotify({ msg: "Debe ingresar la fracción.", type: "error" });
    inputFraccion.focus();
    return;
  }
  try {
    const resp = await fetch(API_BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos),
    });
    if (!resp.ok) throw await resp.text();
    showNotify({ msg: "¡Fracción guardada!", type: "success" });
    inputFraccion.value = "";
    await actualizarNroFraccion(); // <--- Solo así, sin sumar nada
    inputFraccion.focus();
    if (estadoListado) cargarListado();
  } catch (err) {
    showNotify({ msg: "Error al guardar: " + err, type: "error" });
  }
});

// --- 5. Botón Listar/Ocultar ---
btnListar.addEventListener("click", () => {
  estadoListado = !estadoListado;
  btnListar.innerHTML = estadoListado
    ? '<span class="icono-boton">&#128683;</span> Ocultar'
    : '<span class="icono-boton">&#128214;</span> Listar';
  contListado.style.display = estadoListado ? "block" : "none";
  if (estadoListado) cargarListado();
});

// --- 6. Actualiza el nro_fraccion autoincremental según unidad y comercio ---
async function actualizarNroFraccion(sumar = 0) {
  try {
    const resp = await fetch(
      `${API_BASE}/ultimo?nro_comercio=${window.nro_comercio}&cod_fraccion=${comboUnidad.value}`
    );
    const data = await resp.json();
    inputNroFraccion.value = (data.ultimo ?? 1) + sumar;
  } catch {
    inputNroFraccion.value = 1;
  }
}

// --- 7. Cargar listado de fracciones ---
async function cargarListado() {
  try {
    const resp = await fetch(
      `${API_BASE}?nro_comercio=${window.nro_comercio}&cod_fraccion=${comboUnidad.value}`
    );
    const fracciones = await resp.json();
    renderListado(fracciones);
  } catch (e) {
    contListado.innerHTML = "<div>Error al cargar el listado.</div>";
  }
}

// --- 8. Renderizar listado en tabla ---
function renderListado(fracciones) {
  if (!fracciones.length) {
    contListado.innerHTML = "<div>No hay fracciones cargadas.</div>";
    return;
  }
  let html = `<table class="tabla-fracciones"><thead>
    <tr>
      <th>N°</th>
      <th>Fracción</th>
      <th>Acciones</th>
    </tr></thead><tbody>`;
  for (const f of fracciones) {
    html += `<tr data-id="${f.id_fraccion}">
      <td>${f.nro_fraccion}</td>
      <td class="celda-fraccion">${escapeHtml(f.fraccion)}</td>
      <td>
        <button class="btn-accion btn-editar" title="Editar">&#9998;</button>
        <button class="btn-accion btn-borrar" title="Borrar">&#128465;</button>
        <button class="btn-accion btn-actualizar" title="Actualizar" style="display:none;">&#128190;</button>
      </td>
    </tr>`;
  }
  html += "</tbody></table>";
  contListado.innerHTML = html;

  // --- Navegación con teclado ---
  let rows = contListado.querySelectorAll("tbody tr");
  let selectedIdx = -1;
  if (rows.length) seleccionarFila(0);

  contListado.onkeydown = (e) => {
    if (!rows.length) return;
    if (e.key === "ArrowDown") seleccionarFila(Math.min(rows.length - 1, selectedIdx + 1));
    if (e.key === "ArrowUp") seleccionarFila(Math.max(0, selectedIdx - 1));
    if (e.key === "Home") seleccionarFila(0);
    if (e.key === "End") seleccionarFila(rows.length - 1);
  };
  contListado.tabIndex = 0;
  contListado.focus();

  function seleccionarFila(idx) {
    rows.forEach((r) => r.classList.remove("selected"));
    selectedIdx = idx;
    rows[selectedIdx]?.classList.add("selected");
    rows[selectedIdx]?.scrollIntoView({ block: "nearest" });
  }

  // --- Acciones editar/borrar/actualizar ---
  contListado.querySelectorAll(".btn-editar").forEach((btn, idx) =>
    btn.onclick = () => editarFraccion(rows[idx])
  );
  contListado.querySelectorAll(".btn-borrar").forEach((btn, idx) =>
    btn.onclick = () => borrarFraccion(rows[idx])
  );
  contListado.querySelectorAll(".btn-actualizar").forEach((btn, idx) =>
    btn.onclick = () => actualizarFraccion(rows[idx])
  );
}

// --- 9. Editar fracción en línea ---
function editarFraccion(tr) {
  const tdFraccion = tr.querySelector(".celda-fraccion");
  const original = tdFraccion.textContent;
  tdFraccion.innerHTML = `<input class="editando-fraccion" value="${escapeHtml(original)}">`;
  tr.querySelector(".btn-editar").style.display = "none";
  tr.querySelector(".btn-borrar").style.display = "none";
  tr.querySelector(".btn-actualizar").style.display = "";
  const input = tdFraccion.querySelector("input");
  input.focus();
  input.select();
}

// --- 10. Actualizar fracción ---
async function actualizarFraccion(tr) {
  const id = tr.dataset.id;
  const nuevoValor = tr.querySelector("input.editando-fraccion").value.trim();
  if (!nuevoValor) {
    showNotify({ msg: "El campo no puede estar vacío.", type: "error" });
    return;
  }
  try {
    const resp = await fetch(`${API_BASE}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fraccion: nuevoValor }),
    });
    if (!resp.ok) throw await resp.text();
    showNotify({ msg: "¡Fracción actualizada!", type: "success" });
    cargarListado();
  } catch (e) {
    showNotify({ msg: "Error al actualizar.", type: "error" });
  }
}

// --- 11. Borrar fracción ---
async function borrarFraccion(tr) {
  // Mostramos confirmación visual usando showNotify con botones
  showNotify({
    msg: `
      <div style="font-size:1.2em;margin-bottom:10px;">¿Seguro que desea eliminar la fracción?</div>
      <div style="display:flex;gap:16px;justify-content:center;">
        <button id="btn-confirmar-borrar" style="padding:6px 18px;border-radius:6px;background:#e44343;color:#fff;border:none;font-weight:bold;cursor:pointer;">Sí</button>
        <button id="btn-cancelar-borrar" style="padding:6px 18px;border-radius:6px;background:#444;color:#fff;border:none;font-weight:bold;cursor:pointer;">No</button>
      </div>
    `,
    type: "error",
    timeout: 0 // no se cierra solo, espera acción del usuario
  });

  // Handler para el botón "Sí"
  document.getElementById("btn-confirmar-borrar")?.addEventListener("click", async () => {
    const id = tr.dataset.id;
    try {
      const resp = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
      if (!resp.ok) throw await resp.text();
      showNotify({ msg: "¡Fracción eliminada!", type: "success" });
      cargarListado();
      await actualizarNroFraccion();
    } catch (e) {
      showNotify({ msg: "Error al borrar.", type: "error" });
    }
  });

  // Handler para el botón "No"
  document.getElementById("btn-cancelar-borrar")?.addEventListener("click", () => {
    // Cierra el emergente (showNotify debe tener un método para cerrar, si no, ocultalo por ID)
    document.getElementById('notify-container')?.remove();
  });
}

// --- Utilidad para escapar HTML ---
function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, s =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[s])
  );
}
