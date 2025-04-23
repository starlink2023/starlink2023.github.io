import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

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

// Aggiungi un piano per il terreno
const planeGeometry = new THREE.PlaneGeometry(100, 100);
const planeMaterial = new THREE.MeshStandardMaterial({ color: 0x808080 });
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -Math.PI / 2; // Ruota il piano per renderlo orizzontale
plane.receiveShadow = true; // Il piano riceve ombre
plane.position.y = 0; // Posiziona il piano a livello 0
scene.add(plane);

// Carica il modello 3D
const loader = new GLTFLoader();
loader.load(
    './public/mo.glb', // Percorso del modello
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

// Funzione di animazione
function animate() {
    requestAnimationFrame(animate);

    // Muovi il modello in modo fluido
    const speed = 0.1; // Velocità di movimento
    const damping = 0.1; // Smorzamento per movimento fluido
    if (model) {
        if (movement.forward) model.position.z -= speed * (1 - damping);
        if (movement.backward) model.position.z += speed * (1 - damping);
        if (movement.left) model.position.x -= speed * (1 - damping);
        if (movement.right) model.position.x += speed * (1 - damping);
        if (movement.up) model.position.y += speed * (1 - damping);
        if (movement.down) model.position.y -= speed * (1 - damping);

        // Impedisci al modello di andare sotto il piano
        model.position.y = Math.max(model.position.y, plane.position.y);
    }

    // Impedisci alla telecamera di andare sotto il piano
    camera.position.y = Math.max(camera.position.y, plane.position.y + 1);

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