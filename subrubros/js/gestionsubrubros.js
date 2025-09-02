const API_BASE = "http://localhost:3000";

let filaActivaIndex = -1;
let subrubros = [];
let rubros = [];
let subrubroActual = null;
let ordenColumna = null;
let ordenDesc = true;

document.addEventListener("DOMContentLoaded", async function () {
  if (typeof mostrarDatosUsuarioUniversal === "function") {
    mostrarDatosUsuarioUniversal();
  }
  await cargarRubros();
  await cargarSubrubros();
  agregarEventosEncabezados();
  document
    .getElementById("buscador-subrubros")
    .addEventListener("input", function () {
      filaActivaIndex = 0;
      renderTabla(this.value);
    });
});

// --- Cargar rubros para el combobox ---
async function cargarRubros() {
  const user = JSON.parse(localStorage.getItem("usuarioLogueado") || "{}");
  let nro_comercio = user.nro_comercio;
  try {
    const res = await fetch(
      `${API_BASE}/api/gestionsubrubros/rubros/${nro_comercio}`
    );
    rubros = await res.json();
  } catch {
    shownotify("Error al cargar rubros", "error");
    rubros = [];
  }
}

// --- Cargar subrubros ---
async function cargarSubrubros() {
  const user = JSON.parse(localStorage.getItem("usuarioLogueado") || "{}");
  let nro_comercio = user.nro_comercio;
  try {
    const res = await fetch(`${API_BASE}/api/gestionsubrubros/${nro_comercio}`);
    subrubros = await res.json();
    renderTabla();
  } catch {
    shownotify("Error al cargar subrubros", "error");
    subrubros = [];
    renderTabla();
  }
}

// --- Render tabla (con filtro y orden) ---
function renderTabla(filtro = "") {
  const tbody = document.querySelector("#tabla-subrubros tbody");
  tbody.innerHTML = "";
  let datos = subrubros;
  if (filtro) {
    filtro = filtro.toLowerCase();
    datos = datos.filter(
      (sr) =>
        (sr.nro_rubro + "").includes(filtro) ||
        (sr.cod_rubro || "").toLowerCase().includes(filtro) ||
        (sr.nro_subrubro + "").includes(filtro) ||
        (sr.cod_subrubro || "").toLowerCase().includes(filtro) ||
        (sr.subrubro || "").toLowerCase().includes(filtro)
    );
  }
  // Ordenado
  if (ordenColumna) {
    datos = datos.slice().sort((a, b) => {
      let va = a[ordenColumna],
        vb = b[ordenColumna];
      if (typeof va === "string") va = va.toLowerCase();
      if (typeof vb === "string") vb = vb.toLowerCase();
      if (va < vb) return ordenDesc ? 1 : -1;
      if (va > vb) return ordenDesc ? -1 : 1;
      return 0;
    });
  }
  datos.forEach((sr, i) => {
    let tr = document.createElement("tr");
    tr.classList.toggle("tr-activa", i === filaActivaIndex);
    tr.innerHTML = `
            <td>${sr.nro_rubro}</td>
            <td>${sr.cod_rubro}</td>
            <td>${sr.nro_subrubro}</td>
            <td>${sr.cod_subrubro}</td>
            <td>${sr.subrubro}</td>
            <td>
                <button class="icon-btn edit" title="Editar" onclick="abrirModalEditar(${sr.id_subrubro})">
                    <svg height="19" width="19" fill="none" viewBox="0 0 24 24"><path d="M16.5 3.91a2.53 2.53 0 1 1 3.58 3.58L7.13 20.44 2 22l1.56-5.13L16.5 3.91Z" stroke="#1abcff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </button>
                <button class="icon-btn delete" title="Eliminar" onclick="eliminarSubrubro(${sr.id_subrubro})">
                    <svg height="19" width="19" fill="none" viewBox="0 0 24 24"><path d="M3 6h18M9 6v12a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2V6m-4 0V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </button>
            </td>
        `;
    tr.tabIndex = 0;
    tbody.appendChild(tr);
  });

  // Si hay filas, asegura que la fila activa esté dentro del rango
  if (datos.length > 0) {
    if (filaActivaIndex < 0 || filaActivaIndex >= datos.length)
      filaActivaIndex = 0;
    marcarFilaActiva();
  } else {
    filaActivaIndex = -1;
  }
  agregarEventosEncabezados();
}

// --- Función para resaltar la fila activa ---
function marcarFilaActiva() {
  const filas = document.querySelectorAll("#tabla-subrubros tbody tr");
  filas.forEach((tr, i) => {
    tr.classList.toggle("tr-activa", i === filaActivaIndex);
    tr.onclick = () => {
      filaActivaIndex = i;
      marcarFilaActiva();
    };
    tr.ondblclick = () => {
      if (subrubrosFiltrados()[i])
        abrirModalEditar(subrubrosFiltrados()[i].id_subrubro);
    };
  });
}

// --- Ayuda: función para obtener subrubros según el filtro activo ---
function subrubrosFiltrados() {
  const filtro = document
    .getElementById("buscador-subrubros")
    .value.toLowerCase();
  return subrubros.filter(
    (sr) =>
      (sr.nro_rubro + "").includes(filtro) ||
      (sr.cod_rubro || "").toLowerCase().includes(filtro) ||
      (sr.nro_subrubro + "").includes(filtro) ||
      (sr.cod_subrubro || "").toLowerCase().includes(filtro) ||
      (sr.subrubro || "").toLowerCase().includes(filtro)
  );
}

// --- Manejo de teclado para navegación ---
document.addEventListener("keydown", function (e) {
  if (
    document.getElementById("modal-editar-subrubro").style.display === "flex" ||
    document.activeElement.tagName === "INPUT" ||
    document.activeElement.tagName === "SELECT" ||
    document.activeElement.tagName === "TEXTAREA"
  )
    return;
  let datos = subrubrosFiltrados();
  if (!datos.length) return;
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
          document.querySelector(".contenedor-tabla").clientHeight / 41
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
          document.querySelector(".contenedor-tabla").clientHeight / 41
        );
        filaActivaIndex = Math.max(0, filaActivaIndex - filasVisibles);
        marcarFilaActiva();
        scrollFilaActiva();
        e.preventDefault();
      }
      break;
    case "Enter":
      if (datos[filaActivaIndex])
        abrirModalEditar(datos[filaActivaIndex].id_subrubro);
      e.preventDefault();
      break;
  }
});

// --- Scroll para que la fila activa siempre sea visible ---
function scrollFilaActiva() {
  const filas = document.querySelectorAll("#tabla-subrubros tbody tr");
  if (filas[filaActivaIndex]) {
    filas[filaActivaIndex].scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }
}

// --- Orden: eventos en los headers ---
function agregarEventosEncabezados() {
  const ths = document.querySelectorAll("#tabla-subrubros thead th");
  ths.forEach((th, idx) => {
    if (idx === ths.length - 1) return; // No ordenar columna Acciones
    th.style.cursor = "pointer";
    th.onclick = function () {
      const campos = [
        "nro_rubro",
        "cod_rubro",
        "nro_subrubro",
        "cod_subrubro",
        "subrubro",
      ];
      if (ordenColumna === campos[idx]) {
        ordenDesc = !ordenDesc;
      } else {
        ordenColumna = campos[idx];
        ordenDesc = true;
      }
      renderTabla(document.getElementById("buscador-subrubros").value);
      marcarOrdenVisual(idx);
    };
  });
}
function marcarOrdenVisual(idx) {
  const ths = document.querySelectorAll("#tabla-subrubros thead th");
  ths.forEach((th, i) => {
    th.innerText = th.innerText.replace(/[\u25B2\u25BC]/g, "").trim();
    if (i === idx) th.innerText += ordenDesc ? " \u25BC" : " \u25B2";
  });
}

// --- Eliminar subrubro ---
async function eliminarSubrubro(id_subrubro) {
  if (!confirm("¿Seguro que desea eliminar este subrubro?")) return;
  try {
    const res = await fetch(`${API_BASE}/api/gestionsubrubros/${id_subrubro}`, {
      method: "DELETE",
    });
    const data = await res.json();
    if (data.ok) {
      shownotify("Subrubro eliminado correctamente", "ok");
      await cargarSubrubros();
    } else {
      shownotify("No se pudo eliminar el subrubro", "error");
    }
  } catch {
    shownotify("Error al eliminar subrubro", "error");
  }
}

// --- Modal editar ---
window.abrirModalEditar = function (id_subrubro) {
  console.log("LLAMADO abrirModalEditar CON:", id_subrubro);
  subrubroActual = subrubros.find((x) => x.id_subrubro == id_subrubro);
  console.log("subrubroActual:", subrubroActual);
  if (!subrubroActual) {
    alert("No se encontró el subrubro a editar");
    return;
  }

  // subrubroActual = subrubros.find((x) => Number(x.id_subrubro) === Number(id_subrubro));
  subrubroActual = subrubros.find((x) => x.id_subrubro == id_subrubro);

  if (!subrubroActual) return;
  document.getElementById("modal_nro_comercio").value =
    subrubroActual.nro_comercio;
  document.getElementById("modal_nro_rubro").value = subrubroActual.nro_rubro;
  document.getElementById("modal_cod_rubro").value = subrubroActual.cod_rubro;
  document.getElementById("modal_nro_subrubro").value =
    subrubroActual.nro_subrubro;
  document.getElementById("modal_cod_subrubro").value =
    subrubroActual.cod_subrubro;
  document.getElementById("modal_subrubro").value = subrubroActual.subrubro;

  // Combobox rubros
  let combo = document.getElementById("modal_combo_rubros");
  combo.innerHTML = "";
  for (let r of rubros) {
    let opt = document.createElement("option");
    opt.value = `${r.nro_rubro}|${r.cod_rubro}`;
    opt.textContent = `${r.nro_rubro} - ${r.cod_rubro} - ${r.rubro}`;
    if (
      r.nro_rubro == subrubroActual.nro_rubro &&
      r.cod_rubro == subrubroActual.cod_rubro
    ) {
      opt.selected = true;
    }
    combo.appendChild(opt);
  }
  combo.onchange = function () {
    let [nro_rubro, cod_rubro] = combo.value.split("|");
    document.getElementById("modal_nro_rubro").value = nro_rubro;
    document.getElementById("modal_cod_rubro").value = cod_rubro;
    setTimeout(() => document.getElementById("modal_cod_subrubro").focus(), 30);
  };

  document.getElementById("modal-editar-subrubro").style.display = "flex";
 document.getElementById("modal_combo_rubros").focus(); 
};

// --- Cerrar modal ---
document.getElementById("modal-cancelar").onclick = function () {
  document.getElementById("modal-editar-subrubro").style.display = "none";
  subrubroActual = null;
};

// --- Guardar edición ---
document.getElementById("form-editar-subrubro").onsubmit = async function (e) {
  e.preventDefault();
  if (!subrubroActual) return;
  let nro_rubro = document.getElementById("modal_nro_rubro").value;
  let cod_rubro = document.getElementById("modal_cod_rubro").value;
  let cod_subrubro = document.getElementById("modal_cod_subrubro").value.trim();
  let subrubro = document.getElementById("modal_subrubro").value.trim();

  if (!nro_rubro || !cod_rubro || !cod_subrubro || !subrubro) {
    shownotify("Todos los campos deben estar completos", "error");
    return;
  }
  try {
    const res = await fetch(
      `${API_BASE}/api/gestionsubrubros/${subrubroActual.id_subrubro}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nro_rubro, cod_rubro, cod_subrubro, subrubro }),
      }
    );
    const data = await res.json();
    if (data.ok) {
      shownotify("Subrubro editado correctamente", "ok");
      document.getElementById("modal-editar-subrubro").style.display = "none";
      await cargarSubrubros();
    } else {
      shownotify("No se pudo editar el subrubro", "error");
    }
  } catch {
    shownotify("Error al editar subrubro", "error");
  }
};

function shownotify(msg, tipo = "ok") {
  // Reemplazá por tu notify real si lo tenés, acá uso alert por defecto
  alert(msg);
}
