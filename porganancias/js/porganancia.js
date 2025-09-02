const API_BASE = "http://localhost:3000";

document.addEventListener("DOMContentLoaded", function () {
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
    document.getElementById("formGanancia").style.display = "none";
    document.getElementById("tablaGanancias").innerHTML =
      "<tr><td colspan='2'>Error de acceso</td></tr>";
    return;
  }

  cargarListado(nro_comercio);

  const form = document.getElementById("formGanancia");
  form.onsubmit = async function (e) {
    e.preventDefault();
    const valorA = parseFloat(document.getElementById("valorA").value) || 1.0;
    const valorB = parseFloat(document.getElementById("valorB").value);
    const valorC = parseFloat(document.getElementById("valorC").value);

    if (isNaN(valorB) || valorB <= 0 || isNaN(valorC) || valorC <= 0) {
      showNotify({ msg: "Verifique los valores ingresados", type: "error" });
      return;
    }

    try {
      const resp = await fetch(API_BASE + "/api/porganancia/generar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ valorA, valorB, valorC, nro_comercio }),
      });
      const data = await resp.json();
      if (resp.ok && data.ok) {
        showNotify({ msg: "Porcentajes generados correctamente", type: "ok" });
        cargarListado(nro_comercio);
      } else {
        showNotify({ msg: data.mensaje || "Error al guardar", type: "error" });
      }
    } catch {
      showNotify({ msg: "Error de conexión con backend", type: "error" });
    }
  };
});

async function cargarListado(nro_comercio) {
  const tbody = document.querySelector("#tablaGanancias tbody");
  tbody.innerHTML = "";
  document.getElementById("mensaje-vacio").textContent = "";

  try {
    const resp = await fetch(
      `${API_BASE}/api/porganancia/listar?nro_comercio=${nro_comercio}`
    );
    if (!resp.ok) throw new Error("Error de respuesta del servidor");

    const lista = await resp.json();

    if (!lista || lista.length === 0) {
      document.getElementById("mensaje-vacio").textContent =
        "No hay porcentajes cargados.";
      return;
    }

    for (let item of lista) {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td>${item.ord_ganancia}</td><td>${parseFloat(
        item.porcentaje
      ).toFixed(2)}</td>`;
      tbody.appendChild(tr);
    }
  } catch (err) {
    console.error("Error al cargar el listado:", err);
    document.getElementById("mensaje-vacio").textContent =
      "No se pudo cargar el listado.";
  }
}
