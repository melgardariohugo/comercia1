// index.js
// Detección del entorno
(function() {
    const hostname = window.location.hostname;

    if (hostname === "localhost" || hostname === "127.0.0.1") {
        console.log("Entorno: LOCAL");
    } else if (
        hostname.includes("github") ||
        hostname.includes("vercel") ||
        hostname.includes("netlify")
    ) {
        console.log("Entorno: NUBE GRATUITA");
    } else {
        console.log("Entorno: SERVIDOR PRODUCCIÓN O NUBE PAGA");
    }
})();

// Redireccionamiento de los botones
document.addEventListener('DOMContentLoaded', () => {
    const btnLogin = document.getElementById('btn-login');
    const btnRegistro = document.getElementById('btn-registro');

    if (btnLogin) {
        btnLogin.addEventListener('click', () => {
            window.location.href = './login/html/login.html';
        });
    }

    if (btnRegistro) {
        btnRegistro.addEventListener('click', () => {
            window.location.href = './login/html/registro.html';
        });
    }
});

