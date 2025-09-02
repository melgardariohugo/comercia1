// --- API base y datos de usuario ---
const API_BASE = "http://localhost:3000/api/gestionrubros";

let rubrosOriginales = [];
let filaActivaIndex = -1;
let listaActual = []; // Para navegación y orden
let ordenColumna = null;
let ordenDesc = true;

// --- Al cargar: mostrar usuario y rubros ---
document.addEventListener("DOMContentLoaded", () => {
  if (typeof mostrarDatosUsuarioUniversal === "function") {
    mostrarDatosUsuarioUniversal();
  }
  cargarRubros();
  document
    .getElementById("formEditarRubro")
    .addEventListener("submit", guardarEdicion);
  document
    .getElementById("busquedaRubros")
    .addEventListener("input", filtrarRubros);
});

// --- Cargar rubros desde backend ---
async function cargarRubros() {
  const user = JSON.parse(localStorage.getItem("usuarioLogueado"));
  if (!user || user.nro_comercio === undefined || user.nro_comercio === null)
    return;

  try {
    const res = await fetch(`${API_BASE}/rubros?comercio=${user.nro_comercio}`);
    const data = await res.json();
    rubrosOriginales = data;
    renderRubros(data);
  } catch (err) {
    showNotify({ msg: "Error al cargar rubros", type: "error" });
  }
}

// --- Renderizar tabla, con resaltado y eventos ---
function renderRubros(lista) {
  listaActual = lista; // Para navegación/orden
  const tbody = document.getElementById("tablaRubrosBody");
  tbody.innerHTML = "";

  lista.forEach((r, i) => {
    const dataRubro = JSON.stringify(r).replace(/'/g, "\\'");
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${r.nro_rubro}</td>
      <td>${r.cod_rubro}</td>
      <td>${r.rubro}</td>
      <td>
        <button class="btn-editar" onclick='abrirModalEditar(${dataRubro})'>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M15.232 5.232l3.536 3.536M4 20h4.586l10.95-10.95a1 1 0 000-1.414l-3.172-3.172a1 1 0 00-1.414 0L4 15.414V20z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <button class="btn-eliminar" onclick="eliminarRubro(${r.id_rubro})">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M3 6h18M8 6v14h8V6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </td>
    `;
    tr.classList.toggle("tr-activa", i === filaActivaIndex);
    tr.tabIndex = 0;
    tr.onclick = () => {
      filaActivaIndex = i;
      marcarFilaActiva();
    };
    tr.ondblclick = () => abrirModalEditar(lista[i]);
    tbody.appendChild(tr);
  });

  if (lista.length > 0) {
    if (filaActivaIndex < 0 || filaActivaIndex >= lista.length)
      filaActivaIndex = 0;
    marcarFilaActiva();
  } else {
    filaActivaIndex = -1;
  }
  agregarEventosEncabezados();
}

// --- Filtrar por texto (mantiene orden) ---
function filtrarRubros(e) {
  const valor = e.target.value.trim().toLowerCase();
  let filtrado = rubrosOriginales.filter(
    (r) =>
      r.nro_rubro.toString().includes(valor) ||
      r.cod_rubro.toLowerCase().includes(valor) ||
      r.rubro.toLowerCase().includes(valor)
  );
  if (ordenColumna) {
    filtrado = filtrado.slice().sort((a, b) => {
      let va = a[ordenColumna],
        vb = b[ordenColumna];
      if (typeof va === "string") va = va.toLowerCase();
      if (typeof vb === "string") vb = vb.toLowerCase();
      if (va < vb) return ordenDesc ? 1 : -1;
      if (va > vb) return ordenDesc ? -1 : 1;
      return 0;
    });
  }
  renderRubros(filtrado);
}

// --- Abrir modal con datos ---
function abrirModalEditar(rubro) {
  document.getElementById("edit_id_rubro").value = rubro.id_rubro;
  document.getElementById("edit_cod_rubro").value = rubro.cod_rubro;
  document.getElementById("edit_rubro").value = rubro.rubro;
  document.getElementById("modalEditarRubro").classList.remove("oculto");
   setTimeout(() => {
    const input = document.getElementById("edit_cod_rubro");
    if (input) input.focus();
  }, 100);
}

// --- Cerrar modal ---
function cerrarModalEditar() {
  document.getElementById("modalEditarRubro").classList.add("oculto");
}

// --- Guardar edición ---
async function guardarEdicion(e) {
  e.preventDefault();
  const id = document.getElementById("edit_id_rubro").value;
  const cod = document.getElementById("edit_cod_rubro").value.trim();
  const nombre = document.getElementById("edit_rubro").value.trim();

  try {
    const res = await fetch(`${API_BASE}/rubros/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cod_rubro: cod, rubro: nombre }),
    });
    if (!res.ok) throw new Error();
    showNotify({ msg: "Rubro actuaizado correctamente", type: "ok" });
    cerrarModalEditar();
    cargarRubros();
  } catch {
    showNotify({ msg: "Error al actualizar rubro", type: "error" });
  }
}

// --- Eliminar rubro (con modal) ---
let idRubroAEliminar = null;

function eliminarRubro(id) {
  idRubroAEliminar = id;
  document
    .getElementById("modalConfirmarBorrarRubro")
    .classList.remove("oculto");
}

document.getElementById("btnConfirmarBorrarRubro").onclick = async function () {
  if (!idRubroAEliminar) return;
  try {
    const res = await fetch(`${API_BASE}/rubros/${idRubroAEliminar}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error();
    showNotify({ msg: "Rubro borrado correctamente", type: "ok" });
    cargarRubros();
  } catch {
    showNotify({ msg: "Error de conexión", type: "error" });
  }
  cerrarModalBorrarRubro();
};

document.getElementById("btnCancelarBorrarRubro").onclick =
  cerrarModalBorrarRubro;

function cerrarModalBorrarRubro() {
  document.getElementById("modalConfirmarBorrarRubro").classList.add("oculto");
  idRubroAEliminar = null;
}

// --- Navegación y orden profesional ---
document.addEventListener("keydown", function (e) {
  if (
    document.querySelector("#modalEditarRubro:not(.oculto)") ||
    document.activeElement.tagName === "INPUT" ||
    document.activeElement.tagName === "SELECT" ||
    document.activeElement.tagName === "TEXTAREA"
  )
    return;

  let datos = listaActual;
  if (!datos || !datos.length) return;

  switch (e.key) {
    case "ArrowDown":
      if (filaActivaIndex < datos.length - 1) filaActivaIndex++;
      marcarFilaActiva();
      scrollFilaActiva();
      e.preventDefault();
      break;
    case "ArrowUp":
      if (filaActivaIndex > 0) filaActivaIndex--;
      marcarFilaActiva();
      scrollFilaActiva();
      e.preventDefault();
      break;
    case "Home":
      filaActivaIndex = 0;
      marcarFilaActiva();
      scrollFilaActiva();
      e.preventDefault();
      break;
    case "End":
      filaActivaIndex = datos.length - 1;
      marcarFilaActiva();
      scrollFilaActiva();
      e.preventDefault();
      break;
    case "PageDown":
      {
        let filasVisibles = Math.floor(
          document.getElementById("tablaRubrosBody").parentElement
            .clientHeight / 41
        );
        filaActivaIndex = Math.min(
          datos.length - 1,
          filaActivaIndex + filasVisibles
        );
        marcarFilaActiva();
        scrollFilaActiva();
        e.preventDefault();
      }
      break;
    case "PageUp":
      {
        let filasVisibles = Math.floor(
          document.getElementById("tablaRubrosBody").parentElement
            .clientHeight / 41
        );
        filaActivaIndex = Math.max(0, filaActivaIndex - filasVisibles);
        marcarFilaActiva();
        scrollFilaActiva();
        e.preventDefault();
      }
      break;
    case "Enter":
      if (datos[filaActivaIndex]) abrirModalEditar(datos[filaActivaIndex]);
      e.preventDefault();
      break;
  }
});

function marcarFilaActiva() {
  const filas = document.querySelectorAll("#tablaRubrosBody tr");
  filas.forEach((tr, i) => {
    tr.classList.toggle("tr-activa", i === filaActivaIndex);
  });
}

function scrollFilaActiva() {
  const filas = document.querySelectorAll("#tablaRubrosBody tr");
  if (filas[filaActivaIndex]) {
    filas[filaActivaIndex].scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }
}

// --- Ordenamiento con click en encabezado ---
function agregarEventosEncabezados() {
  const ths = document.querySelectorAll("#tablaRubros thead th");
  ths.forEach((th, idx) => {
    if (idx === ths.length - 1) return; // No ordenar columna Acciones
    th.style.cursor = "pointer";
    th.onclick = function () {
      const campos = ["nro_rubro", "cod_rubro", "rubro"];
      if (ordenColumna === campos[idx]) {
        ordenDesc = !ordenDesc;
      } else {
        ordenColumna = campos[idx];
        ordenDesc = true;
      }
      ordenarYRenderizar();
      marcarOrdenVisual(idx);
    };
  });
}
function marcarOrdenVisual(idx) {
  const ths = document.querySelectorAll("#tablaRubros thead th");
  ths.forEach((th, i) => {
    th.innerText = th.innerText.replace(/[\u25B2\u25BC]/g, "").trim();
    if (i === idx) th.innerText += ordenDesc ? " \u25BC" : " \u25B2";
  });
}
function ordenarYRenderizar() {
  let lista = listaActual.slice();
  if (ordenColumna) {
    lista = lista.slice().sort((a, b) => {
      let va = a[ordenColumna],
        vb = b[ordenColumna];
      if (typeof va === "string") va = va.toLowerCase();
      if (typeof vb === "string") vb = vb.toLowerCase();
      if (va < vb) return ordenDesc ? 1 : -1;
      if (va > vb) return ordenDesc ? -1 : 1;
      return 0;
    });
  }
  renderRubros(lista);
}
