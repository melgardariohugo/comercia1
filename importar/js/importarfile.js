// Definición correcta de la URL del endpoint
const API_BASE = "http://localhost:3000/api/importar";
const API_PROVEEDORES = `${API_BASE}/listar-proveedores`;
//const API_IVA = "/api/importaiva/listar";
const API_IMPORTAIVA = "http://localhost:3000/api/importaiva/listar"; // Poné el puerto correcto

// --- Cargar datos usuario y proveedores al inicio ---
window.addEventListener("DOMContentLoaded", () => {
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
  cargarProveedores(nro_comercio);
  cargarComboIVA(nro_comercio); // <--- Agregado: carga IVA dinámico
});

let listaProveedores = [];
let datosExcel = [];
let datosFiltrados = [];
const comboProveedor = document.getElementById("comboProveedor");
const inputBusquedaProveedor = document.getElementById("busquedaProveedor");

const selects = {
  cod_barra: document.getElementById("col_cod_barra"),
  cod_interno: document.getElementById("col_cod_interno"),
  articulo: document.getElementById("col_articulo"),
  precio: document.getElementById("col_precio"),
};

const chkSinIva = document.getElementById("chk-sin-iva");
const comboIva = document.getElementById("combo-iva");
chkSinIva.addEventListener("change", () => {
  comboIva.disabled = !chkSinIva.checked;
});

// --- Carga IVAs desde backend y llena el combo con coeficiente ---


async function cargarComboIVA(nro_comercio) {
  try {
    const resp = await fetch(`${API_IMPORTAIVA}?nro_comercio=${nro_comercio}`);
    if (!resp.ok) throw new Error("No se pudo obtener IVAs");
    const ivas = await resp.json();
    comboIva.innerHTML = "";
    if (!ivas.length) {
      comboIva.innerHTML = '<option value="1">Sin IVAs</option>';
      comboIva.disabled = true;
      return;
    }
    ivas.forEach(iva => {
      let porcentaje = ((parseFloat(iva.iva) - 1) * 100).toFixed(2).replace(/\.00$/, "");
      let label = `IVA ${porcentaje}%`;
      comboIva.innerHTML += `<option value="${iva.iva}">${label}</option>`;
    });
    comboIva.disabled = !chkSinIva.checked;
  } catch (err) {
    comboIva.innerHTML = '<option value="1">Error al cargar IVAs</option>';
    comboIva.disabled = true;
    console.error("Error cargando IVAs:", err);
  }
}

// --- Cargar proveedores del backend ---
async function cargarProveedores(nro_comercio) {
  try {
    const resp = await fetch(API_PROVEEDORES, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nro_comercio }),
    });
    if (!resp.ok) throw new Error("Error al traer proveedores");
    listaProveedores = await resp.json();
    renderComboProveedores(listaProveedores);
  } catch (e) {
    comboProveedor.innerHTML =
      '<option value="">Error al cargar proveedores</option>';
    console.error("Error en fetch proveedores:", e);
  }
}

function renderComboProveedores(arr) {
  comboProveedor.innerHTML =
    '<option value="">Seleccione un proveedor...</option>' +
    arr
      .map(
        (p) =>
          `<option value="${p.nro_proveedor}">${p.nro_proveedor} - ${p.nom_proveedor}</option>`
      )
      .join("");
}

inputBusquedaProveedor.addEventListener("input", () => {
  const val = inputBusquedaProveedor.value.trim().toLowerCase();
  if (!val) {
    renderComboProveedores(listaProveedores);
    return;
  }
  const filtra = (txt) =>
    txt
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .includes(val);
  const filtrar = listaProveedores.filter(
    (p) => filtra(p.nro_proveedor + "") || filtra(p.nom_proveedor)
  );
  renderComboProveedores(filtrar);
});

const archivoInput = document.getElementById("archivo");
const btnProcesar = document.getElementById("btn-procesar");
const btnDescargar = document.getElementById("btn-descargar");
const resultadoDiv = document.getElementById("resultado-import");
const previewOriginalDiv = document.getElementById("preview-original");

archivoInput.addEventListener("change", handleArchivo);

async function handleArchivo(e) {
  limpiarCombos();
  resultadoDiv.innerHTML = "";
  previewOriginalDiv.innerHTML = "";
  btnProcesar.disabled = true;
  btnDescargar.disabled = true;
  datosFiltrados = [];
  const file = archivoInput.files[0];
  if (!file) return;
  const data = await file.arrayBuffer();
  let workbook, worksheet, rows;

  try {
    workbook = XLSX.read(data, { type: "array" });
    worksheet = workbook.Sheets[workbook.SheetNames[0]];
    rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    if (rows.length < 1) throw "No hay datos o formato no soportado.";
  } catch (err) {
    previewOriginalDiv.innerHTML =
      "<div style='color:#e44343;'>Archivo no compatible o corrupto.</div>";
    return;
  }

  previewOriginalDiv.innerHTML = renderPreviewOriginal(rows);

  let maxCols = 0;
  rows.forEach((fila) => {
    if (Array.isArray(fila) && fila.length > maxCols) maxCols = fila.length;
  });

  const headers = rows[0] || [];
  const placeholders = {
    cod_barra: "Columna Cod. Barra",
    cod_interno: "Columna Cod. Interno",
    articulo: "Columna Artículo",
    precio: "Columna Precio/Costo",
  };

  for (let campo in selects) {
    const select = selects[campo];
    select.innerHTML = "";
    const optionDefault = document.createElement("option");
    optionDefault.value = "";
    optionDefault.textContent = placeholders[campo];
    optionDefault.disabled = true;
    optionDefault.selected = true;
    select.appendChild(optionDefault);

    for (let i = 0; i < maxCols; i++) {
      const nroColumna = i + 1;
      const nombreCol =
        headers[i] && headers[i].toString().trim() !== "" ? headers[i] : "";
      const option = document.createElement("option");
      option.value = i;
      option.textContent =
        "Columna " + nroColumna + (nombreCol ? `: ${nombreCol}` : "");
      select.appendChild(option);
    }
  }
  btnProcesar.disabled = false;
  datosExcel = rows;
}

function renderPreviewOriginal(datos) {
  let th = `<tr>${datos[0]
    .map((h) => `<th>${escapeHtml(h)}</th>`)
    .join("")}</tr>`;
  let filas = datos
    .slice(1, 21)
    .map(
      (row) =>
        `<tr>${row.map((col) => `<td>${escapeHtml(col)}</td>`).join("")}</tr>`
    )
    .join("");
  return `<div class="preview-label">Vista previa del archivo original (primeras 20 filas):</div>
    <table class="tabla-excel">${th}${filas}</table>`;
}

function limpiarPrecio(precio) {
  if (precio === undefined || precio === null || precio === "") return "";

  if (typeof precio === "number") {
    return precio.toFixed(2);
  }

  let str = precio.toString().replace(/[^0-9.,-]/g, "");

  if ((str.match(/,/g) || []).length > 1) {
    str = str.replace(/,(?=.*[,])/g, "");
  }

  if (/\d+\.\d{3},\d+/.test(str)) {
    str = str.replace(/\./g, "").replace(",", ".");
  }
  else if (/\d+,\d{3}\.\d+/.test(str)) {
    str = str.replace(/,/g, "");
  }
  else if (/\d+,\d+/.test(str)) {
    str = str.replace(",", ".");
  }

  let num = Number(str);
  if (isNaN(num)) return "";
  return num.toFixed(2);
}

btnProcesar.addEventListener("click", () => {
  if (!comboProveedor.value) {
    showNotify({
      msg: "Debe seleccionar un proveedor antes de importar.",
      type: "error",
    });
    return;
  }
  if (!selects.articulo.value || !selects.precio.value) {
    showNotify({
      msg: "Debe mapear al menos las columnas de Artículo y Precio/Costo.",
      type: "error",
    });
    return;
  }
  const res = [];
  for (let i = 1; i < datosExcel.length; ++i) {
    const fila = datosExcel[i];
    if (!fila.length) continue;
    res.push({
      cod_barra: selects.cod_barra.value
        ? fila[selects.cod_barra.value] ?? ""
        : "",
      cod_interno: selects.cod_interno.value
        ? fila[selects.cod_interno.value] ?? ""
        : "",
      articulo: selects.articulo.value
        ? fila[selects.articulo.value] ?? ""
        : "",
      precio: selects.precio.value
        ? limpiarPrecio(fila[selects.precio.value])
        : "",
    });
  }
  datosFiltrados = res;
  resultadoDiv.innerHTML = renderTabla(res);
  btnDescargar.disabled = res.length === 0;
});

// --- Render tabla resultado ---
function renderTabla(datos) {
  if (!datos.length)
    return "<div style='color:#e44343;'>No hay datos para mostrar.</div>";

  // IVA: ¿aplicar cálculo?
  const aplicarIva = chkSinIva.checked;
  const coefIva = parseFloat(comboIva.value); // <--- Usamos coeficiente, NO porcentaje

  let th = `<tr>
    <th>#</th>
    <th>Código de Barras</th>
    <th>Código Interno</th>
    <th>Artículo</th>
    <th>Precio/Costo</th>
    <th>Precio/Costo</th>
  </tr>`;

  let body = datos
    .map((d, i) => {
      let precio = parseFloat(d.precio) || 0;
      let precio_costo = "";
      if (precio) {
        precio_costo = aplicarIva ? (precio * coefIva).toFixed(2) : precio.toFixed(2); // <--- ¡Acá!
      }
      return `<tr>
        <td>${i + 1}</td>
        <td>${escapeHtml(d.cod_barra)}</td>
        <td>${escapeHtml(d.cod_interno)}</td>
        <td>${escapeHtml(d.articulo)}</td>
        <td>${escapeHtml(d.precio)}</td>
        <td>${precio_costo}</td>
      </tr>`;
    })
    .join("");
  return `<div class="preview-label">Vista previa a importar:</div>
    <table class="tabla-excel">${th}${body}</table>`;
}

btnDescargar.addEventListener("click", () => {
  if (!datosFiltrados.length) {
    showNotify({ msg: "No hay datos para descargar.", type: "error" });
    return;
  }

  // Obtener datos de comercio y proveedor
  const usuario = JSON.parse(localStorage.getItem("usuarioLogueado"));
  const nro_comercio = usuario?.nro_comercio !== undefined ? usuario.nro_comercio : "";
  const comboProveedor = document.getElementById("comboProveedor");
  const nro_proveedor = comboProveedor.value;
  const nom_proveedor = comboProveedor.options[
    comboProveedor.selectedIndex
  ].text.replace(/^\d+\s*-\s*/, "");

  // --- Filtrar filas que SÍ tienen precio ---
  const datosFiltradosConPrecio = datosFiltrados.filter((d) => {
    return (
      d.precio !== undefined &&
      d.precio !== null &&
      String(d.precio).trim() !== ""
    );
  });

  if (!datosFiltradosConPrecio.length) {
    showNotify({
      msg: "No hay filas con precio para descargar.",
      type: "error",
    });
    return;
  }

  // IVA: ¿aplicar cálculo?
  const aplicarIva = chkSinIva.checked;
  const coefIva = parseFloat(comboIva.value); // <--- Usamos coeficiente

  // Encabezado con columna nueva
  const SEPARADOR = ";";
  const encabezado = [
    "nro_comercio",
    "nro_proveedor",
    "nom_proveedor",
    "cod_barra",
    "cod_interno",
    "articulo",
    "precio",
    "precio_costo"
  ];

  const filas = datosFiltradosConPrecio.map((d) => {
    let precio = parseFloat(d.precio) || 0;
    let precio_costo = "";
    if (precio) {
      precio_costo = aplicarIva ? (precio * coefIva).toFixed(2) : precio.toFixed(2);
    }
    return [
      nro_comercio,
      nro_proveedor,
      nom_proveedor,
      d.cod_barra,
      d.cod_interno,
      d.articulo,
      d.precio,
      precio_costo
    ]
      .map((x) => `"${(x + "").replace(/"/g, '""')}"`)
      .join(SEPARADOR);
  });

  const csv = [encabezado.join(SEPARADOR), ...filas].join("\r\n");
  const csvWithBom = "\uFEFF" + csv;
  const blob = new Blob([csvWithBom], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "articulos_importados.csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showNotify({ msg: "¡Descarga iniciada!", type: "success" });

  // Resetear combos y previews
  limpiarCombos();
  previewOriginalDiv.innerHTML = "";
  resultadoDiv.innerHTML = "";
  archivoInput.value = "";
  datosFiltrados = [];
  datosExcel = [];
  btnDescargar.disabled = true;
  btnProcesar.disabled = true;
});

function limpiarCombos() {
  for (let k in selects) selects[k].innerHTML = "";
}

function escapeHtml(str) {
  return String(str || "").replace(
    /[&<>"']/g,
    (s) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[s])
  );
}
