const container = document.getElementById("contenedor-principal");
const tituloFase = document.getElementById("titulo-fase");
const instruccion = document.getElementById("instruccion");
const footer = document.getElementById("footer-ui");
const btnLanzar = document.getElementById("btn-lanzar");
const header = document.getElementById("header-app");

let seleccionados = [];
let turnoDe = "";

const listaEquipos = [
  { nombre: "Rose Devil", jugadores: ["Tony", "Jokker"], logo: "logo1.png" },
  { nombre: "Golden Sex", jugadores: ["Max", "Broken"], logo: "logo2.png" },
  { nombre: "Al-dedillo VC", jugadores: ["Xolo", "Noavae"], logo: "logo3.png" },
  { nombre: "Los Akrtona2", jugadores: ["S3R4X", "MasterKira"], logo: "logo4.png" },
  { nombre: "Crimson Eclipse", jugadores: ["ReyFhantom", "zNyrex "], logo: "logo5.png" },
  { nombre: "Makaco NinjaPelocho", jugadores: ["Iker", "Adri"], logo: "logo6.png" },
  { nombre: "Bloody Fruit", jugadores: ["MrPain 神", "Sandiass21"], logo: "logo7.png" },
  { nombre: "Hijas del Kaos", jugadores: ["Satha", "Kaos"], logo: "logo8.png" },
  { nombre: "Konoha Makaca", jugadores: ["MakaQuillo", "MakaIsla"], logo: "logo9.png" },
  { nombre: "Team Obrikat", jugadores: ["JettDiffs", "EGOFack"], logo: "logo10.png" },
  { nombre: "TETONES: Equipo Nacional de Somalia", jugadores: ["Marrkitosss", "Davv"], logo: "logo11.png" },
  { nombre: "GOATS", jugadores: ["Mica", "Marco"], logo: "logo12.png" },
  { nombre: "SPIDYBOOBS", jugadores: ["Sama", "Potro"], logo: "logo13.png" },
  { nombre: "MUGIWARAS", jugadores: ["Andreloregon", "Jess"], logo: "logo14.png" },
  { nombre: "Miaus", jugadores: ["Kae", "Wilson"], logo: "logo15.png" }
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

// 1. SELECCIÓN DE EQUIPOS
function cargarEquipos() {
    container.innerHTML = '';
    container.className = "grid-equipos";
    tituloFase.textContent = "COPA PRIMATE";
    instruccion.innerHTML = "SELECCIONA 2 EQUIPOS";
    
    listaEquipos.forEach(eq => {
        const div = document.createElement("div");
        div.className = "card-equipo";
        div.innerHTML = `<img src="${eq.logo}" class="equipo-logo"><span class="nombre-equipo">${eq.nombre}</span>`;
        
        div.onclick = () => {
            const index = seleccionados.findIndex(s => s.nombre === eq.nombre);
            if (index !== -1) {
                seleccionados.splice(index, 1);
                div.classList.remove("selected");
            } else if (seleccionados.length < 2) {
                seleccionados.push(eq);
                div.classList.add("selected");
            }
            actualizarBordesSeleccion();
            footer.style.display = (seleccionados.length === 2) ? "flex" : "none";
        };
        container.appendChild(div);
    });
}

function actualizarBordesSeleccion() {
    const allCards = document.querySelectorAll('.card-equipo');
    allCards.forEach(card => {
        const nombre = card.querySelector('.nombre-equipo').textContent;
        const pos = seleccionados.findIndex(s => s.nombre === nombre);
        if (pos === 0) {
            card.style.borderColor = "var(--omen-purple)";
            card.style.boxShadow = "0 0 20px var(--omen-purple)";
        } else if (pos === 1) {
            card.style.borderColor = "var(--omen-cyan)";
            card.style.boxShadow = "0 0 20px var(--omen-cyan)";
        } else {
            card.style.borderColor = "var(--card-border)";
            card.style.boxShadow = "none";
        }
    });
}

// 2. SORTEO (JUSTO 50/50)
btnLanzar.onclick = () => {
    footer.style.display = "none";
    const esCian = Math.random() < 0.5;
    const ganador = esCian ? seleccionados[1] : seleccionados[0];
    const colorMoneda = esCian ? 'var(--omen-cyan)' : 'var(--omen-purple)';

    container.innerHTML = `
        <div style="text-align:center; width:100%">
            <div id="moneda" class="moneda-simple" style="margin: 0 auto;">🐵</div>
            <h1 id="resultado-texto" style="margin-top:40px; font-family:'BertholdBlock'; font-size:3.5rem; color:white; opacity:0">SORTEANDO...</h1>
        </div>
    `;

    const m = document.getElementById("moneda");
    setTimeout(() => {
        m.style.transform = "rotateY(1440deg)";
        m.style.background = colorMoneda;
    }, 100);

    setTimeout(() => {
        const resTxt = document.getElementById("resultado-texto");
        resTxt.innerHTML = `${ganador.nombre.toUpperCase()} EMPIEZA`;
        resTxt.style.opacity = "1";
        // El color ya es blanco por el estilo inyectado arriba
        turnoDe = ganador.nombre;
        container.innerHTML += `<br><button class="btn-valorant" onclick="iniciarVeto()"><span class="btn-content">SIGUIENTE</span></button>`;
    }, 2100);
};

// 3. FASE DE VETO
function iniciarVeto() {
    container.innerHTML = '';
    container.className = "grid-equipos modo-veto";
    tituloFase.textContent = "VETO DE MAPAS";
    actualizarInstruccion();

    poolMapas.forEach(mapa => {
        const card = document.createElement("div");
        card.className = "card-mapa";
        card.style.backgroundImage = `url('${mapa.img}')`;
        card.innerHTML = `<div class="mapa-label">${mapa.n}</div>`;
        card.onclick = () => {
            if (!card.classList.contains("banned")) {
                card.classList.add("banned");
                turnoDe = (turnoDe === seleccionados[0].nombre) ? seleccionados[1].nombre : seleccionados[0].nombre;
                actualizarInstruccion();
                verificarGanador();
            }
        };
        container.appendChild(card);
    });
}

function actualizarInstruccion() {
    instruccion.innerHTML = `<span>${turnoDe.toUpperCase()}</span>`;
}

// 4. PANTALLA FINAL (NEGRO CON RELIEVE BLANCO)
function verificarGanador() {
    const restantes = document.querySelectorAll(".card-mapa:not(.banned)");
    if (restantes.length === 1) {
        const nombreMap = restantes[0].querySelector(".mapa-label").textContent;
        const imgMap = restantes[0].style.backgroundImage;
        
        header.style.display = "none";
        container.innerHTML = '';
        
        const finalScreen = document.createElement("div");
        finalScreen.className = "mapa-full-win";
        finalScreen.style.backgroundImage = imgMap;
        finalScreen.innerHTML = `
            <div style="position:relative; z-index:10001; text-align:center">
                <h2 style="font-family:'BertholdBlock'; font-size:3rem; color:black; text-shadow: 0 0 10px white;">MAPA SELECCIONADO</h2>
                <h1 style="font-family:'BertholdBlock'; font-size:9.5rem; color:black; margin:20px 0; 
                    text-shadow: -2px -2px 0 #fff, 2px -2px 0 #fff, -2px 2px 0 #fff, 2px 2px 0 #fff, 0 0 20px rgba(255,255,255,0.5);">
                    ${nombreMap}
                </h1>
                <button class="btn-valorant" id="btn-soft-reset">
                    <span class="btn-content">NUEVO VETO</span>
                </button>
            </div>
        `;
        document.body.appendChild(finalScreen);
        document.getElementById("btn-soft-reset").onclick = resetSuave;
    }
}

// 5. REINICIO SIN CARGAR PÁGINA
function resetSuave() {
    seleccionados = [];
    turnoDe = "";
    header.style.display = "flex";
    const fs = document.querySelector(".mapa-full-win");
    if (fs) fs.remove();
    cargarEquipos();
}

cargarEquipos();
