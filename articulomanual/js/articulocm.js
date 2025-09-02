//frontend/articulomanual/js/articulocm.js
// --- Variables globales ---
const API_BASE = "http://localhost:3000";
let nroProveedorSeleccionado = null;
let nroRubroSeleccionado = null;
let nroSubrubroSeleccionado = null;
let idIvaSeleccionado = null;
let idGananciaSeleccionada = null;
let accionActual = null;

// --- Inicio ---
window.addEventListener("DOMContentLoaded", async () => {
  if (typeof mostrarDatosUsuarioUniversal === "function") {
    mostrarDatosUsuarioUniversal();
  }
  const usuario = JSON.parse(localStorage.getItem("usuarioLogueado"));
  const nro_comercio = usuario?.nro_comercio;
  if (nro_comercio == null) {
    showNotify({
      msg: "Error: no se pudo determinar el comercio del usuario",
      type: "error",
    });
    return;
  }

  document
    .getElementById("btn-guardar-articulo")
    ?.addEventListener("click", (e) => {
      e.preventDefault(); // Previene cualquier comportamiento extraño
      console.log("Click interceptado");
    });

  //CALCULA PRECIOS
  CalculadorPrecios.init();

  // LLENA COMBOS DE PROVEEDORES, RUBROS, IVA, GANANCIAS
  await cargarProveedores(nro_comercio);
  await cargarRubros(nro_comercio);
  await cargarIvas(nro_comercio);
  await cargarGanancias(nro_comercio);
  configurarInputCodBarra();

  // Activar navegación con Enter/Escape en el formulario
  const form = document.getElementById("formulario-articulos");
  if (form && typeof window.setupFormNavigation === "function") {
    window.setupFormNavigation(form);
  }
  const comboProveedores = document.getElementById("combo-proveedores");
  if (comboProveedores) {
    comboProveedores.focus();
  }
  accionActual = 1;
});

// --- CARGA DE PROVEEDORES (placeholder incluido) ---
async function cargarProveedores(nro_comercio) {
  try {
    const resp = await fetch(
      `${API_BASE}/api/articulocm/proveedores/${nro_comercio}`
    );
    if (!resp.ok) throw new Error("Error al obtener proveedores");

    const proveedores = await resp.json();
    const combo = document.getElementById("combo-proveedores");

    combo.innerHTML =
      `<option value="" disabled selected>Proveedores</option>` +
      proveedores
        .map(
          (p) =>
            `<option value="${p.nro_proveedor}">${p.nom_proveedor}</option>`
        )
        .join("");

    nroProveedorSeleccionado = null;

    combo.addEventListener("change", () => {
      nroProveedorSeleccionado = combo.value;
    });
  } catch (err) {
    console.error("Error cargando proveedores:", err);
    showNotify({
      msg: "No se pudieron cargar los proveedores",
      type: "error",
    });
  }
}

// --- CARGA DE RUBROS (placeholder incluido) ---
async function cargarRubros(nro_comercio) {
  const combo = document.getElementById("combo-rubros");
  if (!combo) return;

  try {
    const resp = await fetch(
      `${API_BASE}/api/articulocm/rubros/${nro_comercio}`
    );
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

    const rubros = await resp.json();
    if (!Array.isArray(rubros))
      throw new Error("Formato de rubros no es array");

    combo.innerHTML =
      `<option value="" disabled selected>Rubros</option>` +
      rubros
        .map((r) => `<option value="${r.nro_rubro}">${r.rubro}</option>`)
        .join("");

    nroRubroSeleccionado = null;

    combo.addEventListener("change", () => {
      nroRubroSeleccionado = combo.value || null;

      if (!nroRubroSeleccionado) {
        const comboSub = document.getElementById("combo-subrubros");
        if (comboSub)
          comboSub.innerHTML = `<option value="" disabled selected>Subrubros</option>`;
        return;
      }

      cargarSubrubros(nro_comercio, nroRubroSeleccionado);
    });
  } catch (err) {
    console.error("Error cargando rubros:", err);
    combo.innerHTML = `<option value="" disabled selected>Rubros (error)</option>`;
    showNotify({ msg: "No se pudieron cargar los rubros", type: "error" });
  }
}

// --- CARGA DE SUBRUBROS ---
async function cargarSubrubros(nro_comercio, nro_rubro) {
  const combo = document.getElementById("combo-subrubros");
  if (!combo) return;

  if (nro_comercio == null || nro_rubro == null || nro_rubro === "") {
    combo.innerHTML = `<option value="" disabled selected>Subrubros</option>`;
    nroSubrubroSeleccionado = null;
    return;
  }

  try {
    const resp = await fetch(
      `${API_BASE}/api/articulocm/subrubro/${nro_comercio}/${nro_rubro}`
    );
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

    const subrubros = await resp.json();
    if (!Array.isArray(subrubros))
      throw new Error("Formato inválido de subrubros");

    combo.innerHTML =
      `<option value="" disabled selected>Subrubros</option>` +
      subrubros
        .map((s) => `<option value="${s.nro_subrubro}">${s.subrubro}</option>`)
        .join("");

    nroSubrubroSeleccionado = null;

    combo.onchange = null;
    combo.addEventListener("change", () => {
      nroSubrubroSeleccionado = combo.value || null;
      console.log("Subrubro seleccionado:", nroSubrubroSeleccionado);
    });
  } catch (err) {
    console.error("Error al cargar subrubros:", err);
    combo.innerHTML = `<option value="" disabled selected>Subrubros (error)</option>`;
    showNotify({ msg: "No se pudieron cargar los subrubros", type: "error" });
  }
}

// --- CARGA DE IVA ---
async function cargarIvas(nro_comercio) {
  const combo = document.getElementById("iva-articulo");
  if (!combo) return;

  try {
    const resp = await fetch(`${API_BASE}/api/articulocm/ivas/${nro_comercio}`);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

    const ivas = await resp.json();
    if (!Array.isArray(ivas))
      throw new Error("Formato inválido en respuesta de IVAs");

    combo.innerHTML =
      `<option value="" disabled selected>Iva</option>` +
      ivas
        .map(
          (iva) =>
            `<option value="${iva.valor}" data-id="${iva.id_iva}">${iva.iva}</option>`
        )
        .join("");

    idIvaSeleccionado = null;

    combo.addEventListener("change", () => {
      idIvaSeleccionado = parseFloat(combo.value);
      console.log("IVA seleccionado:", idIvaSeleccionado);
      CalculadorPrecios.init();
    });
  } catch (err) {
    console.error("Error al cargar IVAs:", err);
    combo.innerHTML = `<option value="" disabled selected>Error al cargar IVA</option>`;
    showNotify({ msg: "No se pudieron cargar los IVAs", type: "error" });
  }
}

// --- CARGA DE % GANANCIA ---
async function cargarGanancias(nro_comercio) {
  const combo = document.getElementById("por-gan-articulo");
  if (!combo) return;

  try {
    const resp = await fetch(
      `${API_BASE}/api/articulocm/ganancias/${nro_comercio}`
    );
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

    const ganancias = await resp.json();
    if (!Array.isArray(ganancias))
      throw new Error("Respuesta inválida para ganancias");

    combo.innerHTML =
      `<option value="" disabled selected>% Gcia</option>` +
      ganancias
        .map(
          (g) =>
            `<option value="${g.valor}" data-id="${g.id_ganancia}">${g.porcentaje}</option>`
        )
        .join("");

    idGananciaSeleccionada = null;

    combo.addEventListener("change", () => {
      idGananciaSeleccionada = parseFloat(combo.value);
      console.log("Ganancia seleccionada:", idGananciaSeleccionada);
      CalculadorPrecios.init();
    });
  } catch (err) {
    console.error("Error al cargar ganancias:", err);
    combo.innerHTML = `<option value="" disabled selected>Error al cargar</option>`;
    showNotify({
      msg: "No se pudieron cargar los porcentajes de ganancia",
      type: "error",
    });
  }
}

//INPUT DE CODIGO DE BARRA
function configurarInputCodBarra() {
  const inputCodBarra = document.getElementById("cod-barra");
  if (!inputCodBarra) return;

  const usuario = JSON.parse(localStorage.getItem("usuarioLogueado"));
  const nro_comercio = usuario?.nro_comercio;

  inputCodBarra.addEventListener("keydown", async (e) => {
    if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();

      let codBarra = inputCodBarra.value.trim();

      if (codBarra === "") {
        showNotify({
          msg: "Debe ingresar un código de barra",
          type: "warning",
        });
        return;
      }

      // MODO 1: ALTA NORMAL
      if (accionActual === 1) {
        const resp = await fetch(
          `${API_BASE}/api/articulocm/articulopuro/buscar/${nro_comercio}/${codBarra}`
        );
        if (resp.ok) {
          showNotify({ msg: "Código de barra ya existente", type: "error" });
          inputCodBarra.focus();
        } else if (resp.status === 404) {
          const inputCodInterno = document.getElementById("cod-interno");
          if (inputCodInterno) inputCodInterno.focus();
        }
      }
      // MODO 2: Nuevo artículo
      if (accionActual === 2) {
        const resp = await fetch(
          `${API_BASE}/api/articulocm/articulopuro/buscar/${nro_comercio}/${codBarra}`
        );
        if (resp.ok) {
          showNotify({
            msg: "Código de barra ya existente. Ingrese uno nuevo.",
            type: "error",
          });
          inputCodBarra.focus();
        } else if (resp.status === 404) {
          accionActual = 1;
          const inputCodInterno = document.getElementById("cod-interno");
          if (inputCodInterno) inputCodInterno.focus();
        }
      }
      // MODO 3: EDITAR ARTÍCULO
      if (accionActual === 3) {
        let encontrado = false;
        let intento = 0;

        while (!encontrado && intento <= 5 && codBarra.length > 0) {
          try {
            const resp = await fetch(
              `${API_BASE}/api/articulocm/articulopuro/buscar/${nro_comercio}/${codBarra}`
            );
            if (resp.ok) {
              const data = await resp.json();
              cargarFormularioConArticulo(data.articulo);
              encontrado = true;
              break;
            }
          } catch (err) {
            console.error(`Intento ${intento + 1} de búsqueda:`, err);
          }

          // Quitar último dígito y reintentar
          codBarra = codBarra.slice(0, -1);
          intento++;
        }
        if (!encontrado) {
          const camposAEliminar = [
            "cod-interno",
            "articulo",
            "unidad-articulo",
            "medida-articulo",
            "precio-costo",
            "iva-articulo",
            "precio-civa",
            "por-gan-articulo",
            "precio-venta-articulo",
          ];
          limpiarCamposPorIds(camposAEliminar);

          showNotify({
            msg: "El código de barra no existe (se intentó con varias variantes)",
            type: "error",
          });

          if (inputCodBarra) inputCodBarra.focus();
          return;
        }
      }
      // MODO 4: BORRAR ARTÍCULO
      if (accionActual === 4) {
        let encontrado = false;
        let intento = 0;
        let articuloEncontrado = null;

        while (!encontrado && intento <= 5 && codBarra.length > 0) {
          try {
            const resp = await fetch(
              `${API_BASE}/api/articulocm/articulopuro/buscar/${nro_comercio}/${codBarra}`
            );
            if (resp.ok) {
              const data = await resp.json();
              articuloEncontrado = data.articulo;
              encontrado = true;
              break;
            }
          } catch (err) {
            console.error(
              `Intento ${intento + 1} de búsqueda (modo borrar):`,
              err
            );
          }

          codBarra = codBarra.slice(0, -1); // recortar código
          intento++;
        }

        if (!encontrado || !articuloEncontrado) {
          showNotify({
            msg: "No se encontró ningún artículo para borrar",
            type: "error",
          });
          limpiarFormulario("formulario-articulos");
          inputCodBarra.focus();
          return;
        }

        cargarFormularioConArticulo(articuloEncontrado);

        showConfirmNotify({
          msg: `¿Desea borrar el artículo "<b>${articuloEncontrado.articulo}</b>"?`,
          onOk: async () => {
            try {
              const resp = await fetch(
                `${API_BASE}/api/articulocm/articulopuro/borrar`,
                {
                  method: "DELETE",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    cod_barra: articuloEncontrado.cod_barra,
                    nro_comercio: nro_comercio,
                  }),
                }
              );

              const data = await resp.json();
              if (!resp.ok || !data.ok) {
                showNotify({
                  msg: `Error al borrar: ${data.msg || "desconocido"}`,
                  type: "error",
                });
                return;
              }

              showNotify({
                msg: "Artículo borrado correctamente",
                type: "success",
              });
              limpiarFormulario("formulario-articulos");
              inputCodBarra.focus();
            } catch (err) {
              console.error("Error al borrar:", err);
              showNotify({
                msg: "No se pudo borrar el artículo",
                type: "error",
              });
            }
          },
          onCancel: () => {
            limpiarFormulario("formulario-articulos");
            inputCodBarra.focus();
          },
        });

        return;
      }
    }
  });
}

// --- FUNCIONES PARA CADA BOTÓN DE ARTÍCULO ---
// ACCION DE GUARDAR ARTICULO
async function accionGuardarArticulo() {
  if (![1, 3].includes(accionActual)) return;

  console.log("📝 Acción guardar (valor:", accionActual, ")");

  const usuario = JSON.parse(localStorage.getItem("usuarioLogueado"));
  const nro_comercio = usuario?.nro_comercio;

  const campos = {
    nro_comercio,
    nro_proveedor: nroProveedorSeleccionado,
    nom_proveedor:
      document.getElementById("combo-proveedores")?.selectedOptions[0]?.text ||
      "",
    nro_rubro: nroRubroSeleccionado,
    rubro:
      document.getElementById("combo-rubros")?.selectedOptions[0]?.text || "",
    nro_subrubro: nroSubrubroSeleccionado,
    subrubro:
      document.getElementById("combo-subrubros")?.selectedOptions[0]?.text ||
      "",
    cod_barra: document.getElementById("cod-barra")?.value.trim(),
    cod_interno: document.getElementById("cod-interno")?.value.trim(),
    articulo: document.getElementById("articulo")?.value.trim(),
    unidad: document.getElementById("unidad-articulo")?.value.trim(),
    medida: document.getElementById("medida-articulo")?.value.trim(),
    precio_costo: document.getElementById("precio-costo")?.value.trim(),
    iva: idIvaSeleccionado,
    precio_civa: document.getElementById("precio-civa")?.value.trim(),
    por_ganancia: idGananciaSeleccionada,
    precio_venta: document
      .getElementById("precio-venta-articulo")
      ?.value.trim(),
  };

  // Validación de campos
  for (const [key, value] of Object.entries(campos)) {
    if (
      value === null ||
      value === undefined ||
      value === "" ||
      (typeof value === "number" && isNaN(value))
    ) {
      showNotify({
        msg: `Falta completar el campo: ${key.replace(/_/g, " ")}`,
        type: "warning",
      });

      const campoHTML = document.querySelector(
        `#${key.replace(/_/g, "-")}, [name="${key}"]`
      );
      if (campoHTML) campoHTML.focus();

      return;
    }
  }

  // Acción según valor
  switch (accionActual) {
    case 1: // Alta
      try {
        const resp = await fetch(`${API_BASE}/api/articulocm/articulopuro/alta`,  {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(campos),
        });

        const data = await resp.json();

        if (!resp.ok || !data.ok) {
          showNotify({
            msg: `Error al guardar: ${data.msg || "desconocido"}`,
            type: "error",
          });
          return;
        }

        showNotify({
          msg: "Artículo guardado correctamente",
          type: "success",
        });
      } catch (error) {
        console.error("Error al guardar artículo:", error);
        showNotify({
          msg: "Error inesperado al guardar el artículo",
          type: "error",
        });
      }
      break;
    
    case 3: // Edición
      try {
        const resp = await fetch(
          `${API_BASE}/api/articulocm/articulopuro/actualiza`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(campos),
          }
        );

        const data = await resp.json();

        if (!resp.ok || !data.ok) {
          showNotify({
            msg: `Error al actualizar: ${data.msg || "desconocido"}`,
            type: "error",
          });
          return;
        }

        showNotify({
          msg: "Artículo actualizado correctamente",
          type: "success",
        });
      } catch (error) {
        console.error("Error al actualizar artículo:", error);
        showNotify({
          msg: "Error inesperado al actualizar el artículo",
          type: "error",
        });
      }
      break;

    default:
      showNotify({
        msg: "Acción no válida para este botón",
        type: "warning",
      });
  }
}

//ACCION DE NUEVO ARTICULO
function accionNuevoArticulo() {
  const comboProveedores = document.getElementById("combo-proveedores");
  const comboRubros = document.getElementById("combo-rubros");
  const comboSubrubros = document.getElementById("combo-subrubros");

  // Verificación de datos cargados en los combos
  if (!comboProveedores || comboProveedores.options.length <= 1) {
    showNotify({ msg: "Faltan cargar datos", type: "warning" });
    comboProveedores?.focus();
    return;
  }

  if (!comboRubros || comboRubros.options.length <= 1) {
    showNotify({ msg: "Faltan cargar datos", type: "warning" });
    comboProveedores?.focus();
    return;
  }

  if (!comboSubrubros || comboSubrubros.options.length <= 1) {
    showNotify({ msg: "Faltan cargar datos", type: "warning" });
    comboProveedores?.focus();
    return;
  }

  console.log("🆕 Nuevo artículo");
  accionActual = 2;

  limpiarCamposPorIds([
    "cod-barra",
    "cod-interno",
    "articulo",
    "unidad-articulo",
    "medida-articulo",
    "precio-costo",
    "iva-articulo",
    "precio-civa",
    "por-gan-articulo",
    "precio-venta-articulo",
  ]);

  const inputCodBarra = document.getElementById("cod-barra");
  if (inputCodBarra) inputCodBarra.focus();
}

//ACCION EDITAR ARTICULO
function accionEditarArticulo() {
  console.log("✏️ Editar artículo");
  accionActual = 3;

  // Limpiar todo el formulario con función externa
  limpiarFormulario("formulario-articulos");

  // Reset de variables globales
  nroProveedorSeleccionado = null;
  nroRubroSeleccionado = null;
  nroSubrubroSeleccionado = null;
  idIvaSeleccionado = null;
  idGananciaSeleccionada = null;

  // Hacer foco en cod-barra
  const inputCodBarra = document.getElementById("cod-barra");
  if (inputCodBarra) inputCodBarra.focus();
}
//ACCION BORRAR ARTICULO
async function accionBorrarArticulo() {
  accionActual = 4;
  limpiarFormulario("formulario-articulos"); // Limpia todo
  document.getElementById("cod-barra")?.focus();
}

function accionLimpiarTodo() {
  console.log("🧹 Limpiar todo");
  limpiarFormulario("formulario-articulos");
  accionActual = 1;

  const comboProveedores = document.getElementById("combo-proveedores");
  if (comboProveedores) {
    comboProveedores.focus();
  }
    const contenedor = document.getElementById("listado-articulos-container");
  if (contenedor) {
    contenedor.style.display = "none"; 
    contenedor.innerHTML = "";         
  }
}

// LISTAR ARTICULOS
function formatoMoneda(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) return "";
  return n.toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
function formatoIva(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) return "";
  // Si viene 21 => "21%" | si viniera 0.21 => "21%"
  return (
    (n > 1 ? n : n * 100).toLocaleString("es-AR", {
      maximumFractionDigits: 2,
    }) + "%"
  );
}
async function accionListarArticulo() {
  console.log("📋 Listar artículos");
  accionActual = 6;

  limpiarFormulario("formulario-articulos");

  const contenedor = document.getElementById("listado-articulos-container");
  contenedor.innerHTML = "";
  contenedor.style.display = "block";

  const usuario = JSON.parse(localStorage.getItem("usuarioLogueado"));
  const nro_comercio = Number(usuario?.nro_comercio);
  if (!Number.isFinite(nro_comercio)) {
    showNotify({
      msg: "No se pudo determinar el comercio del usuario",
      type: "error",
    });
    return;
  }

  const wrapper = document.createElement("div");
  wrapper.style = "padding: 8px 6px;";

  const filaTop = document.createElement("div");
  filaTop.style =
    "display:flex; align-items:center; gap:12px; margin-bottom:10px;";

  const inputFiltro = document.createElement("input");
  inputFiltro.type = "text";
  inputFiltro.placeholder =
    "Buscar por proveedor, rubro, subrubro, cod-barra, cod-interno o artículo";
  inputFiltro.style = `
     width: 80%;
     padding: 8px 10px;
     font-size: 1em;
     background-color: #18181c;
     color: #fff;
     border: 1px solid #444;
     border-radius: 6px;
     outline: none;
  `;

  const spanCount = document.createElement("span");
  spanCount.style = "color:#9aa0a6; font-size:0.95em; white-space:nowrap;";
  spanCount.textContent = "—";

  filaTop.appendChild(inputFiltro);
  filaTop.appendChild(spanCount);
  wrapper.appendChild(filaTop);

  const tabla = document.createElement("table");
  tabla.style = `
    width: 100%;
    border-collapse: collapse;
    font-size: 0.92em;
    background:#111;
    color:#e6e6e6;
    border:1px solid #2a2a2a;
  `;

  const columnas = [
    { key: "nom_proveedor", label: "Proveedor" },
    { key: "rubro", label: "Rubro" },
    { key: "subrubro", label: "Subrubro" },
    { key: "cod_barra", label: "Cód. Barra" },
    { key: "cod_interno", label: "Cód. Interno" },
    { key: "articulo", label: "Artículo" },
    { key: "unidad", label: "Unidad", align: "right" },
    { key: "medida", label: "Medida" },
    { key: "precio_costo", label: "Costo", align: "right", numeric: true },
    { key: "iva", label: "IVA", align: "right", numeric: true },
    { key: "precio_civa", label: "Costo c/IVA", align: "right", numeric: true },
    { key: "por_ganancia", label: "% Gcia", align: "right", numeric: true },
    { key: "precio_venta", label: "Precio Venta", align: "right", numeric: true },
    { key: "fraccion", label: "Fracción", align: "center" },
  ];

  const thead = document.createElement("thead");
  thead.style = "background:#1a1a1a;";
  const trHead = document.createElement("tr");

  let sortKey = null;
  let sortAsc = true;

  // 👇 Estas funciones se declaran para evitar error de referencia
  let renderFilas;
  let updateArrows;

  columnas.forEach((col) => {
    const th = document.createElement("th");
    th.textContent = col.label;
    th.style = `padding:8px; cursor:pointer; border-bottom:1px solid #2a2a2a; text-align:${col.align || "left"};`;

    th.addEventListener("click", () => {
      if (sortKey === col.key) {
        sortAsc = !sortAsc;
      } else {
        sortKey = col.key;
        sortAsc = true;
      }
      renderFilas(inputFiltro.value);
      updateArrows();
    });

    th.dataset.key = col.key;
    trHead.appendChild(th);
  });

  thead.appendChild(trHead);
  tabla.appendChild(thead);

  const tbody = document.createElement("tbody");
  tabla.appendChild(tbody);

  wrapper.appendChild(tabla);
  contenedor.appendChild(wrapper);

  try {
    const url = `${API_BASE}/api/articulocm/articulopuro/listar?nro_comercio=${encodeURIComponent(nro_comercio)}`;
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const payload = await resp.json();

    if (!payload?.ok || !Array.isArray(payload.articulos)) {
      throw new Error("Respuesta inválida del servidor");
    }

    const articulos = payload.articulos;

    renderFilas = function (filtro = "") {
      const t = filtro.toLowerCase().trim();
      let filtered = articulos.filter((a) => {
        return columnas.some((col) => {
          const val = String(a[col.key] ?? "").toLowerCase();
          return val.includes(t);
        });
      });

      if (sortKey) {
        filtered = filtered.sort((a, b) => {
          const valA = a[sortKey];
          const valB = b[sortKey];

          if (typeof valA === "number" && typeof valB === "number") {
            return sortAsc ? valA - valB : valB - valA;
          }

          return sortAsc
            ? String(valA ?? "").localeCompare(String(valB ?? ""))
            : String(valB ?? "").localeCompare(String(valA ?? ""));
        });
      }

      tbody.innerHTML = "";

      filtered.forEach((a) => {
        const tr = document.createElement("tr");
        tr.style = "border-top:1px solid #222;";
        tr.innerHTML = columnas
          .map((col) => {
            let value = a[col.key] ?? "";
            if (
              col.key === "precio_costo" ||
              col.key === "precio_civa" ||
              col.key === "precio_venta"
            ) {
              value = formatoMoneda(value);
            } else if (col.key === "iva") {
              value = formatoIva(value);
            } else if (col.key === "por_ganancia" && value != null) {
              value = Number(value).toLocaleString("es-AR", {
                maximumFractionDigits: 2,
              }) + "%";
            }

            return `<td style="padding:8px 10px; text-align:${col.align || "left"};">${value}</td>`;
          })
          .join("");
        tbody.appendChild(tr);
      });

      Array.from(tbody.rows).forEach((row, i) => {
        row.setAttribute("tabindex", "0");

        row.addEventListener("keydown", (e) => {
          const filaActual = e.currentTarget;
          if (!filaActual) return;

          const filas = Array.from(tbody.rows);
          const index = filas.indexOf(filaActual);

          switch (e.key) {
            case "ArrowDown":
              if (index < filas.length - 1) filas[index + 1].focus();
              break;
            case "ArrowUp":
              if (index > 0) filas[index - 1].focus();
              break;
            case "Home":
              filas[0]?.focus();
              break;
            case "End":
              filas[filas.length - 1]?.focus();
              break;
            case "PageDown":
              {
                const pageSize = Math.floor(contenedor.clientHeight / filaActual.offsetHeight);
                const nextIndex = Math.min(index + pageSize, filas.length - 1);
                filas[nextIndex]?.focus();
              }
              break;
            case "PageUp":
              {
                const pageSize = Math.floor(contenedor.clientHeight / filaActual.offsetHeight);
                const prevIndex = Math.max(index - pageSize, 0);
                filas[prevIndex]?.focus();
              }
              break;
          }
        });

        row.addEventListener("focus", () => {
          row.style.outline = "2px solid #00cfe8";
          row.scrollIntoView({ block: "nearest" });
        });
        row.addEventListener("blur", () => {
          row.style.outline = "none";
        });
      });

      spanCount.textContent = `${filtered.length} / ${articulos.length}`;
    };

    updateArrows = function () {
      thead.querySelectorAll("th").forEach((th) => {
        const key = th.dataset.key;
        th.textContent = columnas.find((c) => c.key === key).label;
        if (key === sortKey) {
          th.textContent += sortAsc ? " ↑" : " ↓";
        }
      });
    };

    renderFilas();
    if (tbody.rows.length > 0) {
  tbody.rows[0].focus();
}

    inputFiltro.addEventListener("input", () => renderFilas(inputFiltro.value));
    inputFiltro.focus();
  } catch (err) {
    console.error("Error al listar artículos:", err);
    showNotify({ msg: "No se pudo cargar el listado", type: "error" });
  }
}

function accionFraccionarArticulo() {
  console.log("⚖️ Fraccionar artículo");
  accionActual = 7;
  // Aquí iría la lógica para fraccionar el producto
}

// --- ASOCIACIÓN DE EVENTOS A BOTONES ---
document.addEventListener("DOMContentLoaded", () => {
  document
    .getElementById("btn-guardar-articulo")
    ?.addEventListener("click", accionGuardarArticulo);
  document
    .getElementById("btn-nuevo-articulo")
    ?.addEventListener("click", accionNuevoArticulo);
  document
    .getElementById("btn-editar-articulo")
    ?.addEventListener("click", accionEditarArticulo);
  document
    .getElementById("btn-borrar-articulo")
    ?.addEventListener("click", accionBorrarArticulo);
  document
    .getElementById("btn-limpiar-todo")
    ?.addEventListener("click", accionLimpiarTodo);
  document
    .getElementById("btn-listado-articulo")
    ?.addEventListener("click", accionListarArticulo);
  document
    .getElementById("btn-fraccionar-articulo")
    ?.addEventListener("click", accionFraccionarArticulo);
});
// MOSTRAR DATOS EN EL FORMULARIO
function cargarFormularioConArticulo(art) {
  document.getElementById("cod-barra").value = art.cod_barra || "";
  document.getElementById("cod-interno").value = art.cod_interno || "";
  document.getElementById("articulo").value = art.articulo || "";
  document.getElementById("unidad-articulo").value = art.unidad || "";
  document.getElementById("medida-articulo").value = art.medida || "";
  document.getElementById("precio-costo").value = art.precio_costo || "";
  document.getElementById("precio-civa").value = art.precio_civa || "";
  document.getElementById("precio-venta-articulo").value =
    art.precio_venta || "";

  const comboIva = document.getElementById("iva-articulo");
  const valorBuscado = parseFloat(art.iva);

  for (let i = 0; i < comboIva.options.length; i++) {
    const opt = comboIva.options[i];
    if (parseFloat(opt.value) === valorBuscado) {
      comboIva.selectedIndex = i;
      idIvaSeleccionado = valorBuscado;
      break;
    }
  }

  const comboGanancia = document.getElementById("por-gan-articulo");
  const valorGanancia = parseFloat(art.por_ganancia);

  for (let i = 0; i < comboGanancia.options.length; i++) {
    const opt = comboGanancia.options[i];
    if (parseFloat(opt.value) === valorGanancia) {
      comboGanancia.selectedIndex = i;
      idGananciaSeleccionada = valorGanancia;
      break;
    }
  }

  document.getElementById("combo-proveedores").value = art.nro_proveedor || "";
  nroProveedorSeleccionado = art.nro_proveedor || null;

  document.getElementById("combo-rubros").value = art.nro_rubro || "";
  nroRubroSeleccionado = art.nro_rubro || null;

  // Cargar subrubros y luego setear subrubro
  cargarSubrubros(art.nro_comercio, art.nro_rubro).then(() => {
    document.getElementById("combo-subrubros").value = art.nro_subrubro || "";
    nroSubrubroSeleccionado = art.nro_subrubro || null;
  });
}

//ORDENAMIENTO DEL LISTADO
function sortTableByColumn(table, columnIndex, asc = true) {
  const tBody = table.tBodies[0];
  const rows = Array.from(tBody.querySelectorAll("tr"));

  const sortedRows = rows.sort((a, b) => {
    const aText = a.cells[columnIndex].textContent.trim();
    const bText = b.cells[columnIndex].textContent.trim();

    const aVal = isNaN(aText) ? aText.toLowerCase() : parseFloat(aText);
    const bVal = isNaN(bText) ? bText.toLowerCase() : parseFloat(bText);

    return asc ? (aVal > bVal ? 1 : -1) : aVal < bVal ? 1 : -1;
  });

  tBody.innerHTML = "";
  tBody.append(...sortedRows);

  table.querySelectorAll("th").forEach((th) => {
    th.classList.remove("th-sort-asc", "th-sort-desc");
  });

  const th = table.querySelector(`th:nth-child(${columnIndex + 1})`);
  th.classList.add(asc ? "th-sort-asc" : "th-sort-desc");
}
