
// --- Mostrar usuario universal ---
// Al cargar la página
window.addEventListener('DOMContentLoaded', function () {
    if (typeof mostrarDatosUsuarioUniversal === 'function') {
        mostrarDatosUsuarioUniversal();
    }
    controlarVisibilidadMenu();
});

// --- Menú desplegable profesional y condiciones de usuario ---
function controlarVisibilidadMenu() {
    let nivel = '';
    try {
        const usuario = JSON.parse(localStorage.getItem('usuarioLogueado') || '{}');
        nivel = String(usuario.nivel_acceso ?? '');
    } catch {
        nivel = '';
    }

    // Por defecto oculta todo, muestra solo lo que corresponde
    if (nivel === "0") {
        // Admin general: ve todo
        return;
    }

    // Nivel 1, 2, 3: ocultan "adm-gral"
    const admGral = document.querySelector('[data-opcion="adm-gral"]');
    if (admGral) admGral.style.display = "none";

    // Nivel 2 y 3: ocultan "adm-comercio" también
    if (nivel === "2" || nivel === "3") {
        const admComercio = document.querySelector('[data-opcion="adm-comercio"]');
        if (admComercio) admComercio.style.display = "none";
    }
}

// Menú desplegable y hamburguesa (igual que antes)
document.addEventListener("DOMContentLoaded", function() {

    // Menú desplegable
    document.querySelectorAll('.menu-item.menu-has-sub').forEach(function(item) {
        item.addEventListener('mouseenter', function() {
            item.classList.add('open');
        });
        item.addEventListener('mouseleave', function() {
            item.classList.remove('open');
        });
        item.querySelector('.menu-link').addEventListener('click', function(e) {
            e.preventDefault();
            item.classList.toggle('open');
        });
    });

    // Menú móvil (hamburguesa)
    const sidebar = document.querySelector('.sidebar');
    const burgerBtn = document.createElement('button');
    burgerBtn.className = 'burger-btn';
    burgerBtn.innerHTML = '<span class="burger-icon"><span></span></span>';
    document.body.appendChild(burgerBtn);

    burgerBtn.addEventListener('click', function() {
        sidebar.classList.toggle('open');
    });

    document.addEventListener('click', function(e) {
        if (window.innerWidth <= 700) {
            if (!sidebar.contains(e.target) && !burgerBtn.contains(e.target)) {
                sidebar.classList.remove('open');
            }
        }
    });
});
