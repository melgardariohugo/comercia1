window.setupFormNavigation = function (formEl) {
  const isFocusable = (el) => {
    if (!el) return false;
    if (el.disabled) return false;
    if (el.offsetParent === null && getComputedStyle(el).position !== "fixed")
      return false;
    return true;
  };

  const getFocusable = () => {
    const nodes = Array.from(formEl.querySelectorAll("input, select"));
    return nodes.filter(isFocusable);
  };

  const focusNext = (current) => {
    const focusables = getFocusable();
    const idx = focusables.indexOf(current);
    const next = focusables[(idx + 1) % focusables.length];
    if (next) next.focus();
  };

  const focusPrev = (current) => {
    const focusables = getFocusable();
    const idx = focusables.indexOf(current);
    const prev = focusables[(idx - 1 + focusables.length) % focusables.length];
    if (prev) prev.focus();
  };

  const getCampoEtiqueta = (el) => {
    // 1️⃣ Si hay placeholder, usarlo
    if (el.placeholder) return el.placeholder;
    // 2️⃣ Si hay <label for="...">
    const label = formEl.querySelector(`label[for="${el.id}"]`);
    if (label) return label.textContent.trim();
    // 3️⃣ Si hay atributo name
    if (el.name) return el.name;
    // 4️⃣ Último recurso: id
    if (el.id) return el.id;
    // 5️⃣ Si no hay nada
    return "campo";
  };
  formEl.addEventListener("keydown", (e) => {
    const target = e.target;
    const tag = target.tagName;
    if (tag !== "INPUT" && tag !== "SELECT") return;

    const isTab = e.key === "Tab";
    const isEnter = e.key === "Enter";
    const isEscape = e.key === "Escape" || e.key === "Esc";

    const valor = String(target.value || "").trim();

    // Validación para Enter o Tab: impedir avance si está vacío
    if ((isEnter || isTab) && !valor) {
      e.preventDefault();
      const etiqueta = getCampoEtiqueta(target);
      showNotify({
        msg: `El campo "${etiqueta}" está vacío`,
        type: "error",
      });
      target.focus();
      return;
    }

    // Enter o Tab: avanzar
    if (isEnter || isTab) {
      e.preventDefault();
      focusNext(target);
      return;
    }

    // Escape: SIEMPRE retrocede, sin validación
    if (isEscape) {
      e.preventDefault();
      focusPrev(target);
    }
  });

  let tooltip = document.createElement("div");
  tooltip.className = "tooltip";
  document.body.appendChild(tooltip);

  const showTooltip = (el) => {
    const ayuda = el.dataset.ayuda;
    if (!ayuda) return;

    const rect = el.getBoundingClientRect();
    tooltip.textContent = ayuda;
    tooltip.style.top = `${rect.top + window.scrollY - 30}px`;
    tooltip.style.left = `${rect.left + window.scrollX}px`;
    tooltip.style.opacity = "1";
  };

  const hideTooltip = () => {
    tooltip.style.opacity = "0";
  };

  // Evento foco
  formEl.addEventListener("focusin", (e) => {
    const el = e.target;
    if (el.tagName === "INPUT" || el.tagName === "SELECT") {
      showTooltip(el);
    }
  });

  // Evento blur
  formEl.addEventListener("focusout", (e) => {
    hideTooltip();
  });

  // Auto-avance en <select>
  formEl.addEventListener("change", (e) => {
    const el = e.target;
    if (el.tagName === "SELECT") {
      const valor = String(el.value || "").trim();
      if (valor) {
        focusNext(el);
      }
    }
  });

  // Auto-avance en radio buttons
  formEl.querySelectorAll('input[type="radio"]').forEach((radio) => {
    radio.addEventListener("change", (e) => {
      const el = e.target;
      // Esperamos un mini delay para permitir visualización clara del cambio
      setTimeout(() => {
        focusNext(el);
      }, 100);
    });
  });
};
