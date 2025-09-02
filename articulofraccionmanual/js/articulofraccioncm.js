// frontend/articulofraccionmanua/js/articulofraccioncm.js
const API_BASE = "http://localhost:3000";

let nro_proveedor = null;
let nro_rubro = null;
let nro_subrubro = null;
let usuario = null;
let nro_comercio = null;

window.addEventListener("DOMContentLoaded", () => {
  initPantallaArticuloFraccionado();
});

// Inicialización principal
function initPantallaArticuloFraccionado() {
  if (typeof mostrarDatosUsuarioUniversal === "function") {
    mostrarDatosUsuarioUniversal();
  }

  usuario = JSON.parse(localStorage.getItem("usuarioLogueado"));
  nro_comercio = usuario?.nro_comercio;

  if (nro_comercio == null) {
    showNotify({
      msg: "Error: no se pudo determinar el comercio del usuario",
      type: "error",
    });
    return;
  }

  setTimeout(() => {
    const inputCodBarra = document.getElementById("cod-barra");
    if (inputCodBarra) inputCodBarra.focus();
  }, 100);

  setupEventos();
}

// Configurar listeners de eventos
function setupEventos() {
  const inputCodBarra = document.getElementById("cod-barra");
  if (inputCodBarra) {
    inputCodBarra.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        handleBuscarCodBarra(inputCodBarra.value.trim());
      }
    });
  }

  const selectFraccion = document.getElementById("fraccion-frac");
  if (selectFraccion) {
    selectFraccion.addEventListener("change", calcularPrecioFraccion);
  }
}


// Al presionar enter/tab en cod_barra
async function handleBuscarCodBarra(codigo) {
  if (!codigo) return;

  const articulo = await buscarArticuloPuroPorCodBarra(nro_comercio, codigo);

  if (!articulo) {
    showNotify({
      msg: `No se encontró el artículo con código "${codigo}"`,
      type: "error",
    });

    limpiarCamposPorIds([
      "cod-interno", "proveedor", "rubro", "subrubro", "articulo",
      "unidad", "medida", "precio_costo", "iva", "precio_civa",
      "por_ganancia", "precio_venta"
    ]);

    return;
  }

  mostrarDatosArticuloPuro(articulo);
}


// Búsqueda con recorte progresivo de hasta 5 dígitos
async function buscarArticuloPuroPorCodBarra(nro_comercio, codBarraOriginal) {
  let intentos = 0;
  let codBarraActual = codBarraOriginal;

  while (intentos <= 5 && codBarraActual.length > 0) {
    try {
      const res = await fetch(`${API_BASE}/api/articulocm/articulopuro/buscar/${nro_comercio}/${codBarraActual}`);
      if (res.ok) {
        const data = await res.json();
        const articulo = data.articulo;

        if (articulo && articulo.fraccion === "s/frac") {
          return articulo;
        }
      }
    } catch (error) {
      console.error("Error en búsqueda de artículo:", error);
    }

    codBarraActual = codBarraActual.slice(0, -1); // recortar un dígito
    intentos++;
  }

  return null;
}

// Mostrar datos en los inputs + guardar nro_proveedor/rubro/subrubro
function mostrarDatosArticuloPuro(articulo) {
  nro_proveedor = articulo.nro_proveedor;
  nro_rubro = articulo.nro_rubro;
  nro_subrubro = articulo.nro_subrubro;

  document.getElementById("proveedor").value = articulo.nom_proveedor || "";
  document.getElementById("rubro").value = articulo.rubro || "";
  document.getElementById("subrubro").value = articulo.subrubro || "";
  document.getElementById("cod-barra").value = articulo.cod_barra || "";
  document.getElementById("cod-interno").value = articulo.cod_interno || "";
  document.getElementById("articulo").value = articulo.articulo || "";
  document.getElementById("unidad").value = articulo.unidad || "";
  document.getElementById("medida").value = articulo.medida || "";
  document.getElementById("precio_costo").value = articulo.precio_costo || "";
  document.getElementById("iva").value = articulo.iva || "";
  document.getElementById("precio_civa").value = articulo.precio_civa || "";
  document.getElementById("por_ganancia").value = articulo.por_ganancia || "";
  document.getElementById("precio_venta").value = articulo.precio_venta || "";
  cargarFraccionesPorMedidaConvertida(articulo.medida, nro_comercio);

}

// LLENA COMBO DE FRACCIONES POR MEDIDAS 
async function cargarFraccionesPorMedidaConvertida(medidaOriginal, nro_comercio) {
  const medidaConvertida = convertirMedida(medidaOriginal);
  const selectFraccion = document.getElementById("fraccion-frac");
  if (!selectFraccion || !medidaConvertida) return;

  // Limpiar el combo
  selectFraccion.innerHTML = `<option value="">Fracción</option>`;

  try {
    const res = await fetch(`${API_BASE}/api/porfracciones?nro_comercio=${nro_comercio}&cod_fraccion=${medidaConvertida}`);
    if (!res.ok) throw new Error("Error al buscar fracciones");

    const fracciones = await res.json();
    if (Array.isArray(fracciones) && fracciones.length > 0) {
      fracciones.forEach(f => {
        const option = document.createElement("option");
        option.value = f.fraccion;
        option.textContent = f.fraccion;
        selectFraccion.appendChild(option);
      });
    } else {
      const opt = document.createElement("option");
      opt.disabled = true;
      opt.textContent = "Sin fracciones";
      selectFraccion.appendChild(opt);
    }

  } catch (error) {
    console.error("Error al cargar fracciones:", error);
    showNotify({ msg: "No se pudieron cargar las fracciones", type: "error" });
  }
}

// Función de conversión de medida original → tipo de fracción
function convertirMedida(medida) {
  switch (medida?.toLowerCase()) {
    case "litros":
      return "CUBICO";
    case "metros":
      return "LONGITUD";
    case "unidad":
      return "UNIDAD";
    case "kilos":
      return "PESO";
    default:
      return null;
  }
}

// CALCULAR PRECIO FRACCION
function calcularPrecioFraccion() {
  const tipoUnidad = document.getElementById("medida").value.trim().toLowerCase(); // Ej: litros, kilos, etc.
  const precioVenta = parseFloat(document.getElementById("precio_venta").value);
  const unidad = parseFloat(document.getElementById("unidad").value); // valor numérico
  const fraccion = parseFloat(document.getElementById("fraccion-frac").value);

  console.log("Medida:", tipoUnidad);
  console.log("Unidad (cant):", unidad);
  console.log("Precio Venta:", precioVenta);
  console.log("Fracción:", fraccion);

  if (isNaN(precioVenta) || isNaN(unidad) || isNaN(fraccion) || unidad <= 0 || fraccion <= 0) {
    console.log("Algún dato inválido.");
    document.getElementById("precio-frac").value = "";
    return;
  }

  let precioFrac = 0;

  switch (tipoUnidad) {
    case "metros":
    case "unidad":
      precioFrac = (precioVenta / unidad) * fraccion;
      break;

    case "litros":
    case "kilos":
      const totalSubunidad = unidad * 1000;
      const fraccionesTotales = totalSubunidad / fraccion;
      precioFrac = precioVenta / fraccionesTotales;
      break;

    default:
      console.log("Unidad no válida para cálculo.");
      document.getElementById("precio-frac").value = "";
      return;
  }

  document.getElementById("precio-frac").value = precioFrac.toFixed(2);
  document.getElementById("cant-frac").value = fraccion;

}
