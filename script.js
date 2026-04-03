const container = document.getElementById("contenedor-principal");
const tituloFase = document.getElementById("titulo-fase");
const instruccion = document.getElementById("instruccion");
const footer = document.getElementById("footer-ui");
const body = document.body;

let seleccionados = [];
let modoDeJuego = ""; 
let bansMaxA = 0, bansMaxB = 0, bansRealizadosA = 0, bansRealizadosB = 0;
let turnoDe = "A", faseActual = "ban", mapasEscogidos = [];

// LISTA DE LOS 8 CLASIFICADOS
const listaEquipos = [
  { nombre: "Hijas del Kaos", logo: "logo8.png" },
  { nombre: "Rose Devil", logo: "logo1.png" },
  { nombre: "Miaus", logo: "logo15.png" },
  { nombre: "Los Akrtona2", logo: "logo4.png" },
  { nombre: "TETONES: Equipo Nacional de Somalia", logo: "logo11.png" },
  { nombre: "Golden Sex", logo: "logo2.png" },
  { nombre: "Team Obrikat", logo: "logo10.png" },
  { nombre: "Makaco NinjaPelocho", logo: "logo6.png" }
];

const poolMapas = [
    { n: "BIND", img: 'https://static.wikia.nocookie.net/valorant/images/2/23/Loading_Screen_Bind.png' },
    { n: "HAVEN", img: 'https://static.wikia.nocookie.net/valorant/images/7/70/Loading_Screen_Haven.png' },
    { n: "SPLIT", img: 'https://static.wikia.nocookie.net/valorant/images/d/d6/Loading_Screen_Split.png' },
    { n: "ASCENT", img: 'https://static.wikia.nocookie.net/valorant/images/e/e7/Loading_Screen_Ascent.png' },
    { n: "ICEBOX", img: 'https://static.wikia.nocookie.net/valorant/images/1/13/Loading_Screen_Icebox.png' },
    { n: "BREEZE", img: 'https://static.wikia.nocookie.net/valorant/images/1/10/Loading_Screen_Breeze.png' },
    { n: "FRACTURE", img: 'https://static.wikia.nocookie.net/valorant/images/f/fc/Loading_Screen_Fracture.png' },
    { n: "PEARL", img: 'https://static.wikia.nocookie.net/valorant/images/a/af/Loading_Screen_Pearl.png' },
    { n: "LOTUS", img: 'https://static.wikia.nocookie.net/valorant/images/d/d0/Loading_Screen_Lotus.png' },
    { n: "SUNSET", img: 'https://static.wikia.nocookie.net/valorant/images/5/5c/Loading_Screen_Sunset.png' },
    { n: "ABYSS", img: 'https://static.wikia.nocookie.net/valorant/images/6/61/Loading_Screen_Abyss.png' },
    { n: "CORRODE", img: 'https://static.wikia.nocookie.net/valorant/images/6/6f/Loading_Screen_Corrode.png' }
];

function cargarModo() {
    body.classList.remove("fase-activa"); // Centrado total
    
    // NUEVO: Envolvemos los botones en un div con clase 'fade-in'
    container.innerHTML = `
        <div class="fade-in" style="display:flex; gap:20px;">
            <button class="btn-valorant" onclick="setModo('BO3')"><span class="btn-content">SEMIFINAL (BO3)</span></button>
            <button class="btn-valorant" onclick="setModo('BO5')"><span class="btn-content">FINAL (BO5)</span></button>
        </div>
    `;
    tituloFase.textContent = "COPA PRIMATE";
    instruccion.innerHTML = "ELIGE EL FORMATO";
}

function setModo(modo) {
    modoDeJuego = modo;
    bansMaxA = (modo === "BO3") ? 5 : 4;
    bansMaxB = (modo === "BO3") ? 4 : 3;
    body.classList.add("fase-activa"); // Sube el contenido para dejar espacio a la grid
    cargarEquipos();
}

function cargarEquipos() {
    // NUEVO: Envolvemos la grid entera en un div con clase 'fade-in'
    container.innerHTML = '<div class="grid-equipos fade-in" id="grid-eq"></div>';
    const grid = document.getElementById("grid-eq");
    instruccion.innerHTML = "EL PRIMER CLIC ES EL <span>EQUIPO A</span> (Más victorias)";
    
    listaEquipos.forEach(eq => {
        const div = document.createElement("div");
        div.className = "card-equipo"; // La transición suave de borde ya está en el CSS
        div.innerHTML = `<img src="${eq.logo}" class="equipo-logo"><span class="nombre-equipo">${eq.nombre}</span>`;
        div.onclick = () => {
            const index = seleccionados.findIndex(s => s.nombre === eq.nombre);
            if (index !== -1) {
                seleccionados.splice(index, 1);
                div.style.borderColor = "var(--card-border)";
                div.style.boxShadow = "none";
            } else if (seleccionados.length < 2) {
                seleccionados.push(eq);
                div.style.borderColor = (seleccionados.length === 1) ? "var(--omen-purple)" : "var(--omen-cyan)";
                div.style.boxShadow = (seleccionados.length === 1) ? "0 0 15px var(--omen-purple)" : "0 0 15px var(--omen-cyan)";
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
        };
        grid.appendChild(div);
    });
}

function iniciarVeto() {
    footer.style.display = "none";
    footer.classList.remove("fade-in");
    container.innerHTML = '';
    // NUEVO: Clase 'fade-in' para la grid de mapas
    container.className = "modo-veto fade-in";
    tituloFase.textContent = `VETO ${modoDeJuego}`;
    actualizarInstruccion();

    poolMapas.forEach(mapa => {
        const card = document.createElement("div");
        card.className = "card-mapa"; // Las transiciones de baneo están en el CSS
        card.style.backgroundImage = `url('${mapa.img}')`;
        card.innerHTML = `<div class="mapa-label">${mapa.n}</div>`;
        card.onclick = () => gestionarVeto(card, mapa.n);
        container.appendChild(card);
    });
}

function gestionarVeto(card, nombre) {
    // FASE DE BANEOS (Intercalado A-B)
    if (faseActual === "ban" && !card.classList.contains("banned")) {
        // Al añadir la clase, el CSS aplica el borde rojo neón suavemente
        card.classList.add("banned");
        if (turnoDe === "A") { bansRealizadosA++; turnoDe = "B"; }
        else { bansRealizadosB++; turnoDe = "A"; }

        if (bansRealizadosA === bansMaxA && bansRealizadosB === bansMaxB) {
            faseActual = "pick"; 
            turnoDe = "B"; // Según tu esquema, B empieza eligiendo primer mapa
        }
    } 
    // FASE DE PICKS Y LADOS
    else if (faseActual === "pick" && !card.classList.contains("banned") && !card.classList.contains("picked")) {
        card.classList.add("picked");
        const equipoQuePickea = seleccionados[turnoDe === "A" ? 0 : 1].nombre;
        const equipoQueEligeLado = seleccionados[turnoDe === "A" ? 1 : 0].nombre;
        
        card.setAttribute("data-orden", mapasEscogidos.length + 1);

        // Abrir selector de lado para el equipo contrario
        pedirLado(equipoQueEligeLado, (lado) => {
            mapasEscogidos.push({ mapa: nombre, pickea: equipoQuePickea, lado: lado });
            
            // Alternar turno de pick
            turnoDe = (turnoDe === "A") ? "B" : "A";
            
            const limiteMapas = (modoDeJuego === "BO3") ? 2 : 4;
            if (mapasEscogidos.length === limiteMapas) finalizarVeto();
            else actualizarInstruccion();
        });
    }
    actualizarInstruccion();
}

function pedirLado(equipo, callback) {
    const overlay = document.createElement("div");
    // NUEVO: Clase 'fade-in' para el overlay de selección de lado
    overlay.className = "fade-in";
    overlay.style.cssText = "position:fixed; inset:0; background:rgba(0,0,0,0.9); z-index:1000; display:flex; flex-direction:column; justify-content:center; align-items:center;";
    overlay.innerHTML = `
        <h2 style="font-family:'BertholdBlock'; font-size:2.5rem; margin-bottom:20px;">${equipo.toUpperCase()} ELIGE LADO</h2>
        <div>
            <button class="btn-valorant" id="atq"><span class="btn-content">ATACANTE</span></button>
            <button class="btn-valorant" id="def"><span class="btn-content">DEFENSOR</span></button>
        </div>
    `;
    document.body.appendChild(overlay);
    document.getElementById("atq").onclick = () => { overlay.remove(); callback("ATACANTE"); };
    document.getElementById("def").onclick = () => { overlay.remove(); callback("DEFENSOR"); };
}

function finalizarVeto() {
    // El mapa sobrante es el Decider
    const resto = [...document.querySelectorAll(".card-mapa")].find(c => !c.classList.contains("banned") && !c.classList.contains("picked"));
    mapasEscogidos.push({ mapa: resto.querySelector(".mapa-label").textContent, pickea: "DECIDER", lado: "Por definir" });

    body.classList.remove("fase-activa"); // Centrado para el final
    container.className = "";
    // NUEVO: Todo el contenido final se envuelve en un div con 'fade-in'
    container.innerHTML = `
        <div class="fade-in">
            <h1 class="titulo-principal">VETO COMPLETADO</h1>
            <table class="match-table">
                <thead><tr><th>Orden</th><th>Mapa</th><th>Pickeado por</th><th>Lado Rival</th></tr></thead>
                <tbody>
                    ${mapasEscogidos.map((m, i) => `<tr><td>Mapa ${i+1}</td><td style="color:var(--omen-cyan)">${m.mapa}</td><td>${m.pickea}</td><td style="color:var(--valorant-red)">${m.lado}</td></tr>`).join("")}
                </tbody>
            </table>
            <button class="btn-valorant" id="btn-soft-reset"><span class="btn-content">NUEVO VETO</span></button>
        </div>
    `;
    instruccion.innerHTML = "";

    // Asignar la función de reinicio al botón
    document.getElementById("btn-soft-reset").onclick = resetearTodo;
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
    
    // Volvemos a pintar el menú de BO3/BO5
    cargarModo();
}

function actualizarInstruccion() {
    const nombre = seleccionados[turnoDe === "A" ? 0 : 1].nombre;
    instruccion.innerHTML = `${faseActual === "ban" ? "BANEANDO" : "PICKEANDO MAPA"}: <span>${nombre.toUpperCase()}</span>`;
}

cargarModo();
