import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

// Funzione per ottenere il parametro dalla query string
function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

// Ottieni il nome del file dalla query string
const fileName = getQueryParam('file');

// Carica il modello 3D in base al parametro 'file' nella query string
if (fileName) {
  const loader = new GLTFLoader();
  loader.load(
      fileName, // Percorso dinamico del modello
      (gltf) => {
          model = gltf.scene;

          // Abilita ombre per il modello
          model.traverse((child) => {
              if (child.isMesh) {
                  child.castShadow = true;
                  child.receiveShadow = true;
              }
          });

          model.scale.set(2, 2, 2);
          model.position.set(0, 0, 0);
          scene.add(model);
      },
      (xhr) => {
          console.log((xhr.loaded / xhr.total * 100) + '% caricato');
      },
      (error) => {
          console.error('Errore nel caricamento del modello:', error);
      }
  );
} else {
  console.error('Nessun file specificato nella query string.');
}

// Attiva la fotocamera del PC e usa il feed video come sfondo
navigator.mediaDevices.getUserMedia({ video: true })
    .then((stream) => {
        const videoElement = document.createElement('video');
        videoElement.srcObject = stream;
        videoElement.autoplay = true;

        // Crea una texture dal feed video
        const videoTexture = new THREE.VideoTexture(videoElement);
        videoTexture.minFilter = THREE.LinearFilter;
        videoTexture.magFilter = THREE.LinearFilter;
        videoTexture.format = THREE.RGBFormat;

        // Imposta la texture video come background della scena
        scene.background = videoTexture;
    })
    .catch((error) => {
        console.error('Error accessing the camera:', error);
    });

// Crea la scena
const scene = new THREE.Scene();

// Crea una camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 2, 5);

// Crea il renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.outputEncoding = THREE.sRGBEncoding; // Gestione del colore
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
document.body.appendChild(renderer.domElement);

// Aggiungi luci
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 7.5);
directionalLight.castShadow = true;
scene.add(directionalLight);

const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.6);
scene.add(hemisphereLight);

// Variabile per il modello caricato
let model;

// Variabile per controllare se muovere la telecamera o il modello
let controlMode = 'camera'; // 'camera' o 'model'

// Crea un menu HTML
const menu = document.createElement('div');
menu.style.position = 'absolute';
menu.style.top = '50px'; // Abbassato ulteriormente di 20px
menu.style.left = '10px';
menu.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
menu.style.padding = '10px';
menu.style.borderRadius = '5px';
menu.style.zIndex = '1000';

// Rendi il menu responsive per dispositivi mobili
menu.style.width = '90%';
menu.style.maxWidth = '300px';
menu.style.fontSize = '14px';

// Checkbox per abilitare/disabilitare il controllo del modello con il mouse
const checkbox = document.createElement('input');
checkbox.type = 'checkbox';
checkbox.id = 'controlModel';
const checkboxLabel = document.createElement('label');
checkboxLabel.htmlFor = 'controlModel';
checkboxLabel.innerText = 'Controlla modello con il mouse';
menu.appendChild(checkbox);
menu.appendChild(checkboxLabel);
menu.appendChild(document.createElement('br'));

// Rimuovi il vecchio slider e aggiungi un input numerico per scalare il modello
const scaleLabel = document.createElement('label');
scaleLabel.htmlFor = 'scaleModel';
scaleLabel.innerText = 'Scala modello: ';
menu.appendChild(scaleLabel);
const scaleInput = document.createElement('input');
scaleInput.type = 'number';
scaleInput.id = 'scaleModel';
scaleInput.min = '0.5';
scaleInput.max = '5';
scaleInput.step = '0.1';
scaleInput.value = '2';
menu.appendChild(scaleInput);

// Aggiungi il menu al documento
document.body.appendChild(menu);

// Gestisci il cambio di modalità di controllo
checkbox.addEventListener('change', (event) => {
    controlMode = event.target.checked ? 'model' : 'camera';
    controls.enabled = controlMode === 'camera';
});

// Gestisci il ridimensionamento del modello
scaleInput.addEventListener('input', (event) => {
    if (model) {
        const scale = parseFloat(event.target.value);
        if (!isNaN(scale)) {
            model.scale.set(scale, scale, scale);
        }
    }
});

// Aggiungi controlli per il mouse
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.target.set(0, 1, 0);

// Variabili per il movimento
const movement = {
    forward: false,
    backward: false,
    left: false,
    right: false,
    up: false,
    down: false,
};

// Listener per i tasti premuti
window.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'w':
        case 'W':
            movement.forward = true;
            break;
        case 's':
        case 'S':
            movement.backward = true;
            break;
        case 'a':
        case 'A':
            movement.left = true;
            break;
        case 'd':
        case 'D':
            movement.right = true;
            break;
        case 'q':
        case 'Q':
            movement.up = true;
            break;
        case 'e':
        case 'E':
            movement.down = true;
            break;
    }
});

// Listener per i tasti rilasciati
window.addEventListener('keyup', (event) => {
    switch (event.key) {
        case 'w':
        case 'W':
            movement.forward = false;
            break;
        case 's':
        case 'S':
            movement.backward = false;
            break;
        case 'a':
        case 'A':
            movement.left = false;
            break;
        case 'd':
        case 'D':
            movement.right = false;
            break;
        case 'q':
        case 'Q':
            movement.up = false;
            break;
        case 'e':
        case 'E':
            movement.down = false;
            break;
    }
});

// Aggiungi supporto per il tocco per il movimento del modello
let touchStartX = 0, touchStartY = 0;
let touchDeltaX = 0, touchDeltaY = 0;

window.addEventListener('touchstart', (event) => {
    if (controlMode === 'model' && event.touches.length === 1) {
        touchStartX = event.touches[0].clientX;
        touchStartY = event.touches[0].clientY;
    }
});

window.addEventListener('touchmove', (event) => {
    if (controlMode === 'model' && event.touches.length === 1) {
        touchDeltaX = event.touches[0].clientX - touchStartX;
        touchDeltaY = event.touches[0].clientY - touchStartY;

        if (model) {
            const speed = 0.01; // Velocità di movimento per il tocco
            model.position.x += touchDeltaX * speed;
            model.position.y -= touchDeltaY * speed;
        }

        touchStartX = event.touches[0].clientX;
        touchStartY = event.touches[0].clientY;
    }
});

window.addEventListener('touchend', () => {
    touchDeltaX = 0;
    touchDeltaY = 0;
});

// Funzione di animazione
function animate() {
    requestAnimationFrame(animate);

    // Muovi il modello in modo fluido solo se la modalità è 'model'
    const speed = 0.1; // Velocità di movimento
    const damping = 0.1; // Smorzamento per movimento fluido
    if (model && controlMode === 'model') {
        if (movement.forward) model.position.z -= speed * (1 - damping);
        if (movement.backward) model.position.z += speed * (1 - damping);
        if (movement.left) model.position.x -= speed * (1 - damping);
        if (movement.right) model.position.x += speed * (1 - damping);
        if (movement.up) model.position.y += speed * (1 - damping);
        if (movement.down) model.position.y -= speed * (1 - damping);
    }

    controls.update();
    renderer.render(scene, camera);
}

// Gestisci il ridimensionamento della finestra
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Avvia l'animazione
animate();