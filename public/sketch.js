// Conexión al servidor Socket.IO
const socket = io();

let etiquetas = [
  "Byung-Chul Han",
  "Robert Nozick",
  "Hannah Arendt",
  "Angela Davis",
  "Pepe Mujica"
];

let frasesPorAutor = [
  [
    "cuando te explotas a ti mismo en nombre de la libertad, el sistema ya no necesita un amo.",
    "la autoexplotación disfrazada de autonomía es más eficiente que cualquier forma de control externo.",
    "ser tu propio jefe puede es una forma de dominación más perversa: la libertad como obligación de rendimiento."
  ],
  [
    "ser tu propio jefe es actuar según tus propias decisiones, mientras no violes los derechos de otros.",
    "si eliges libremente cómo y cuándo trabajar, estás ejerciendo tu autonomía individual.",
    "Tener un negocio propio es una expresión legítima de libertad si nace de tu elección."
  ],
  [
    "la libertad no consiste en ser tu propio jefe, sino en actuar juntos por un mundo común.",
    "ser tu propio jefe cobra sentido cuando puedes participar en lo público, no solo en lo privado.",
    "la libertad implica actuar con otros, no solo para uno mismo: es libertad como iniciativa compartida."
  ],
  [
    "no todos pueden ser sus propios jefes si el sistema excluye: la libertad debe ser colectiva.",
    "ser tu propio jefe puede ser una trampa si no cuestionas las condiciones de desigualdad que lo hacen necesario.",
    "apoyarnos entre quienes no tienen jefe por elección sino por precariedad es un acto de solidaridad real."
  ],
  [
    "no es más libre quien más tiene, sino quien menos necesita: ser tu propio jefe empieza por ahí.",
    "si ser tu propio jefe te hace esclavo del reloj, ¿para qué sirve la libertad?",
    "la verdadera libertad no está en tener un negocio, sino en tener tiempo para vivir."
  ]
];

let colores = [];
let alturas = [0, 0, 0, 0, 0];
let contadores = [0, 0, 0, 0, 0];
let palabrasConstruidas = [];

let opcionActual = -1;
let indiceFrasePorOpcion = [-1, -1, -1, -1, -1];
let escribiendo = false;
let textoActual = "";
let indicePalabra = 0;
let tiempoUltimaPalabra = 0;
let intervaloPalabra = 300;

let puntosVoto = [];
let yaEstaFullscreen = false;

function setup() {
  createCanvas(windowWidth, windowHeight);
  rectMode(CORNER);
  textFont('IBM Plex Mono, monospace');
  textAlign(LEFT, TOP);
  textSize(36);

  colores = [
    color(255, 100, 100),
    color(255, 180, 100),
    color(150),
    color(100, 200, 255),
    color(100, 150, 255)
  ];

  // Escuchar actualizaciones de votos desde el servidor
  socket.on('voto-actualizado', (contadoresActualizados) => {
    contadores = contadoresActualizados;
  });
}

function draw() {
  background(250);

  fill(30);
  textAlign(CENTER, CENTER);
  textSize(66);
  textStyle(BOLD);
  text("¿Podemos ser nuestros propios jefes?", width / 2, height * 0.1 + 40);

  let baseY = height * 0.82;
  let margenLateral = width * 0.1;
  let espacioDisponible = width - 2 * margenLateral;
  let espacioEntreBarras = 8;
  let anchoBarra = (espacioDisponible - espacioEntreBarras * (etiquetas.length - 1)) / etiquetas.length;
  let barraAlturaMax = height * 0.45;

  let maxVotos = max(contadores);

  for (let i = 0; i < etiquetas.length; i++) {
    let proporcion = maxVotos > 0 ? contadores[i] / maxVotos : 0;
    let alturaObjetivo = map(proporcion, 0, 1, 0, barraAlturaMax);
    alturas[i] = lerp(alturas[i], alturaObjetivo, 0.1);
    let x = margenLateral + i * (anchoBarra + espacioEntreBarras);

    // Sombra
    noStroke();
    fill(0, 20);
    rect(x + 4, baseY - alturas[i] + 4, anchoBarra, alturas[i], 8);

    // Barra
    fill(colores[i]);
    stroke(0, 40);
    strokeWeight(1);
    rect(x, baseY - alturas[i], anchoBarra, alturas[i], 8);

    // Contador
    noStroke();
    fill(30);
    textSize(18);
    textAlign(CENTER, CENTER);
    text(contadores[i], x + anchoBarra / 2, baseY - alturas[i] - 25);

    // Botón nombre
    let textoY = baseY + 10;
    fill(colores[i]);
    noStroke();
    rect(x, textoY, anchoBarra, 80, 8);

    fill(255);
    textSize(30);
    textStyle(BOLD);
    textAlign(CENTER, CENTER);

    let partes = etiquetas[i].split(" ");
    let primeraLinea = partes.slice(0, Math.ceil(partes.length / 2)).join(" ");
    let segundaLinea = partes.slice(Math.ceil(partes.length / 2)).join(" ");

    text(primeraLinea, x + anchoBarra / 2, textoY + 27.5);
    text(segundaLinea, x + anchoBarra / 2, textoY + 57.5);
  }

  // Mostrar frase
  if (opcionActual >= 0) {
    let autor = etiquetas[opcionActual].replace(/\*\*/g, "");

    fill(30);
    textSize(25);
    textStyle(BOLD);
    textAlign(LEFT, TOP);

    let xStart = margenLateral;
    let yStart = height * 0.22;
    let colWidth = espacioDisponible;
    let lineHeight = 30;
    let maxHeight = height * 0.45;

    let fraseIntro = autor + " diría que ";
    let palabrasIntro = fraseIntro.split(" ");
    let palabrasRespuesta = palabrasConstruidas;

    let espacio = textWidth(" ");
    let y = yStart;
    let x = xStart;

    textStyle(BOLD);
    for (let i = 0; i < palabrasIntro.length; i++) {
      let w = textWidth(palabrasIntro[i]);
      if (x + w > xStart + colWidth) {
        x = xStart;
        y += lineHeight;
      }
      text(palabrasIntro[i], x, y);
      x += w + espacio;
    }

    textStyle(NORMAL);
    for (let i = 0; i < palabrasRespuesta.length; i++) {
      let w = textWidth(palabrasRespuesta[i]);
      if (x + w > xStart + colWidth) {
        x = xStart;
        y += lineHeight;
      }
      text(palabrasRespuesta[i], x, y);
      x += w + espacio;
      if (y > yStart + maxHeight) break;
    }
  }

  // Efecto visual de puntos de voto
  for (let i = puntosVoto.length - 1; i >= 0; i--) {
    let p = puntosVoto[i];
    noStroke();
    fill(red(p.color), green(p.color), blue(p.color), p.alpha);
    ellipse(p.x, p.y, 16);
    p.alpha -= 4;
    p.y -= 0.5;
    if (p.alpha <= 0) {
      puntosVoto.splice(i, 1);
    }
  }

  actualizarTexto();
}

function mousePressed() {
  if (!yaEstaFullscreen) {
    fullscreen(true);
    yaEstaFullscreen = true;
  }
  if (escribiendo) return;
  manejarClic(mouseX, mouseY);
}

function touchStarted() {
  if (!yaEstaFullscreen) {
    fullscreen(true);
    yaEstaFullscreen = true;
  }
  if (escribiendo) return;
  if (touches.length > 0) {
    manejarClic(touches[0].x, touches[0].y);
  }
  return false;
}

function manejarClic(xPos, yPos) {
  let margenLateral = width * 0.1;
  let espacioDisponible = width - 2 * margenLateral;
  let espacioEntreBarras = 8;
  let anchoBarra = (espacioDisponible - espacioEntreBarras * (etiquetas.length - 1)) / etiquetas.length;
  let baseY = height * 0.82;

  for (let i = 0; i < etiquetas.length; i++) {
    let xStart = margenLateral + i * (anchoBarra + espacioEntreBarras);
    let botonY = baseY + 10;
    let botonAltura = 80;

    if (
      (xPos > xStart && xPos < xStart + anchoBarra && yPos > baseY - alturas[i] && yPos < baseY) ||
      (xPos > xStart && xPos < xStart + anchoBarra && yPos > botonY && yPos < botonY + botonAltura)
    ) {
      registrarVoto(i, xPos, yPos);
      return;
    }
  }
}

function registrarVoto(opcion, x, y) {
  contadores[opcion]++;
  puntosVoto.push({ x: x, y: y, alpha: 255, color: colores[opcion] });
  opcionActual = opcion;

  // Enviar el voto al servidor
  socket.emit('nuevo-voto', opcion);

  let frases = frasesPorAutor[opcion];
  let indiceAnterior = indiceFrasePorOpcion[opcion];
  let nuevoIndice;

  do {
    nuevoIndice = floor(random(frases.length));
  } while (nuevoIndice === indiceAnterior);

  indiceFrasePorOpcion[opcion] = nuevoIndice;
  palabrasConstruidas = frases[nuevoIndice].split(" ");

  // Iniciar escritura animada
  indicePalabra = 0;
  textoActual = "";
  tiempoUltimaPalabra = millis();
  escribiendo = true;
}

function actualizarTexto() {
  if (escribiendo) {
    if (millis() - tiempoUltimaPalabra > intervaloPalabra) {
      if (indicePalabra < palabrasConstruidas.length) {
        textoActual += palabrasConstruidas[indicePalabra] + " ";
        indicePalabra++;
        tiempoUltimaPalabra = millis();
      } else {
        escribiendo = false;
      }
    }
  }
}
