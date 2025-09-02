const API_BASE = "http://localhost:3000";

// --- Mostrar datos usuario en encabezado y ejecutar lógica principal ---
window.addEventListener("DOMContentLoaded", () => {
  if (typeof mostrarDatosUsuarioUniversal === "function") {
    mostrarDatosUsuarioUniversal();
  }

 
});

