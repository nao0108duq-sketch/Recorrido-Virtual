const ladron = document.querySelector(".cursor-ladron");
const objetivos = document.querySelectorAll(".objetivo-huyendo");

if (!(ladron instanceof HTMLElement) || objetivos.length !== 6) {
    throw new Error("No se encontraron todos los objetivos del juego de hurto.");
}

const jugador = { x: -100, y: -100, visible: false };
const entidades = Array.from(objetivos, (elemento) => {
    if (!(elemento instanceof HTMLElement)) {
        throw new Error("No se encontró un corredor del juego de hurto.");
    }

    return {
        elemento,
        x: 0,
        y: 0,
        destinoX: 0,
        destinoY: 0,
        velocidad: 910 + Math.random() * 70,
        atrapado: false
    };
});
const radioCaptura = 48;
let ultimoTiempo = 0;

function elegirDestino(entidad) {
    const limiteX = Math.max(0, window.innerWidth - entidad.elemento.offsetWidth);
    const limiteY = Math.max(0, window.innerHeight - entidad.elemento.offsetHeight);
    entidad.destinoX = Math.random() * limiteX;
    entidad.destinoY = Math.random() * limiteY;
}

function actualizarCursor(evento) {
    jugador.x = evento.clientX;
    jugador.y = evento.clientY;
    jugador.visible = true;
    ladron.style.display = "block";
    ladron.style.transform = `translate(${jugador.x}px, ${jugador.y}px) translate(-20%, -20%)`;
}

function distanciaAlTrayecto(px, py, x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const longitudCuadrada = dx * dx + dy * dy;

    if (longitudCuadrada === 0) {
        return Math.hypot(px - x2, py - y2);
    }

    const proporcion = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / longitudCuadrada));
    return Math.hypot(px - (x1 + proporcion * dx), py - (y1 + proporcion * dy));
}

function atraparObjetivo(entidad) {
    entidad.atrapado = true;
    entidad.elemento.classList.add("atrapado");
}

function animar(tiempo) {
    if (entidades.every((entidad) => entidad.atrapado)) {
        return;
    }

    const delta = ultimoTiempo === 0 ? 0 : Math.min((tiempo - ultimoTiempo) / 1000, 0.04);
    ultimoTiempo = tiempo;

    entidades.forEach((entidad) => {
        if (entidad.atrapado) {
            return;
        }

        const rect = entidad.elemento.getBoundingClientRect();
        const medioAncho = rect.width / 2;
        const medioAlto = rect.height / 2;
        const anteriorX = entidad.x + medioAncho;
        const anteriorY = entidad.y + medioAlto;
        const dx = entidad.destinoX - entidad.x;
        const dy = entidad.destinoY - entidad.y;
        const distancia = Math.hypot(dx, dy);
        const avance = entidad.velocidad * delta;

        if (distancia <= avance || distancia === 0) {
            entidad.x = entidad.destinoX;
            entidad.y = entidad.destinoY;
            elegirDestino(entidad);
        } else {
            entidad.x += (dx / distancia) * avance;
            entidad.y += (dy / distancia) * avance;
        }

        entidad.elemento.style.transform = `translate(${entidad.x}px, ${entidad.y}px)`;

        const centroX = entidad.x + medioAncho;
        const centroY = entidad.y + medioAlto;

        if (
            jugador.visible &&
            distanciaAlTrayecto(jugador.x, jugador.y, anteriorX, anteriorY, centroX, centroY) <= radioCaptura
        ) {
            atraparObjetivo(entidad);
        }
    });

    requestAnimationFrame(animar);
}

window.addEventListener("pointermove", actualizarCursor);
window.addEventListener("pointerleave", () => {
    jugador.visible = false;
    ladron.style.display = "none";
});
window.addEventListener("resize", () => {
    entidades.forEach((entidad) => {
        entidad.x = Math.min(entidad.x, Math.max(0, window.innerWidth - entidad.elemento.offsetWidth));
        entidad.y = Math.min(entidad.y, Math.max(0, window.innerHeight - entidad.elemento.offsetHeight));
        elegirDestino(entidad);
    });
});

entidades.forEach((entidad) => {
    const limiteX = Math.max(0, window.innerWidth - entidad.elemento.offsetWidth);
    const limiteY = Math.max(0, window.innerHeight - entidad.elemento.offsetHeight);
    entidad.x = Math.random() * limiteX;
    entidad.y = Math.random() * limiteY;
    elegirDestino(entidad);
    entidad.elemento.style.transform = `translate(${entidad.x}px, ${entidad.y}px)`;
});
requestAnimationFrame(animar);
