
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

const container = document.getElementById("game-container");

if (!container) {
  throw new Error("Não encontrei o elemento game-container no HTML.");
}

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);
scene.fog = new THREE.Fog(0x87ceeb, 35, 110);

const camera = new THREE.PerspectiveCamera(
  65,
  window.innerWidth / window.innerHeight,
  0.1,
  200
);

camera.position.set(0, 5, 9);

const renderer = new THREE.WebGLRenderer({
  antialias: true
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.7));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;

container.appendChild(renderer.domElement);

// ILUMINAÇÃO

const ambient = new THREE.HemisphereLight(
  0xffffff,
  0x56734b,
  2
);

scene.add(ambient);

const sun = new THREE.DirectionalLight(0xfff1ce, 2.5);
sun.position.set(-20, 35, 20);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
scene.add(sun);

// TERRENO

const groundGeometry = new THREE.PlaneGeometry(180, 180, 100, 100);
groundGeometry.rotateX(-Math.PI / 2);

const positions = groundGeometry.attributes.position;

for (let i = 0; i < positions.count; i++) {
  const x = positions.getX(i);
  const z = positions.getZ(i);

  const height =
    Math.sin(x * 0.08) * 0.45 +
    Math.cos(z * 0.07) * 0.4 +
    Math.sin((x + z) * 0.035) * 0.7;

  positions.setY(i, height);
}

groundGeometry.computeVertexNormals();

const groundMaterial = new THREE.MeshStandardMaterial({
  color: 0x548d45,
  roughness: 1
});

const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.receiveShadow = true;
scene.add(ground);

// OBJETO PARA CRIAR ÁRVORES

function createTree(x, z, scale = 1) {
  const tree = new THREE.Group();

  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.22, 0.35, 2.4, 8),
    new THREE.MeshStandardMaterial({ color: 0x79502e })
  );

  trunk.position.y = 1.2;
  trunk.castShadow = true;
  tree.add(trunk);

  const leavesMaterial = new THREE.MeshStandardMaterial({
    color: 0x24783b,
    roughness: 1
  });

  const leaves = new THREE.Mesh(
    new THREE.SphereGeometry(1.15, 10, 8),
    leavesMaterial
  );

  leaves.position.y = 2.8;
  leaves.scale.set(1.1, 1.3, 1.1);
  leaves.castShadow = true;
  tree.add(leaves);

  tree.position.set(x, 0, z);
  tree.scale.setScalar(scale);

  scene.add(tree);
}

// FLORESTA

for (let i = 0; i < 100; i++) {
  const x = (Math.random() - 0.5) * 100;
  const z = (Math.random() - 0.5) * 100;

  if (Math.abs(x) < 7 && Math.abs(z) < 7) continue;

  createTree(x, z, 0.75 + Math.random() * 0.65);
}

// PEDRAS

for (let i = 0; i < 65; i++) {
  const rock = new THREE.Mesh(
    new THREE.DodecahedronGeometry(
      0.4 + Math.random() * 0.8,
      0
    ),
    new THREE.MeshStandardMaterial({
      color: 0x777b7b,
      roughness: 1
    })
  );

  rock.position.set(
    (Math.random() - 0.5) * 90,
    0.5,
    (Math.random() - 0.5) * 90
  );

  rock.rotation.set(Math.random(), Math.random(), Math.random());
  rock.castShadow = true;
  scene.add(rock);
}

// PERSONAGEM PROVISÓRIO

const player = new THREE.Group();

const body = new THREE.Mesh(
  new THREE.CapsuleGeometry(0.45, 0.9, 5, 10),
  new THREE.MeshStandardMaterial({ color: 0x285baf })
);

body.position.y = 1.05;
body.castShadow = true;
player.add(body);

const head = new THREE.Mesh(
  new THREE.SphereGeometry(0.32, 16, 12),
  new THREE.MeshStandardMaterial({ color: 0xe4ad83 })
);

head.position.y = 1.95;
head.castShadow = true;
player.add(head);

player.position.set(0, 0, 0);
scene.add(player);

// CONTROLES

const keys = {};

window.addEventListener("keydown", (event) => {
  keys[event.key.toLowerCase()] = true;
});

window.addEventListener("keyup", (event) => {
  keys[event.key.toLowerCase()] = false;
});

let cameraAngle = 0;

const playerSpeed = 0.12;

function updatePlayer() {
  const forward =
    keys["w"] || keys["arrowup"] ? 1 :
    keys["s"] || keys["arrowdown"] ? -1 : 0;

  const sideways =
    keys["d"] || keys["arrowright"] ? 1 :
    keys["a"] || keys["arrowleft"] ? -1 : 0;

  const movement = new THREE.Vector3(sideways, 0, forward);

  if (movement.length() > 0) {
    movement.normalize();

    player.position.x += movement.x * playerSpeed;
    player.position.z -= movement.z * playerSpeed;

    player.rotation.y = Math.atan2(movement.x, -movement.z);
  }

  player.position.x = THREE.MathUtils.clamp(
    player.position.x, -80, 80
  );

  player.position.z = THREE.MathUtils.clamp(
    player.position.z, -80, 80
  );
}

// CÂMERA

const cameraOffset = new THREE.Vector3(0, 5, 9);
const lookTarget = new THREE.Vector3();

function updateCamera() {
  const desiredPosition = player.position.clone().add(cameraOffset);

  camera.position.lerp(desiredPosition, 0.08);

  lookTarget.copy(player.position);
  lookTarget.y += 1.3;

  camera.lookAt(lookTarget);
}

// ANIMAÇÃO

function animate() {
  requestAnimationFrame(animate);

  updatePlayer();
  updateCamera();

  renderer.render(scene, camera);
}

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();

