const CalculadorPrecios = (() => {
  const redondear = (valor, decimales = 2) => {
    const factor = Math.pow(10, decimales);
    return Math.round(valor * factor) / factor;
  };

  const normalizarNumero = (valorStr) => {
    if (typeof valorStr !== "string") return null;

    valorStr = valorStr.replace(",", ".");
    const num = parseFloat(valorStr);
    if (isNaN(num)) {
      showNotify({ msg: "❌ Ingresá un número válido", type: "error" });
      return null;
    }

    return num;
  };

  const formatearNumero = (valor, decimales = 2) => {
    return valor.toFixed(decimales); // siempre usa punto decimal
  };

  const calcular = () => {
    const costoInput = document.getElementById("precio-costo");
    const ivaCombo = document.getElementById("iva-articulo");
    const gananciaCombo = document.getElementById("por-gan-articulo");
    const civaInput = document.getElementById("precio-civa");
    const ventaInput = document.getElementById("precio-venta-articulo");
    const modoInverso = document.getElementById("modo-inverso")?.checked;

    const iva = parseFloat(ivaCombo.value);
    const ganancia = parseFloat(gananciaCombo.value);

    if (isNaN(iva)) {
      civaInput.value = "";
      ventaInput.value = "";
      return;
    }
if (modoInverso) {
  const precioVenta = normalizarNumero(ventaInput.value);
  if (precioVenta !== null && !isNaN(ganancia) && !isNaN(iva)) {
    const precioCIVA = redondear(precioVenta / ganancia);
    const costo = redondear(precioCIVA / iva);

    costoInput.value = formatearNumero(costo);
    civaInput.value = formatearNumero(precioCIVA);
  } else {
    costoInput.value = "";
    civaInput.value = "";
  }    
    } else {
      const costo = normalizarNumero(costoInput.value);
      if (costo !== null) {
        const precioCIVA = redondear(costo * iva);
        civaInput.value = formatearNumero(precioCIVA);

        if (!isNaN(ganancia) && ganancia > 0) {
          const precioVenta = redondear(precioCIVA * ganancia);
          ventaInput.value = formatearNumero(precioVenta);
        } else {
          ventaInput.value = "";
        }
      } else {
        civaInput.value = "";
        ventaInput.value = "";
      }
    }
  };

  const normalizarYFormatearCampo = (input) => {
    input.addEventListener("blur", (e) => {
      let valor = e.target.value;
      if (typeof valor === "string") {
        valor = valor.replace(",", ".");
      }

      const numero = parseFloat(valor);
      if (!isNaN(numero)) {
        e.target.value = numero.toFixed(2);
      } else {
        e.target.value = "";
        showNotify({
          msg: `❌ Ingresá un número válido en ${input.placeholder || "el campo"}`,
          type: "error"
        });
      }
    });
  };

  const init = () => {
    const costoInput = document.getElementById("precio-costo");
    const ventaInput = document.getElementById("precio-venta-articulo");
    const modoInversoCheckbox = document.getElementById("modo-inverso");
    document.getElementById("precio-civa").readOnly = true;

    const actualizarModoCampos = () => {
      if (modoInversoCheckbox.checked) {
        costoInput.readOnly = true;
        ventaInput.readOnly = false;
      } else {
        costoInput.readOnly = false;
        ventaInput.readOnly = true;
      }
    };

    actualizarModoCampos();

    document.getElementById("precio-costo").addEventListener("input", calcular);
    document.getElementById("precio-venta-articulo").addEventListener("input", calcular);
    document.getElementById("iva-articulo").addEventListener("change", calcular);
    document.getElementById("por-gan-articulo").addEventListener("change", calcular);
    modoInversoCheckbox.addEventListener("change", () => {
      actualizarModoCampos();
      calcular();
    });

    normalizarYFormatearCampo(costoInput);
    normalizarYFormatearCampo(ventaInput);

    calcular(); // ejecutar cálculo inicial si hay valores cargados
  };

  return { init };
})();
