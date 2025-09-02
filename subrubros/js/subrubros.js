
const API_BASE = "http://localhost:3000/api";


// --- Mostrar datos usuario en encabezado ---
document.addEventListener("DOMContentLoaded", function () {
  if (typeof mostrarDatosUsuarioUniversal === "function") {
    mostrarDatosUsuarioUniversal();
  }
  const inputComercio = document.getElementById("nro_comercio");
  if (inputComercio && inputComercio.value !== "") {
    // nada aquí según tu código original
  }
});

document.addEventListener("DOMContentLoaded", () => {
  // 1. Cargar N° Comercio desde localStorage
  let usuario;
  try {
    usuario = JSON.parse(localStorage.getItem("usuarioLogueado"));
    if (
      !usuario ||
      typeof usuario.nro_comercio === "undefined" ||
      usuario.nro_comercio === null
    )
      throw new Error();
    document.getElementById("nro_comercio").value = usuario.nro_comercio;
  } catch {
    showNotify({ msg: "Error no se puede obtener N° comercio", type: "error" });
    return;
  }

  const nroComercio = usuario.nro_comercio;
  const comboRubro = document.getElementById("combo_rubro");
  const inputNroRubro = document.getElementById("nro_rubro");
  const inputCodRubro = document.getElementById("cod_rubro");
  const inputNroSubrubro = document.getElementById("nro_subrubro");
  const inputCodSubrubro = document.getElementById("cod_subrubro");
  const inputSubrubro = document.getElementById("subrubro");
  const btnGuardar = document.getElementById("btnGuardarSubrubro");

  // 2. Cargar rubros al combo
  cargarRubros();

  function cargarRubros() {
    fetch(`${API_BASE}/subrubros/rubros-por-comercio/${nroComercio}`)
      .then((res) => res.json())
      .then((rubros) => {
        if (!rubros || !Array.isArray(rubros) || rubros.length === 0) {
          showNotify({
            msg: "No hay rubros cargados para este comercio",
            type: "error",
          });
          comboRubro.innerHTML = '<option value="">Sin rubros</option>';
          return;
        }
        rubros.sort((a, b) => a.rubro.localeCompare(b.rubro));
        comboRubro.innerHTML = '<option value="">Seleccione...</option>';
        rubros.forEach((r) => {
          const val = `${r.nro_rubro}||${r.cod_rubro}||${r.rubro}`;
          comboRubro.innerHTML += `<option value="${val}">${r.nro_rubro} | ${r.cod_rubro} | ${r.rubro}</option>`;
        });
      })
      .catch(() => {
        showNotify({
          msg: "Error al cargar los rubros. Intente más tarde",
          type: "error",
        });
        comboRubro.innerHTML =
          '<option value="">Error cargando rubros</option>';
      });
  }

  // 3. Cuando se selecciona un rubro
  comboRubro.addEventListener("change", async function () {
    inputNroRubro.value = "";
    inputCodRubro.value = "";
    inputNroSubrubro.value = "";

    const val = this.value;
    if (!val) return;
    const [nroRubro, codRubro, rubro] = val.split("||");
    inputNroRubro.value = nroRubro || "";
    inputCodRubro.value = codRubro || "";

    // Traer el nro_subrubro siguiente
    if (nroRubro) {
      try {
        const res = await fetch(
          `${API_BASE}/subrubros/proximo-nro-subrubro/${nroComercio}/${nroRubro}`
        );
        const data = await res.json();
        let nextNroSubrubro = 1;
        if (
          data &&
          data.max_nro_subrubro !== undefined &&
          !isNaN(data.max_nro_subrubro)
        ) {
          nextNroSubrubro = Number(data.max_nro_subrubro) + 1;
        }
        inputNroSubrubro.value = nextNroSubrubro;
      } catch {
        showNotify({
          msg: "Error al calcular el proximo N° de subrubro",
          type: "error",
        });
        inputNroSubrubro.value = "";
        
      }
    }
    inputCodSubrubro.focus();
  });

  // 4. Guardar subrubro
  btnGuardar.addEventListener("click", function (e) {
    e.preventDefault();
    guardarSubrubro();
  });

  function guardarSubrubro() {
    // Validación de campos
    const campos = [
      { el: document.getElementById("nro_comercio"), nombre: "N° Comercio" },
      { el: comboRubro, nombre: "Rubro" },
      { el: inputNroRubro, nombre: "N° Rubro" },
      { el: inputCodRubro, nombre: "Código Rubro" },
      { el: inputNroSubrubro, nombre: "N° Subrubro" },
      { el: inputCodSubrubro, nombre: "Código Subrubro" },
      { el: inputSubrubro, nombre: "Nombre de Subrubro" },
    ];
    for (const campo of campos) {
      if (!campo.el.value || campo.el.value.trim() === "") {
        showNotify({ msg: `Debe completar: ${campo.nombre}`, type: "error" });
        campo.el.focus();
        return;
      }
    }

    const body = {
      nro_comercio: document.getElementById("nro_comercio").value,
      nro_rubro: inputNroRubro.value,
      cod_rubro: inputCodRubro.value,
      nro_subrubro: inputNroSubrubro.value,
      cod_subrubro: inputCodSubrubro.value.trim(),
      subrubro: inputSubrubro.value.trim(),
    };

    fetch(`${API_BASE}/subrubros/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
      .then((res) => res.json())
      .then((resp) => {
        if (resp && resp.success) {
          showNotify({ msg: "Subrubro guardado correctamente", type: "ok" });
          inputCodSubrubro.value = "";
          inputSubrubro.value = "";
          // Incrementar N° Subrubro
          inputNroSubrubro.value = Number(inputNroSubrubro.value) + 1;
          inputCodSubrubro.focus();
        } else if (resp && resp.error) {
          showNotify({ msg: resp.error, type: "error" });
        } else {
          showNotify({ msg: "Error al guardar el subrubro", type: "error" });
        }
      })
      .catch(() => {
        showNotify({
          msg: "Error de conexion al guardar el subrubro",
          type: "error",
        });
      });
  }
});
document.addEventListener("DOMContentLoaded", function() {
    const input = document.getElementById("combo_rubro");
    if (input) input.focus();
});
