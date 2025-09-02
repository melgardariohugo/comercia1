window.showNotify = function({ msg, type = "info", duration = 3200 }) {
    // Borra notificaciones previas
    console.log("NOTIFY.JS CARGADO EN ESTA PAGINA");

    document.querySelectorAll('.notify-msg').forEach(n => n.remove());

    // Definir íconos SVG según tipo
    let iconSVG = '';
    switch (type) {
        case "success":
        case "ok":
            iconSVG = `<svg width="32" height="32" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="11" stroke="#14e19b" stroke-width="2"/><path d="M8 12l3 3 5-5" stroke="#14e19b" stroke-width="2"/></svg>`;
            break;
        case "error":
            iconSVG = `<svg width="32" height="32" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="11" stroke="#f45a63" stroke-width="2"/><path d="M8 8l8 8M16 8l-8 8" stroke="#f45a63" stroke-width="2"/></svg>`;
            break;
        case "warning":
        case "warn":
            iconSVG = `<svg width="32" height="32" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="11" stroke="#ffd86a" stroke-width="2"/><path d="M12 8v4m0 4h.01" stroke="#ffd86a" stroke-width="2"/></svg>`;
            break;
          case "info":
            iconSVG = `<svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="11" stroke="#1f8fff" stroke-width="2"/>
                <circle cx="12" cy="8" r="1.6" fill="#1f8fff"/>
                <rect x="11.1" y="11" width="1.8" height="6" rx="0.9" fill="#1f8fff"/>
            </svg>`;
            break;
         default:
            iconSVG = `<svg width="32" height="32" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="11" stroke="#1f8fff" stroke-width="2"/><path d="M12 8v4m0 4h.01" stroke="#1f8fff" stroke-width="2"/></svg>`;
            break;

    }

    const box = document.createElement("div");
    box.className = `notify-msg notify-${type}`;
    box.innerHTML = `
        <div class="notify-inner">
            <img src="../../../recursos/logos/dhm-logo.png" class="notify-logo" alt="Logo" />
            <span class="notify-icon">${iconSVG}</span>
            <div class="notify-text">${msg}</div>
            <button class="notify-close" title="Cerrar">&times;</button>
        </div>
    `;
    document.body.appendChild(box);
    // Cierre por botón
    box.querySelector('.notify-close').onclick = () => box.remove();
    // Cierre automático
    let timeout = setTimeout(() => {
        box.classList.add('notify-out');
        setTimeout(() => box.remove(), 450);
    }, duration);

    // Cierre tocando cualquier parte de la notificación
    box.onclick = (e) => {
        if (e.target === box || e.target.classList.contains('notify-inner')) {
            clearTimeout(timeout);
            box.classList.add('notify-out');
            setTimeout(() => box.remove(), 450);
        }
    };

    // Cierre con tecla ESC
    window.onkeydown = (e) => { if (e.key === "Escape") { box.remove(); window.onkeydown = null; } }
};

//MSJ EMERGENTE DE BORRADO CON OPCION SI-NO 
window.showConfirmNotify = function({ msg, onOk, onCancel }) {
    // Borra confirmaciones previas
    document.querySelectorAll('.notify-confirm').forEach(n => n.remove());

    const box = document.createElement("div");
    box.className = `notify-confirm notify-msg notify-warning`;
    box.innerHTML = `
        <div class="notify-inner">
            <img src="../../../recursos/logos/dhm-logo.png" class="notify-logo" alt="Logo" />
            <span class="notify-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="11" stroke="#ffd86a" stroke-width="2"/>
                    <path d="M12 8v4m0 4h.01" stroke="#ffd86a" stroke-width="2"/>
                </svg>
            </span>
            <div class="notify-text">${msg}</div>
            <div style="margin-top:18px;text-align:center;">
                <button class="notify-btn-ok" style="backgraund:blue;">Sí, borrar</button>
                <button class="notify-btn-cancel">Cancelar</button>
            </div>
            <button class="notify-close" title="Cerrar">&times;</button>
        </div>
    `;
    document.body.appendChild(box);

    // Botón OK
    box.querySelector('.notify-btn-ok').onclick = () => {
        box.remove();
        if (typeof onOk === "function") onOk();
    };
    // Botón Cancelar o cerrar
    box.querySelector('.notify-btn-cancel').onclick = () => {
        box.remove();
        if (typeof onCancel === "function") onCancel();
    };
    box.querySelector('.notify-close').onclick = () => {
        box.remove();
        if (typeof onCancel === "function") onCancel();
    };

    // Cierre con tecla ESC
    window.onkeydown = (e) => {
        if (e.key === "Escape") {
            box.remove();
            if (typeof onCancel === "function") onCancel();
            window.onkeydown = null;
        }
    }
};
