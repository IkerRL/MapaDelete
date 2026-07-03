const container = document.getElementById("contenedor-principal");
const tituloFase = document.getElementById("titulo-fase");
const instruccion = document.getElementById("instruccion");
const footer = document.getElementById("footer-ui");
const body = document.body;

let seleccionados = [];
let modoDeJuego = "";
let bansMaxA = 0, bansMaxB = 0, bansRealizadosA = 0, bansRealizadosB = 0;
let turnoDe = "A", faseActual = "ban", mapasEscogidos = [];
let turnoContador = 1;

// LISTA DE LOS 12 CLASIFICADOS
const listaEquipos = [
    { nombre: "REHENKARMACIÓN", jugadores: ["Satha", "Makflat"], logo: "logo1.png" },
    { nombre: "Los Akrtona2", jugadores: ["Kira", "Serax"], logo: "logo2.png" },
    { nombre: "Entry Baiters", jugadores: ["レックウザ ", "Militantedelsoe"], logo: "logo5.png" },
    { nombre: "Kizuna", jugadores: ["Alezita", "Sarix"], logo: "logo4.png" },
    { nombre: "Dream Team", jugadores: ["JoKker", "Pepardo"], logo: "logo7.png" },
    { nombre: "Sakura", jugadores: ["Gustavo", "Carlos"], logo: "logo14.png" },
    { nombre: "Soul Resonance", jugadores: ["KrypT", "IAngeil-"], logo: "logo11.png" },
    { nombre: "Thunder Buddies", jugadores: ["Brrokeen", "Pipe"], logo: "logo3.png" },
    { nombre: "Stranger Picks", jugadores: ["TheDori", "Sotomi"], logo: "logo9.png" },
    { nombre: "Chuu-Chuu 100% MAX", jugadores: ["MakaQuillo", "Max"], logo: "logo6.png" },
    { nombre: "M&L’s", jugadores: ["Marru", "Lauliet"], logo: "logo13.png" },
    { nombre: "MARIIKS", jugadores: ["Acid", "Bru"], logo: "logo10.png" }
];

const poolMapas = [
    { n: "ASCENT", img: 'https://static.wikia.nocookie.net/valorant/images/e/e7/Loading_Screen_Ascent.png' },
    { n: "BREEZE", img: 'https://static.wikia.nocookie.net/valorant/images/1/10/Loading_Screen_Breeze.png' },
    { n: "HAVEN", img: 'https://static.wikia.nocookie.net/valorant/images/7/70/Loading_Screen_Haven.png' },
    { n: "LOTUS", img: 'https://static.wikia.nocookie.net/valorant/images/d/d0/Loading_Screen_Lotus.png' },
    { n: "SUMMIT", img: 'https://wiki.playvalorant.com/en-us/images/thumb/Loading_Screen_Summit.png/550px-Loading_Screen_Summit.png?33fee' },
    { n: "SUNSET", img: 'https://static.wikia.nocookie.net/valorant/images/5/5c/Loading_Screen_Sunset.png' },
    { n: "SPLIT", img: 'https://static.wikia.nocookie.net/valorant/images/d/d6/Loading_Screen_Split.png' }
];

function cargarModo() {
    body.classList.remove("fase-activa"); // Centrado total
    document.getElementById("header-app").style.display = "block"; // Asegurar que el header inicial se vea

    // NUEVO: Envolvemos los botones en un div con clase 'fade-in'
    container.className = "main-content";
    container.innerHTML = `
        <div class="format-selection fade-in">
            <div class="format-card" onclick="setModo('BO3')">
                <h2>BO3</h2>
                <p>SEMIFINAL</p>
            </div>
            <div class="format-card" onclick="setModo('BO5')">
                <h2>BO5</h2>
                <p>GRAN FINAL</p>
            </div>
        </div>
    `;
    tituloFase.textContent = "COPA PRIMATE";
    instruccion.innerHTML = "ELIGE EL FORMATO";
    if (typeof broadcastState === 'function') broadcastState();
}

function setModo(modo) {
    modoDeJuego = modo;
    bansMaxA = (modo === "BO3") ? 2 : 1;
    bansMaxB = (modo === "BO3") ? 2 : 1;
    body.classList.add("fase-activa"); // Sube el contenido para dejar espacio a la grid
    cargarEquipos();
    if (typeof broadcastState === 'function') broadcastState();
}

function cargarEquipos() {
    // NUEVO: Envolvemos la grid entera en un div con clase 'fade-in'
    container.innerHTML = '<div class="grid-equipos fade-in" id="grid-eq"></div>';
    const grid = document.getElementById("grid-eq");
    instruccion.innerHTML = "EL PRIMER CLIC ES EL <span>EQUIPO A</span> (Más victorias)";

    listaEquipos.forEach((eq, idx) => {
        const div = document.createElement("div");
        div.className = "card-equipo stagger-enter";
        div.style.animationDelay = `${idx * 0.05}s`;
        div.innerHTML = `
            <img src="${eq.logo}" class="equipo-logo">
            <div class="equipo-info">
                <span class="nombre-equipo">${eq.nombre}</span>
            </div>
        `;
        div.onclick = () => {
            const index = seleccionados.findIndex(s => s.nombre === eq.nombre);
            if (index !== -1) {
                seleccionados.splice(index, 1);
                div.style.background = "rgba(15, 15, 30, 0.4)";
                div.style.borderColor = "rgba(255, 255, 255, 0.1)";
                div.style.boxShadow = "none";
            } else if (seleccionados.length < 2) {
                seleccionados.push(eq);
                div.style.background = "rgba(20, 20, 30, 0.8)";
                div.style.borderColor = (seleccionados.length === 1) ? "var(--omen-cyan)" : "var(--valorant-red)";
                div.style.boxShadow = (seleccionados.length === 1) ? "0 0 20px rgba(95, 208, 255, 0.3)" : "0 0 20px rgba(255, 70, 85, 0.3)";
            }

            if (seleccionados.length === 2) {
                footer.style.display = "flex";
                // NUEVO: Añadimos clase fade-in al footer cuando aparece
                footer.classList.add("fade-in");
                document.getElementById("btn-lanzar").onclick = iniciarVeto;
            } else {
                footer.style.display = "none";
                footer.classList.remove("fade-in");
            }
            if (typeof broadcastState === 'function') broadcastState();
        };
        grid.appendChild(div);
    });
}

function iniciarVeto() {
    footer.style.display = "none";
    footer.classList.remove("fade-in");
    document.getElementById("header-app").style.display = "none"; // Ocultar header original

    // Contenedor principal asume la clase de layout del veto
    container.className = "veto-layout fade-in";
    turnoContador = 1;

    const eqA = seleccionados[0];
    const eqB = seleccionados[1];

    container.innerHTML = `
        <header class="veto-top-header">
            <div class="veto-team-a">
                <img src="${eqA.logo}" alt="${eqA.nombre}">
                <div class="team-name">
                    <h2>${eqA.nombre.toUpperCase()}</h2>
                </div>
            </div>
            
            <div class="veto-status-center">
                <div class="veto-timer">48</div>
                <div class="veto-action-text">VOTAR MAPA</div>
            </div>
            
            <div class="veto-team-b">
                <div class="team-name" style="text-align: right;">
                    <h2>${eqB.nombre.toUpperCase()}</h2>
                </div>
                <img src="${eqB.logo}" alt="${eqB.nombre}">
            </div>
        </header>
        
        <div class="veto-main-area">
            <aside class="veto-sidebar" id="veto-sidebar">
                <!-- Historial irá aquí -->
            </aside>
            
            <div class="veto-center-container">
                <div class="veto-turn-banner" id="veto-turn-banner">
                    TURNO DE ${eqA.nombre.toUpperCase()}
                    <span id="veto-turn-tag">BLOQUEANDO MAPA</span>
                </div>
                <div class="modo-veto" id="modo-veto-grid">
                    <!-- Mapas irán aquí -->
                </div>
            </div>
        </div>
    `;

    const grid = document.getElementById("modo-veto-grid");
    poolMapas.forEach(mapa => {
        const card = document.createElement("div");
        card.className = "card-mapa";
        card.style.backgroundImage = `url('${mapa.img}')`;
        card.innerHTML = `<div class="mapa-label">${mapa.n}</div>`;
        card.onclick = () => gestionarVeto(card, mapa);
        grid.appendChild(card);
    });

    actualizarBannerTurno();
    if (typeof broadcastState === 'function') broadcastState();
}

function agregarAlHistorial(equipo, accion, mapa, turno) {
    const sidebar = document.getElementById("veto-sidebar");
    const num = turnoContador.toString().padStart(2, '0');
    turnoContador++;

    let teamClass = "decider";
    if (turno === "A") teamClass = "a";
    else if (turno === "B") teamClass = "b";

    const div = document.createElement("div");
    div.className = `history-item fade-in team-${teamClass}`;
    div.innerHTML = `
        <div class="hist-header">
            <span class="hist-num">${num}</span>
            <span class="hist-team">${equipo.nombre}</span>
            <span class="hist-action">${accion}</span>
        </div>
        <div class="hist-map" style="background-image: url('${mapa.img}')" data-mapname="${mapa.n}"></div>
    `;
    sidebar.appendChild(div);
    sidebar.scrollTop = sidebar.scrollHeight; // Scroll to bottom
}

function actualizarBannerTurno() {
    const banner = document.getElementById("veto-turn-banner");
    if (!banner) return;

    const tag = document.getElementById("veto-turn-tag");
    const equipo = seleccionados[turnoDe === "A" ? 0 : 1];

    banner.childNodes[0].textContent = `TURNO DE ${equipo.nombre.toUpperCase()} `;
    tag.textContent = faseActual === "ban" ? "BLOQUEANDO MAPA" : "ELIGIENDO MAPA";
    tag.style.background = turnoDe === "A" ? "var(--omen-cyan)" : "var(--valorant-red)";
    tag.style.color = turnoDe === "A" ? "black" : "white";
}

function gestionarVeto(card, mapa) {
    // FASE DE BANEOS (Intercalado A-B)
    if (faseActual === "ban" && !card.classList.contains("banned")) {
        card.classList.add("banned");

        const equipoActual = seleccionados[turnoDe === "A" ? 0 : 1];
        agregarAlHistorial(equipoActual, "BLOQUEA MAPA", mapa, turnoDe);

        if (turnoDe === "A") { bansRealizadosA++; turnoDe = "B"; }
        else { bansRealizadosB++; turnoDe = "A"; }

        if (bansRealizadosA === bansMaxA && bansRealizadosB === bansMaxB) {
            faseActual = "pick";
            turnoDe = "B"; // Según tu esquema, B empieza eligiendo primer mapa
        }
        actualizarBannerTurno();
        if (typeof broadcastState === 'function') broadcastState();
    }
    // FASE DE PICKS Y LADOS
    else if (faseActual === "pick" && !card.classList.contains("banned") && !card.classList.contains("picked")) {
        card.classList.add("picked");
        const equipoQuePickea = seleccionados[turnoDe === "A" ? 0 : 1];
        const equipoQueEligeLado = seleccionados[turnoDe === "A" ? 1 : 0];

        card.setAttribute("data-orden", mapasEscogidos.length + 1);

        agregarAlHistorial(equipoQuePickea, "ELIGE MAPA", mapa, turnoDe);

        // Abrir selector de lado para el equipo contrario
        pedirLado(equipoQueEligeLado.nombre, (lado) => {
            mapasEscogidos.push({
                mapa: mapa,
                pickea: equipoQuePickea,
                eligeLado: equipoQueEligeLado,
                ladoRival: lado // "ATACANTE" o "DEFENSOR"
            });

            // Alternar turno de pick
            turnoDe = (turnoDe === "A") ? "B" : "A";

            const limiteMapas = (modoDeJuego === "BO3") ? 2 : 4;
            if (mapasEscogidos.length === limiteMapas) finalizarVeto();
            else actualizarBannerTurno();
            if (typeof broadcastState === 'function') broadcastState();
        });
    }
}

function pedirLado(equipo, callback) {
    const overlay = document.createElement("div");
    overlay.className = "glass-overlay fade-in";
    overlay.innerHTML = `
        <div class="glass-card">
            <h2 style="font-family:'BertholdBlock'; font-size:3rem; margin-bottom:10px; text-transform:uppercase;">${equipo}</h2>
            <p style="font-family:'Inter', sans-serif; font-size:1.2rem; color:var(--omen-cyan); margin-bottom:30px; letter-spacing:2px;">ELIGE EL LADO INICIAL</p>
            <div style="display:flex; gap:20px; justify-content:center;">
                <button class="btn-valorant" id="atq"><span class="btn-content" style="background:#ff4655;">ATACANTE</span></button>
                <button class="btn-valorant" id="def"><span class="btn-content" style="background:#00ffcc; color:black;">DEFENSOR</span></button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);
    document.getElementById("atq").onclick = () => { overlay.remove(); callback("ATACANTE"); };
    document.getElementById("def").onclick = () => { overlay.remove(); callback("DEFENSOR"); };
}

function finalizarVeto() {
    // El mapa sobrante es el Decider
    const restoCard = [...document.querySelectorAll(".card-mapa")].find(c => !c.classList.contains("banned") && !c.classList.contains("picked"));
    const mapaDeciderNombre = restoCard.querySelector(".mapa-label").textContent;
    const mapaDeciderObjeto = poolMapas.find(m => m.n === mapaDeciderNombre);

    agregarAlHistorial({ nombre: "DECIDER" }, "MAPA FINAL", mapaDeciderObjeto, "DECIDER");

    mapasEscogidos.push({
        mapa: mapaDeciderObjeto,
        pickea: { nombre: "DECIDER", logo: "" },
        eligeLado: { nombre: "", logo: "" },
        ladoRival: "Decider"
    });

    body.classList.remove("fase-activa"); // Centrado para el final
    document.getElementById("header-app").style.display = "block"; // Mostrar header

    let htmlCards = mapasEscogidos.map((m, i) => {
        const isDecider = (i === mapasEscogidos.length - 1);
        const mapHeader = isDecider ? "DECIDER" : `MAPA ${i + 1}`;

        let sideHtml = '';
        if (isDecider) {
            sideHtml = `
                <div class="side-row decider">
                    <div class="side-row-team"><span class="side-row-role">LADOS POR SORTEO/COINFLIP</span></div>
                </div>
            `;
        } else {
            let atacante, defensor;
            if (m.ladoRival === "ATACANTE") {
                atacante = m.eligeLado;
                defensor = m.pickea;
            } else {
                defensor = m.eligeLado;
                atacante = m.pickea;
            }

            sideHtml = `
                <div class="side-row attack">
                    <div class="side-row-team"><img src="${atacante.logo}"> <span>${atacante.nombre}</span></div>
                    <span class="side-row-role">ATACA</span>
                </div>
                <div class="side-row defense">
                    <div class="side-row-team"><img src="${defensor.logo}"> <span>${defensor.nombre}</span></div>
                    <span class="side-row-role">DEFIENDE</span>
                </div>
            `;
        }

        const pickHtml = isDecider ? "" : `
            <div class="final-map-pick-info">
                <span>Elegido por</span>
                <img src="${m.pickea.logo}">
                <strong>${m.pickea.nombre}</strong>
            </div>
        `;

        return `
            <div class="final-map-card stagger-enter" style="background-image: url('${m.mapa.img}'); animation-delay: ${i * 0.2}s">
                <div class="final-map-content">
                    <div>
                        <div class="final-map-header">${mapHeader}</div>
                        <div class="final-map-name">${m.mapa.n}</div>
                        ${pickHtml}
                    </div>
                    <div class="final-sides-container">
                        ${sideHtml}
                    </div>
                </div>
            </div>
        `;
    }).join("");

    container.className = "main-content fade-in";
    container.innerHTML = `
        <div style="width: 100%; display: flex; flex-direction: column; align-items: center;">
            <h1 class="titulo-principal">VETO COMPLETADO</h1>
            <div class="final-maps-container">
                ${htmlCards}
            </div>
            <button class="btn-valorant" id="btn-soft-reset" style="margin-top: 50px;"><span class="btn-content">NUEVO VETO</span></button>
        </div>
    `;
    instruccion.innerHTML = "";

    // Asignar la función de reinicio al botón
    document.getElementById("btn-soft-reset").onclick = resetearTodo;
    if (typeof broadcastState === 'function') broadcastState();
}

// Limpia todas las variables y vuelve al menú de inicio
function resetearTodo() {
    seleccionados = [];
    modoDeJuego = "";
    bansMaxA = 0; bansMaxB = 0;
    bansRealizadosA = 0; bansRealizadosB = 0;
    turnoDe = "A";
    faseActual = "ban";
    mapasEscogidos = [];
    turnoContador = 1;

    // Volvemos a pintar el menú de BO3/BO5
    cargarModo();
    if (typeof broadcastState === 'function') broadcastState();
}

cargarModo();

// ================================================================
// SINCRONIZACIÓN EN VIVO (MQTT via HiveMQ)
// ================================================================

let mqttClient = null;
let mqttTopic = '';
let isApplyingSyncState = false;
const MSG_HISTORIAL = new Set();
window.isPantalla = false;

// Elementos de la UI
let syncToggleBtn, syncPanel, syncPulse, syncStatusBadge, syncRoomInput;
let btnSyncConnect, btnSyncCopyLink, btnSyncDisconnect, syncConnectedActions;
let syncBrokerInput, syncTopicInput;

// Generar código de sala aleatorio
function generateRandomRoom() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'VETO-';
    for (let i = 0; i < 5; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

window.addEventListener('load', () => {
    // Inicializar elementos de DOM cuando estamos seguros de que existe
    syncToggleBtn = document.getElementById('syncToggleBtn');
    syncPanel = document.getElementById('syncPanel');
    syncPulse = document.getElementById('syncPulse');
    syncStatusBadge = document.getElementById('syncStatusBadge');
    syncRoomInput = document.getElementById('syncRoomInput');
    btnSyncConnect = document.getElementById('btnSyncConnect');
    btnSyncCopyLink = document.getElementById('btnSyncCopyLink');
    btnSyncDisconnect = document.getElementById('btnSyncDisconnect');
    syncConnectedActions = document.getElementById('syncConnectedActions');
    syncBrokerInput = document.getElementById('syncBrokerInput');
    syncTopicInput = document.getElementById('syncTopicInput');

    // Toggle panel
    if (syncToggleBtn) {
        syncToggleBtn.addEventListener('click', () => {
            if (syncPanel) syncPanel.classList.toggle('active');
        });
    }

    document.addEventListener('click', (e) => {
        const monkeyRight = document.querySelector('.monkey-right');
        const isMonkeyClick = monkeyRight && monkeyRight.contains(e.target);
        if (!isMonkeyClick && syncPanel && !syncPanel.contains(e.target) && syncToggleBtn && !syncToggleBtn.contains(e.target)) {
            syncPanel.classList.remove('active');
        }
    });

    // Auto-rellenar sala desde URL o generar una nueva
    const urlParams = new URLSearchParams(window.location.search);
    const roomParam = urlParams.get('room');
    const isPantalla = urlParams.get('pantalla') === 'true';
    const isAdmin = urlParams.get('admin') === 'true';

    // Determinar el rol/modo de forma dinámica
    if (roomParam) {
        window.roomName = roomParam;

        // Si tiene sala por URL pero no tiene &admin=true, por defecto actúa como Pantalla
        if (!isAdmin) {
            window.isPantalla = true;
            document.body.classList.add('pantalla-mode');

            // Si es el modo de pantalla limpia de OBS, añadimos obs-mode para desactivar interacciones
            if (isPantalla) {
                document.body.classList.add('obs-mode');
            } else {
                // Si no es OBS limpio, mostramos el botón de admin (si existe en el DOM)
                const adminBtn = document.getElementById('admin-btn');
                if (adminBtn) adminBtn.style.display = 'block';
            }
        }

        // Conectar automáticamente a la sala
        if (syncRoomInput) syncRoomInput.value = roomParam;
        setTimeout(() => connectMQTT(roomParam), 600);
    } else {
        // Si abrimos la URL raíz sin parámetros, es modo Admin por defecto y genera código de sala
        const code = generateRandomRoom();
        if (syncRoomInput) syncRoomInput.value = code;
        window.roomName = code;
        window.history.replaceState({}, '', `?room=${code}&admin=true`);
        connectMQTT(code);
    }

    // ── Botones del panel (listeners dentro de load) ────────────────────────────────────────────
    if (btnSyncConnect) {
        btnSyncConnect.addEventListener('click', () => {
            const room = syncRoomInput ? syncRoomInput.value.trim() : (window.roomName || '');
            if (!room) { alert('Introduce un código de sala válido.'); return; }
            connectMQTT(room);
        });
    }

    if (btnSyncDisconnect) {
        btnSyncDisconnect.addEventListener('click', () => {
            if (mqttClient) { mqttClient.end(true); mqttClient = null; }
            updateConnectionStatus('disconnected');
        });
    }

    if (btnSyncCopyLink) {
        btnSyncCopyLink.addEventListener('click', () => {
            const room = syncRoomInput ? syncRoomInput.value.trim() : (window.roomName || '');
            const shareUrl = `${window.location.origin}${window.location.pathname}?room=${encodeURIComponent(room)}`;
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(shareUrl).then(() => {
                    const orig = btnSyncCopyLink.innerHTML;
                    btnSyncCopyLink.innerHTML = '✓ ¡COPIADO!';
                    setTimeout(() => { btnSyncCopyLink.innerHTML = orig; }, 2000);
                }).catch(() => alert(`Copia este enlace: ${shareUrl}`));
            } else {
                prompt('Pulsa Ctrl+C o Cmd+C para copiar el enlace:', shareUrl);
            }
        });
    }
});

// Función para abrir el panel de control en un popup
window.abrirPanel = function() {
    const rName = window.roomName || (syncRoomInput ? syncRoomInput.value : '');
    const url = `${window.location.origin}${window.location.pathname}?room=${encodeURIComponent(rName)}&admin=true`;
    console.log("[Antigravity] abrirPanel called with URL:", url);
    window.open(url, 'PanelControl', 'width=1100,height=850,resizable=yes');
};

window.mostrarPanelSync = function() {
    if (window.isPantalla) return;
    if (syncPanel) syncPanel.classList.toggle('active');
};

// Actualizar UI de estado de conexión
function updateConnectionStatus(status) {
    if (syncPulse) syncPulse.className = 'pulse-icon';
    if (syncStatusBadge) syncStatusBadge.className = 'status-badge';

    if (status === 'disconnected') {
        if (syncPulse) syncPulse.classList.add('red');
        if (syncStatusBadge) {
            syncStatusBadge.classList.add('status-disconnected');
            syncStatusBadge.textContent = 'DESCONECTADO';
        }
        if (btnSyncConnect) btnSyncConnect.style.display = 'inline-block';
        if (syncConnectedActions) syncConnectedActions.style.display = 'none';
        if (syncRoomInput) syncRoomInput.disabled = false;
    } else if (status === 'connecting') {
        if (syncPulse) syncPulse.classList.add('yellow');
        if (syncStatusBadge) {
            syncStatusBadge.classList.add('status-connecting');
            syncStatusBadge.textContent = 'CONECTANDO...';
        }
        if (btnSyncConnect) btnSyncConnect.style.display = 'none';
        if (syncConnectedActions) syncConnectedActions.style.display = 'none';
        if (syncRoomInput) syncRoomInput.disabled = true;
    } else if (status === 'connected') {
        if (syncPulse) syncPulse.classList.add('green');
        if (syncStatusBadge) {
            syncStatusBadge.classList.add('status-connected');
            syncStatusBadge.textContent = `SALA: ${syncRoomInput ? syncRoomInput.value : (window.roomName || '')}`;
        }
        if (btnSyncConnect) btnSyncConnect.style.display = 'none';
        if (syncConnectedActions) syncConnectedActions.style.display = 'flex';
        if (syncRoomInput) syncRoomInput.disabled = true;
    }
}

// Conectar al broker MQTT
function connectMQTT(roomName) {
    if (mqttClient) {
        mqttClient.end(true);
        mqttClient = null;
    }

    const broker = (syncBrokerInput?.value.trim()) || 'wss://broker.hivemq.com:8884/mqtt';
    const topicBase = (syncTopicInput?.value.trim()) || 'copa_primate_veto';
    mqttTopic = `${topicBase}/${roomName.trim()}`;

    console.log(`Conectando a MQTT broker: ${broker} | Tema: ${mqttTopic}`);
    updateConnectionStatus('connecting');

    mqttClient = mqtt.connect(broker, {
        clientId: 'veto_' + Math.random().toString(16).slice(2, 10),
        clean: true,
        reconnectPeriod: 3000,
    });

    mqttClient.on('connect', () => {
        console.log(`Conectado a MQTT en sala: ${roomName}`);
        updateConnectionStatus('connected');
        mqttClient.subscribe(mqttTopic, { qos: 0 });
        // Pedir estado actual a otros clientes conectados
        publishMQTT({ type: 'REQUEST_STATE' });
    });

    mqttClient.on('message', (topic, payload) => {
        try {
            const msg = JSON.parse(payload.toString());

            // Deduplicar: ignorar mensajes propios
            if (msg._id && MSG_HISTORIAL.has(msg._id)) return;

            console.log('Mensaje MQTT recibido:', msg.type);

            if (msg.type === 'REQUEST_STATE') {
                // Responder con el estado si tenemos algo
                if (!window.isPantalla) broadcastState();
            } else if (msg.type === 'STATE_UPDATE') {
                isApplyingSyncState = true;
                aplicarEstado(msg.state);
                isApplyingSyncState = false;
            }
        } catch (e) {
            console.error('Error al procesar mensaje MQTT:', e);
        }
    });

    mqttClient.on('reconnect', () => {
        console.log('Reconectando a MQTT...');
        updateConnectionStatus('connecting');
    });

    mqttClient.on('error', (err) => {
        console.error('Error MQTT:', err);
        updateConnectionStatus('disconnected');
    });

    mqttClient.on('close', () => {
        console.log('Conexión MQTT cerrada');
        updateConnectionStatus('disconnected');
    });
}

// Publicar mensaje en el tema de la sala
function publishMQTT(msg) {
    if (!mqttClient || !mqttClient.connected) return;
    const id = Math.random().toString(36).slice(2, 10);
    msg._id = id;
    MSG_HISTORIAL.add(id);
    // Limpiar historial para no acumular indefinidamente
    if (MSG_HISTORIAL.size > 200) {
        const first = MSG_HISTORIAL.values().next().value;
        MSG_HISTORIAL.delete(first);
    }
    mqttClient.publish(mqttTopic, JSON.stringify(msg), { qos: 0, retain: false });
}

// Serializar y emitir el estado completo del torneo
function broadcastState() {
    if (isApplyingSyncState || window.isPantalla) return;
    if (!mqttClient || !mqttClient.connected) return;

    console.log('Publicando estado via MQTT...');

    const state = {
        modoDeJuego,
        seleccionados,
        bansMaxA, bansMaxB,
        bansRealizadosA, bansRealizadosB,
        turnoDe, faseActual,
        mapasEscogidos, turnoContador,
        
        containerHTML: document.getElementById('contenedor-principal').innerHTML,
        containerClass: document.getElementById('contenedor-principal').className,
        footerDisplay: document.getElementById('footer-ui').style.display,
        instruccionHTML: document.getElementById('instruccion').innerHTML,
        tituloFaseText: document.getElementById('titulo-fase').textContent,
        bodyFaseActiva: document.body.classList.contains('fase-activa'),
        headerDisplay: document.getElementById('header-app').style.display
    };

    publishMQTT({ type: 'STATE_UPDATE', state });
}

// Aplicar estado recibido de la red
function aplicarEstado(state) {
    if (!state) return;
    console.log('Aplicando estado recibido de red...');

    modoDeJuego = state.modoDeJuego;
    seleccionados = state.seleccionados || [];
    bansMaxA = state.bansMaxA;
    bansMaxB = state.bansMaxB;
    bansRealizadosA = state.bansRealizadosA;
    bansRealizadosB = state.bansRealizadosB;
    turnoDe = state.turnoDe;
    faseActual = state.faseActual;
    mapasEscogidos = state.mapasEscogidos || [];
    turnoContador = state.turnoContador;

    document.getElementById('contenedor-principal').className = state.containerClass || '';
    document.getElementById('contenedor-principal').innerHTML = state.containerHTML || '';
    document.getElementById('footer-ui').style.display = state.footerDisplay || 'none';
    document.getElementById('instruccion').innerHTML = state.instruccionHTML || '';
    document.getElementById('titulo-fase').textContent = state.tituloFaseText || '';
    
    if (state.bodyFaseActiva) document.body.classList.add('fase-activa');
    else document.body.classList.remove('fase-activa');
    
    const headerApp = document.getElementById('header-app');
    if (headerApp) headerApp.style.display = state.headerDisplay || 'block';

    const overlay = document.querySelector(".glass-overlay");
    if (overlay) overlay.remove();
}

// Fallback compatible con el onclick HTML de index.html original
window.copiarEnlace = function() {
    const room = (syncRoomInput && syncRoomInput.value.trim()) ? syncRoomInput.value.trim() : (window.roomName || '');
    const shareUrl = `${window.location.origin}${window.location.pathname}?room=${encodeURIComponent(room)}`;
    const span = document.getElementById('btnSyncCopyLinkSpan');
    
    const orig = span ? span.innerHTML : '';

    const successUI = () => {
        if (span) {
            span.innerHTML = '✓ ¡COPIADO!';
            span.style.background = 'var(--omen-cyan)';
            span.style.color = 'black';
            setTimeout(() => { 
                span.innerHTML = orig; 
                span.style.background = '';
                span.style.color = 'white';
            }, 2000);
        }
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(shareUrl).then(successUI).catch(err => {
            prompt('Pulsa Ctrl+C o Cmd+C para copiar el enlace:', shareUrl);
        });
    } else {
        prompt('Pulsa Ctrl+C o Cmd+C para copiar el enlace:', shareUrl);
    }
};
