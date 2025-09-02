window.cerrarSesion = function () {
    console.log(">>> FUNCIÓN cerrarSesion ejecutada");

    // 1. Limpiar el localStorage primero
    localStorage.clear();

    // 2. Mostrar notificación (sin delay largo)
    showNotify({ msg: "Sesión cerrada correctamente.", type: "info", duration: 1000 });

    // 3. Redirigir luego de 1 segundo (tiempo justo para que se limpie y se muestre la notificación)
    setTimeout(() => {
        window.location.href = "../../index.html";
    }, 1000);
};
