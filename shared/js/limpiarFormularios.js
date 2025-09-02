function limpiarFormulario(formId) {
  const form = document.getElementById(formId);
  if (!form) return;

  // Limpiar y habilitar inputs
  form.querySelectorAll("input").forEach(input => {
    input.disabled = false;

    if (["checkbox", "radio"].includes(input.type)) {
      input.checked = false;
    } else {
      input.value = "";
    }
  });

  // Limpiar y habilitar selects
  form.querySelectorAll("select").forEach(select => {
    select.disabled = false;
    select.selectedIndex = 0;
    select.dispatchEvent(new Event("change"));
  });

  // Limpiar y habilitar textareas
  form.querySelectorAll("textarea").forEach(textarea => {
    textarea.disabled = false;
    textarea.value = "";
  });
}
