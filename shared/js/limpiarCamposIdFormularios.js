function limpiarCamposPorIds(ids = []) {
  if (!Array.isArray(ids)) return;

  ids.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;

    const tag = el.tagName.toLowerCase();
    const type = (el.type || "").toLowerCase();

    if (tag === "input") {
      switch (type) {
        case "text":
        case "number":
        case "email":
        case "date":
        case "password":
        case "search":
        case "tel":
        case "url":
          el.value = "";
          break;
        case "checkbox":
        case "radio":
          el.checked = false;
          break;
        default:
          el.value = "";
      }
    } else if (tag === "select") {
      el.selectedIndex = 0;
    } else if (tag === "textarea") {
      el.value = "";
    }
  });

  // También limpiar radios agrupados por name
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (!el || el.type !== "radio") return;

    const radios = document.getElementsByName(el.name);
    radios.forEach(r => (r.checked = false));
  });
}
