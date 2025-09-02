const API_BASE = "http://localhost:3000";

// --- Mostrar datos usuario en encabezado y ejecutar lógica principal ---
window.addEventListener("DOMContentLoaded", () => {
  if (typeof mostrarDatosUsuarioUniversal === "function") {
    mostrarDatosUsuarioUniversal();
  }

  const buscador = document.getElementById("buscadorUsuarios");
  if (buscador) {
    buscador.dispatchEvent(new Event("submit"));
  }

  const usuario = JSON.parse(localStorage.getItem("usuarioLogueado"));
  const nro_comercio = usuario?.nro_comercio;

  // Mostrar advertencia solo si no hay nro_comercio (pero permitir el 0)
  if (nro_comercio == null) {
    showNotify({
      msg: "Error: no se pudo determinar el comercio del usuario",
      type: "error",
    });
    document.getElementById("formIva").style.display = "none";
    document.getElementById("tablaIva").innerHTML =
      "<tr><td colspan='2'>Error de acceso</td></tr>";
    return;
  }

  cargarTablaIva();

  // Manejo del formulario de IVAs
  document.getElementById("formIva").onsubmit = async function (e) {
    e.preventDefault();

    const valorA = parseFloat(document.getElementById("valorA").value);
    const valorB = parseInt(document.getElementById("valorB").value);
    const valorC = parseInt(document.getElementById("valorC").value);

    if (
      isNaN(valorA) ||
      isNaN(valorB) ||
      isNaN(valorC) ||
      valorC < 2 ||
      nro_comercio == null
    ) {
      showNotify({
        msg: "Completá todos los campos correctamente",
        type: "error",
      });
      return;
    }

    console.log("ENVIANDO:", { valorA, valorB, valorC, nro_comercio });

    try {
      const resp = await fetch(`${API_BASE}/api/iva/generar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ valorA, valorB, valorC, nro_comercio }),
      });

      const data = await resp.json();
      if (resp.ok && data.ok) {
        showNotify({ msg: "IVAs generados correctamente", type: "ok" });
        cargarTablaIva();
      } else {
        showNotify({ msg: data.mensaje || "Error al guardar", type: "error" });
      }
    } catch {
      showNotify({ msg: "Error de conexión con backend", type: "error" });
    }
  };
});

async function cargarTablaIva() {
  const tbody = document.querySelector("#tablaIva tbody");
  tbody.innerHTML = `<tr><td colspan="2">Cargando...</td></tr>`;

  try {
    const usuario = JSON.parse(localStorage.getItem("usuarioLogueado"));
    const nro_comercio = usuario?.nro_comercio;

    const resp = await fetch(
      `${API_BASE}/api/iva/listar?nro_comercio=${nro_comercio}`
    );
    const datos = await resp.json();

    if (!Array.isArray(datos) || !datos.length) {
      tbody.innerHTML = `<tr><td colspan="2">No hay IVAs cargados</td></tr>`;
      return;
    }

    tbody.innerHTML = "";
    for (let iva of datos) {
      tbody.innerHTML += `
        <tr>
          <td>${iva.orden}</td>
          <td>${iva.iva.toLocaleString("es-AR", {
            minimumFractionDigits: 2,
          })}</td>
        </tr>`;
    }
  } catch {
    tbody.innerHTML = `<tr><td colspan="2">Error al cargar IVAs</td></tr>`;
  }
}
