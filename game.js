
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

/* =========================================================
   WILD FRONTIER
   Versão 1.0 - Motor principal do jogo
   ========================================================= */

const $ = (id) => document.getElementById(id);

const container = $("game-container");
const loading = $("loading-screen");
const loadingProgress = $("loading-progress");
const loadingMessage = $("loading-message");
const errorScreen = $("error-screen");

if (!container) {
  throw new Error("O elemento game-container não foi encontrado.");
}

const isMobile = window.matchMedia("(max-width: 700px)").matches;

const game = {
  running: true,
  paused: false,
  delta: 0,
  elapsed: 0,
  lastTime: 0,
  toastTimer: null,
  interactionTarget: null,
  resources: {
    crystals: 0,
    wood: 0,
    stone: 0
  },
  experience: 0,
  level: 1,
  questComplete: false,
  saveKey: "wild_frontier_save_v1"
};

function setLoading(percent, message) {
  loadingProgress.style.width = percent + "%";
  loadingMessage.textContent = message;
}

function showError(message) {
  errorScreen.style.display = "grid";
  $("error-message").textContent = message;
}

/* =========================================================
   RENDERIZADOR E CENA
   ========================================================= */

let scene;
let camera;
let renderer;

try {
  setLoading(8, "Preparando iluminação...");

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x8dc9df);
  scene.fog = new THREE.Fog(0x8dc9df, 65, 180);

  camera = new THREE.PerspectiveCamera(
    65,
    window.innerWidth / window.innerHeight,
    0.1,
    300
  );

  renderer = new THREE.WebGLRenderer({
    antialias: !isMobile,
    powerPreference: "high-performance"
  });

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.3 : 1.7));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;

  container.appendChild(renderer.domElement);
} catch (error) {
  showError("Seu navegador não conseguiu iniciar o 3D. Tente atualizar o navegador ou usar outro dispositivo.");
  throw error;
}

/* =========================================================
   ILUMINAÇÃO
   ========================================================= */

setLoading(15, "Acendendo o sol...");

const hemisphere = new THREE.HemisphereLight(
  0xccecff,
  0x536e40,
  2.0
);
scene.add(hemisphere);

const sun = new THREE.DirectionalLight(0xffedc5, 2.6);
sun.position.set(-45, 70, 35);
sun.castShadow = true;
sun.shadow.mapSize.set(isMobile ? 1024 : 2048, isMobile ? 1024 : 2048);
sun.shadow.camera.left = -75;
sun.shadow.camera.right = 75;
sun.shadow.camera.top = 75;
sun.shadow.camera.bottom = -75;
sun.shadow.normalBias = 0.035;
scene.add(sun);

const fillLight = new THREE.DirectionalLight(0xa7d9ff, 0.45);
fillLight.position.set(30, 15, -35);
scene.add(fillLight);

/* =========================================================
   CÉU E SOL VISUAL
   ========================================================= */

const skyDome = new THREE.Mesh(
  new THREE.SphereGeometry(250, 32, 20),
  new THREE.MeshBasicMaterial({
    color: 0x8dc9df,
    side: THREE.BackSide
  })
);
scene.add(skyDome);

const sunBall = new THREE.Mesh(
  new THREE.SphereGeometry(5, 20, 20),
  new THREE.MeshBasicMaterial({ color: 0xfff2bf })
);
sunBall.position.set(-70, 75, -110);
scene.add(sunBall);

/* =========================================================
   TERRENO COM RELEVO
   ========================================================= */

setLoading(25, "Criando o arquipélago...");

const WORLD_SIZE = 220;
const WORLD_HALF = WORLD_SIZE / 2;

function terrainHeight(x, z) {
  return (
    Math.sin(x * 0.045) * 1.15 +
    Math.cos(z * 0.055) * 0.95 +
    Math.sin((x + z) * 0.025) * 1.0 +
    Math.cos((x - z) * 0.018) * 0.65
  );
}

const groundGeometry = new THREE.PlaneGeometry(
  WORLD_SIZE,
  WORLD_SIZE,
  120,
  120
);

groundGeometry.rotateX(-Math.PI / 2);

const groundPositions = groundGeometry.attributes.position;

for (let i = 0; i < groundPositions.count; i++) {
  const x = groundPositions.getX(i);
  const z = groundPositions.getZ(i);
  groundPositions.setY(i, terrainHeight(x, z));
}

groundGeometry.computeVertexNormals();

const ground = new THREE.Mesh(
  groundGeometry,
  new THREE.MeshStandardMaterial({
    color: 0x5d984d,
    roughness: 1,
    metalness: 0
  })
);

ground.receiveShadow = true;
scene.add(ground);

/* =========================================================
   ÁGUA AO REDOR DA ILHA
   ========================================================= */

const ocean = new THREE.Mesh(
  new THREE.PlaneGeometry(800, 800),
  new THREE.MeshStandardMaterial({
    color: 0x258ca9,
    roughness: 0.28,
    metalness: 0.15,
    transparent: true,
    opacity: 0.92
  })
);

ocean.rotation.x = -Math.PI / 2;
ocean.position.y = -3.8;
scene.add(ocean);

/* =========================================================
   PRAIA
   ========================================================= */

const beachMaterial = new THREE.MeshStandardMaterial({
  color: 0xd8c58d,
  roughness: 1
});

const beach = new THREE.Mesh(
  new THREE.RingGeometry(82, 105, 120),
  beachMaterial
);

beach.rotation.x = -Math.PI / 2;
beach.position.y = -2.7;
scene.add(beach);

/* =========================================================
   FUNÇÕES AUXILIARES
   ========================================================= */

const colliders = [];
const collectibles = [];
const animatedObjects = [];

function addCollider(x, z, radius) {
  colliders.push({ x, z, radius });
}

function randomRange(min, max) {
  return min + Math.random() * (max - min);
}

function makeMaterial(color, roughness = 1) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness
  });
}

function randomPosition(minDistance = 9, maxDistance = 90) {
  let x = 0;
  let z = 0;
  let attempts = 0;

  do {
    x = randomRange(-maxDistance, maxDistance);
    z = randomRange(-maxDistance, maxDistance);
    attempts++;
  } while (
    Math.hypot(x, z) < minDistance &&
    attempts < 100
  );

  return { x, z };
}

/* =========================================================
   ÁRVORES
   ========================================================= */

setLoading(36, "Plantando a floresta...");

const trunkMaterial = makeMaterial(0x765033);
const leafMaterials = [
  makeMaterial(0x24743b),
  makeMaterial(0x2f8242),
  makeMaterial(0x397f3e),
  makeMaterial(0x1e6035)
];

function createTree(x, z, scale = 1) {
  const tree = new THREE.Group();
  const baseY = terrainHeight(x, z);

  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.22, 0.36, 2.8, 8),
    trunkMaterial
  );

  trunk.position.y = 1.4;
  trunk.castShadow = true;
  tree.add(trunk);

  const leafMaterial =
    leafMaterials[Math.floor(Math.random() * leafMaterials.length)];

  const crown1 = new THREE.Mesh(
    new THREE.SphereGeometry(1.35, 10, 8),
    leafMaterial
  );

  crown1.position.set(0, 3.1, 0);
  crown1.scale.set(1.15, 1.2, 1.1);
  crown1.castShadow = true;
  tree.add(crown1);

  const crown2 = new THREE.Mesh(
    new THREE.SphereGeometry(0.9, 9, 7),
    leafMaterial
  );

  crown2.position.set(0.55, 3.7, 0.15);
  crown2.castShadow = true;
  tree.add(crown2);

  tree.position.set(x, baseY, z);
  tree.scale.setScalar(scale);
  scene.add(tree);

  addCollider(x, z, 1.15 * scale);
}

for (let i = 0; i < 95; i++) {
  const pos = randomPosition(12, 82);
  createTree(pos.x, pos.z, randomRange(0.75, 1.3));
}

/* =========================================================
   PEDRAS
   ========================================================= */

setLoading(45, "Distribuindo rochas...");

const rockMaterial = makeMaterial(0x777d79);

for (let i = 0; i < 65; i++) {
  const pos = randomPosition(10, 90);

  const size = randomRange(0.45, 1.15);

  const rock = new THREE.Mesh(
    new THREE.DodecahedronGeometry(size, 0),
    rockMaterial
  );

  rock.position.set(
    pos.x,
    terrainHeight(pos.x, pos.z) + size * 0.45,
    pos.z
  );

  rock.rotation.set(
    Math.random(),
    Math.random(),
    Math.random()
  );

  rock.castShadow = true;
  rock.receiveShadow = true;
  scene.add(rock);

  addCollider(pos.x, pos.z, size * 0.9);
}

/* =========================================================
   VEGETAÇÃO PEQUENA
   ========================================================= */

setLoading(52, "Adicionando vegetação...");

const grassMaterial = makeMaterial(0x75a94e);

for (let i = 0; i < 180; i++) {
  const pos = randomPosition(8, 90);

  const grass = new THREE.Mesh(
    new THREE.ConeGeometry(0.18, randomRange(0.4, 0.9), 4),
    grassMaterial
  );

  grass.position.set(
    pos.x,
    terrainHeight(pos.x, pos.z) + 0.25,
    pos.z
  );

  grass.rotation.y = Math.random() * Math.PI;
  scene.add(grass);
}

/* =========================================================
   PERSONAGEM
   ========================================================= */

setLoading(60, "Preparando o explorador...");

const player = new THREE.Group();
scene.add(player);

const playerModel = new THREE.Group();
player.add(playerModel);

const skinMaterial = makeMaterial(0xd6a17a);
const shirtMaterial = makeMaterial(0x285d8d);
const pantsMaterial = makeMaterial(0x303d4a);
const bootMaterial = makeMaterial(0x40352c);
const hairMaterial = makeMaterial(0x38251c);

function createPart(geometry, material, x, y, z, parent = playerModel) {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

// Corpo
createPart(
  new THREE.CapsuleGeometry(0.38, 0.72, 5, 10),
  shirtMaterial,
  0, 1.15, 0
);

// Cabeça
createPart(
  new THREE.SphereGeometry(0.29, 16, 12),
  skinMaterial,
  0, 1.95, 0
);

// Cabelo
createPart(
  new THREE.SphereGeometry(0.3, 14, 9),
  hairMaterial,
  0, 2.12, -0.045
);

// Mochila
createPart(
  new THREE.BoxGeometry(0.48, 0.62, 0.22),
  makeMaterial(0x8a6236),
  0, 1.25, -0.37
);

// Pernas articuladas
const leftLeg = new THREE.Group();
leftLeg.position.set(-0.17, 0.72, 0);
playerModel.add(leftLeg);

const rightLeg = new THREE.Group();
rightLeg.position.set(0.17, 0.72, 0);
playerModel.add(rightLeg);

createPart(
  new THREE.CylinderGeometry(0.13, 0.12, 0.66, 8),
  pantsMaterial,
  0, -0.27, 0,
  leftLeg
);

createPart(
  new THREE.BoxGeometry(0.25, 0.14, 0.38),
  bootMaterial,
  0, -0.62, 0.07,
  leftLeg
);

createPart(
  new THREE.CylinderGeometry(0.13, 0.12, 0.66, 8),
  pantsMaterial,
  0, -0.27, 0,
  rightLeg
);

createPart(
  new THREE.BoxGeometry(0.25, 0.14, 0.38),
  bootMaterial,
  0, -0.62, 0.07,
  rightLeg
);

// Braços
const leftArm = new THREE.Group();
leftArm.position.set(-0.43, 1.55, 0);
playerModel.add(leftArm);

const rightArm = new THREE.Group();
rightArm.position.set(0.43, 1.55, 0);
playerModel.add(rightArm);

createPart(
  new THREE.CylinderGeometry(0.1, 0.12, 0.65, 8),
  shirtMaterial,
  0, -0.29, 0,
  leftArm
);

createPart(
  new THREE.CylinderGeometry(0.1, 0.12, 0.65, 8),
  shirtMaterial,
  0, -0.29, 0,
  rightArm
);

player.position.set(0, terrainHeight(0, 0), 0);

/* =========================================================
   ESTADO DO MOVIMENTO
   ========================================================= */

const movement = {
  x: 0,
  z: 0,
  sprint: false,
  jumpRequested: false,
  jumping: false,
  verticalSpeed: 0,
  jumpHeight: 0,
  moving: false,
  animationTime: 0
};

const keys = {};

const PLAYER_RADIUS = 0.48;
const WALK_SPEED = 7.0;
const RUN_SPEED = 11.5;
const GRAVITY = 19;
const JUMP_FORCE = 8.5;

function isBlocked(x, z) {
  if (Math.abs(x) > WORLD_HALF - 3) return true;
  if (Math.abs(z) > WORLD_HALF - 3) return true;

  for (const collider of colliders) {
    const dx = x - collider.x;
    const dz = z - collider.z;
    const minDistance = collider.radius + PLAYER_RADIUS;

    if (dx * dx + dz * dz < minDistance * minDistance) {
      return true;
    }
  }

  return false;
}

function movePlayer(dx, dz) {
  const nextX = player.position.x + dx;
  const nextZ = player.position.z + dz;

  if (!isBlocked(nextX, player.position.z)) {
    player.position.x = nextX;
  }

  if (!isBlocked(player.position.x, nextZ)) {
    player.position.z = nextZ;
  }
}

function updateMovement(dt) {
  let forward = 0;
  let sideways = 0;

  if (keys["w"] || keys["arrowup"]) forward += 1;
  if (keys["s"] || keys["arrowdown"]) forward -= 1;
  if (keys["a"] || keys["arrowleft"]) sideways -= 1;
  if (keys["d"] || keys["arrowright"]) sideways += 1;

  forward += -joystick.y;
  sideways += joystick.x;

  forward = THREE.MathUtils.clamp(forward, -1, 1);
  sideways = THREE.MathUtils.clamp(sideways, -1, 1);

  const inputLength = Math.hypot(forward, sideways);

  movement.moving = inputLength > 0.12;
  movement.sprint = keys["shift"] || mobileRun;

  if (movement.moving) {
    forward /= Math.max(1, inputLength);
    sideways /= Math.max(1, inputLength);

    const sin = Math.sin(cameraYaw);
    const cos = Math.cos(cameraYaw);

    const worldX = sideways * cos + forward * sin;
    const worldZ = sideways * sin - forward * cos;

    const speed = movement.sprint ? RUN_SPEED : WALK_SPEED;

    movePlayer(
      worldX * speed * dt,
      worldZ * speed * dt
    );

    player.rotation.y = Math.atan2(worldX, -worldZ);
  }

  // Animação simples de caminhada
  if (movement.moving) {
    movement.animationTime += dt * (movement.sprint ? 12 : 8);

    const swing = Math.sin(movement.animationTime) * 0.55;

    leftLeg.rotation.x = swing;
    rightLeg.rotation.x = -swing;
    leftArm.rotation.x = -swing * 0.7;
    rightArm.rotation.x = swing * 0.7;
  } else {
    leftLeg.rotation.x = THREE.MathUtils.damp(leftLeg.rotation.x, 0, 8, dt);
    rightLeg.rotation.x = THREE.MathUtils.damp(rightLeg.rotation.x, 0, 8, dt);
    leftArm.rotation.x = THREE.MathUtils.damp(leftArm.rotation.x, 0, 8, dt);
    rightArm.rotation.x = THREE.MathUtils.damp(rightArm.rotation.x, 0, 8, dt);
  }

  // Salto e gravidade
  if (movement.jumpRequested && !movement.jumping) {
    movement.jumping = true;
    movement.verticalSpeed = JUMP_FORCE;
  }

  movement.jumpRequested = false;

  if (movement.jumping) {
    movement.jumpHeight += movement.verticalSpeed * dt;
    movement.verticalSpeed -= GRAVITY * dt;

    if (movement.jumpHeight <= 0) {
      movement.jumpHeight = 0;
      movement.verticalSpeed = 0;
      movement.jumping = false;
    }
  }

  player.position.y =
    terrainHeight(player.position.x, player.position.z) +
    movement.jumpHeight;
}

/* =========================================================
   CÂMERA EM TERCEIRA PESSOA
   ========================================================= */

let cameraYaw = 0;
let cameraPitch = 0.28;
let cameraDistance = 8;
let draggingCamera = false;
let lastPointerX = 0;
let lastPointerY = 0;

const cameraTarget = new THREE.Vector3();

function updateCamera(dt) {
  const horizontalDistance = cameraDistance * Math.cos(cameraPitch);

  const offset = new THREE.Vector3(
    Math.sin(cameraYaw) * horizontalDistance,
    cameraDistance * Math.sin(cameraPitch) + 1.5,
    Math.cos(cameraYaw) * horizontalDistance
  );

  const desired = player.position.clone().add(offset);

  camera.position.lerp(
    desired,
    1 - Math.exp(-7 * dt)
  );

  cameraTarget.copy(player.position);
  cameraTarget.y += 1.3 + movement.jumpHeight * 0.25;

  camera.lookAt(cameraTarget);
}

renderer.domElement.addEventListener("pointerdown", (event) => {
  if (event.pointerType === "mouse" || event.pointerType === "touch") {
    draggingCamera = true;
    lastPointerX = event.clientX;
    lastPointerY = event.clientY;
  }
});

window.addEventListener("pointerup", () => {
  draggingCamera = false;
});

window.addEventListener("pointermove", (event) => {
  if (!draggingCamera || game.paused) return;

  const dx = event.clientX - lastPointerX;
  const dy = event.clientY - lastPointerY;

  lastPointerX = event.clientX;
  lastPointerY = event.clientY;

  cameraYaw -= dx * 0.005;
  cameraPitch = THREE.MathUtils.clamp(
    cameraPitch + dy * 0.003,
    -0.05,
    0.85
  );
});

renderer.domElement.addEventListener("wheel", (event) => {
  cameraDistance = THREE.MathUtils.clamp(
    cameraDistance + event.deltaY * 0.008,
    4.5,
    13
  );
});

/* =========================================================
   JOYSTICK PARA CELULAR
   ========================================================= */

const joystickZone = $("joystick-zone");
const joystickBase = $("joystick-base");
const joystickStick = $("joystick-stick");

const joystick = { x: 0, y: 0 };
let joystickPointer = null;
let mobileRun = false;

function resetJoystick() {
  joystick.x = 0;
  joystick.y = 0;
  joystickPointer = null;

  joystickStick.style.left = "50%";
  joystickStick.style.top = "50%";
}

joystickZone.addEventListener("pointerdown", (event) => {
  event.preventDefault();
  joystickPointer = event.pointerId;
  joystickZone.setPointerCapture(event.pointerId);
  updateJoystick(event);
});

joystickZone.addEventListener("pointermove", (event) => {
  if (event.pointerId !== joystickPointer) return;
  updateJoystick(event);
});

joystickZone.addEventListener("pointerup", resetJoystick);
joystickZone.addEventListener("pointercancel", resetJoystick);

function updateJoystick(event) {
  const rect = joystickBase.getBoundingClientRect();

  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  let dx = event.clientX - centerX;
  let dy = event.clientY - centerY;

  const maxRadius = rect.width * 0.34;
  const distance = Math.hypot(dx, dy);

  if (distance > maxRadius) {
    dx = dx / distance * maxRadius;
    dy = dy / distance * maxRadius;
  }

  joystick.x = dx / maxRadius;
  joystick.y = dy / maxRadius;

  joystickStick.style.left = `calc(50% + ${dx}px)`;
  joystickStick.style.top = `calc(50% + ${dy}px)`;
}

$("jump-button").addEventListener("pointerdown", (event) => {
  event.preventDefault();
  movement.jumpRequested = true;
});

$("run-button").addEventListener("pointerdown", (event) => {
  event.preventDefault();
  mobileRun = true;
});

$("run-button").addEventListener("pointerup", () => {
  mobileRun = false;
});

$("run-button").addEventListener("pointercancel", () => {
  mobileRun = false;
});

$("action-button").addEventListener("pointerdown", (event) => {
  event.preventDefault();
  interact();
});

/* =========================================================
   CRISTAIS COLETÁVEIS
   ========================================================= */

setLoading(72, "Escondendo os tesouros...");

const crystalMaterial = new THREE.MeshStandardMaterial({
  color: 0x5be6ef,
  emissive: 0x1596c2,
  emissiveIntensity: 1.7,
  metalness: 0.25,
  roughness: 0.25
});

function createCrystal(x, z, id) {
  const group = new THREE.Group();

  const crystal = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.65, 0),
    crystalMaterial
  );

  crystal.scale.set(0.75, 1.4, 0.75);
  crystal.castShadow = true;
  group.add(crystal);

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.8, 0.035, 8, 28),
    new THREE.MeshBasicMaterial({ color: 0x9cf8ff })
  );

  ring.rotation.x = Math.PI / 2;
  ring.position.y = -0.3;
  group.add(ring);

  group.position.set(
    x,
    terrainHeight(x, z) + 1.1,
    z
  );

  scene.add(group);

  const item = {
    id,
    object: group,
    collected: false,
    x,
    z,
    phase: Math.random() * Math.PI * 2
  };

  collectibles.push(item);
  animatedObjects.push(item);
}

const crystalPositions = [
  [-18, -12],
  [23, -17],
  [-31, 26],
  [38, 30],
  [5, 48]
];

crystalPositions.forEach((pos, index) => {
  createCrystal(pos[0], pos[1], "crystal-" + index);
});

/* =========================================================
   RECURSOS DE MADEIRA E PEDRA
   ========================================================= */

function createResource(x, z, type, id) {
  const group = new THREE.Group();

  if (type === "wood") {
    const log = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.2, 1.1, 8),
      makeMaterial(0x8d5b30)
    );

    log.rotation.z = Math.PI / 2;
    log.castShadow = true;
    group.add(log);
  } else {
    const stone = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.48, 0),
      makeMaterial(0x929b9d)
    );

    stone.castShadow = true;
    group.add(stone);
  }

  group.position.set(x, terrainHeight(x, z) + 0.5, z);
  scene.add(group);

  collectibles.push({
    id,
    object: group,
    collected: false,
    x,
    z,
    type,
    phase: Math.random() * 5
  });
}

for (let i = 0; i < 12; i++) {
  const p = randomPosition(12, 75);
  createResource(p.x, p.z, "wood", "wood-" + i);
}

for (let i = 0; i < 12; i++) {
  const p = randomPosition(12, 75);
  createResource(p.x, p.z, "stone", "stone-" + i);
}

/* =========================================================
   MISSÃO, INVENTÁRIO E INTERAÇÃO
   ========================================================= */

function distanceTo(item) {
  return Math.hypot(
    player.position.x - item.x,
    player.position.z - item.z
  );
}

function findNearestItem() {
  let nearest = null;
  let bestDistance = 3.3;

  for (const item of collectibles) {
    if (item.collected) continue;

    const distance = distanceTo(item);

    if (distance < bestDistance) {
      bestDistance = distance;
      nearest = item;
    }
  }

  return nearest;
}

function showToast(message) {
  const toast = $("toast");

  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(game.toastTimer);

  game.toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2300);
}

function updateHUD() {
  $("crystal-total").textContent = game.resources.crystals;
  $("wood-total").textContent = game.resources.wood;
  $("stone-total").textContent = game.resources.stone;
  $("crystal-count").textContent =
    Math.min(game.resources.crystals, 5) + " / 5";

  $("player-level").textContent = game.level;
  $("xp-text").textContent =
    game.experience + " / " + (game.level * 100);

  $("xp-fill").style.width =
    Math.min(100, game.experience / (game.level * 100) * 100) + "%";
}

function addExperience(amount) {
  game.experience += amount;

  while (game.experience >= game.level * 100) {
    game.experience -= game.level * 100;
    game.level++;
    showToast("NÍVEL AUMENTOU! Você chegou ao nível " + game.level);
  }

  updateHUD();
}

function collectItem(item) {
  if (!item || item.collected) return;

  item.collected = true;
  scene.remove(item.object);

  if (item.id.startsWith("crystal")) {
    game.resources.crystals++;
    addExperience(30);
    showToast("💎 Cristal encontrado! +30 XP");

    if (game.resources.crystals >= 5 && !game.questComplete) {
      game.questComplete = true;
      addExperience(100);
      showToast("MISSÃO CONCLUÍDA! +100 XP");
    }
  } else if (item.type === "wood") {
    game.resources.wood++;
    addExperience(5);
    showToast("🪵 Madeira coletada!");
  } else if (item.type === "stone") {
    game.resources.stone++;
    addExperience(5);
    showToast("🪨 Pedra coletada!");
  }

  updateHUD();
}

function interact() {
  const item = game.interactionTarget || findNearestItem();

  if (!item) {
    showToast("Não há recursos próximos.");
    return;
  }

  collectItem(item);
}

function updateInteraction() {
  const nearest = findNearestItem();

  game.interactionTarget = nearest;

  const hint = $("interaction-hint");

  if (nearest) {
    const label = nearest.id.startsWith("crystal")
      ? "💎 Cristal"
      : nearest.type === "wood"
        ? "🪵 Madeira"
        : "🪨 Pedra";

    hint.textContent = isMobile
      ? "Toque ✦ para coletar " + label
      : "Pressione E para coletar " + label;

    hint.classList.add("show");
  } else {
    hint.classList.remove("show");
  }
}

/* =========================================================
   TECLADO
   ========================================================= */

window.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();
  keys[key] = true;

  if (
    key === " " ||
    key.startsWith("arrow")
  ) {
    event.preventDefault();
  }

  if (key === " " && !event.repeat) {
    movement.jumpRequested = true;
  }

  if (key === "e" && !event.repeat) {
    interact();
  }

  if (key === "escape") {
    toggleMenu();
  }
});

window.addEventListener("keyup", (event) => {
  keys[event.key.toLowerCase()] = false;
});

window.addEventListener("blur", () => {
  for (const key in keys) keys[key] = false;
  resetJoystick();
  mobileRun = false;
});

/* =========================================================
   SALVAMENTO LOCAL
   ========================================================= */

function saveGame() {
  const data = {
    x: player.position.x,
    z: player.position.z,
    crystals: game.resources.crystals,
    wood: game.resources.wood,
    stone: game.resources.stone,
    experience: game.experience,
    level: game.level,
    questComplete: game.questComplete,
    collected: collectibles
      .filter(item => item.collected)
      .map(item => item.id)
  };

  try {
    localStorage.setItem(game.saveKey, JSON.stringify(data));
    showToast("Progresso salvo neste dispositivo!");
  } catch (error) {
    showToast("Não foi possível salvar neste navegador.");
  }
}

function loadGame() {
  try {
    const raw = localStorage.getItem(game.saveKey);

    if (!raw) return;

    const data = JSON.parse(raw);

    if (!data || typeof data !== "object") return;

    const x = Number(data.x);
    const z = Number(data.z);

    if (Number.isFinite(x) && Number.isFinite(z) && !isBlocked(x, z)) {
      player.position.x = x;
      player.position.z = z;
      player.position.y = terrainHeight(x, z);
    }

    game.resources.crystals = Math.max(0, Number(data.crystals) || 0);
    game.resources.wood = Math.max(0, Number(data.wood) || 0);
    game.resources.stone = Math.max(0, Number(data.stone) || 0);
    game.experience = Math.max(0, Number(data.experience) || 0);
    game.level = Math.max(1, Number(data.level) || 1);
    game.questComplete = Boolean(data.questComplete);

    const collected = new Set(
      Array.isArray(data.collected) ? data.collected : []
    );

    for (const item of collectibles) {
      if (collected.has(item.id)) {
        item.collected = true;
        scene.remove(item.object);
      }
    }

    updateHUD();
    showToast("Seu progresso foi carregado!");
  } catch (error) {
    console.warn("Não foi possível carregar o salvamento.", error);
  }
}

/* =========================================================
   MENU E PAUSA
   ========================================================= */

function toggleMenu(force) {
  const overlay = $("menu-overlay");

  const shouldOpen =
    typeof force === "boolean"
      ? force
      : overlay.classList.contains("hidden");

  overlay.classList.toggle("hidden", !shouldOpen);
  game.paused = shouldOpen;
}

$("menu-button").addEventListener("click", () => toggleMenu(true));
$("resume-button").addEventListener("click", () => toggleMenu(false));
$("save-button").addEventListener("click", saveGame);
$("save-menu-button").addEventListener("click", saveGame);

$("reset-button").addEventListener("click", () => {
  const confirmed = window.confirm(
    "Tem certeza? Todo o progresso salvo neste navegador será apagado."
  );

  if (confirmed) {
    localStorage.removeItem(game.saveKey);
    window.location.reload();
  }
});

/* =========================================================
   EFEITOS DOS CRISTAIS
   ========================================================= */

function updateCollectibles(time) {
  for (const item of collectibles) {
    if (item.collected) continue;

    if (item.id.startsWith("crystal")) {
      item.object.position.y =
        terrainHeight(item.x, item.z) +
        1.1 +
        Math.sin(time * 2 + item.phase) * 0.18;

      item.object.rotation.y += game.delta * 0.9;
    }
  }
}

/* =========================================================
   ANIMAÇÃO DO MUNDO
   ========================================================= */

function updateWorld(dt) {
  game.elapsed += dt;

  // Pequena oscilação da água
  ocean.position.y = -3.8 + Math.sin(game.elapsed * 0.5) * 0.035;

  // Pequena oscilação visual do sol
  sunBall.position.y = 75 + Math.sin(game.elapsed * 0.08) * 1.5;

  updateCollectibles(game.elapsed);
}

/* =========================================================
   AJUSTE DE TELA
   ========================================================= */

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(
    Math.min(window.devicePixelRatio, isMobile ? 1.3 : 1.7)
  );
});

/* =========================================================
   INICIALIZAÇÃO
   ========================================================= */

setLoading(82, "Preparando os controles...");
updateHUD();
loadGame();

setLoading(92, "Quase pronto...");

camera.position.set(0, 7, 10);
camera.lookAt(player.position);

setTimeout(() => {
  loading.style.opacity = "0";

  setTimeout(() => {
    loading.style.display = "none";
  }, 650);
}, 500);

/* =========================================================
   LOOP PRINCIPAL
   ========================================================= */

function animate(timestamp) {
  requestAnimationFrame(animate);

  if (!game.running) return;

  const dt = Math.min(
    (timestamp - (game.lastTime || timestamp)) / 1000,
    0.05
  );

  game.lastTime = timestamp;
  game.delta = dt;

  if (!game.paused) {
    updateMovement(dt);
    updateCamera(dt);
    updateWorld(dt);
    updateInteraction();
  }

  renderer.render(scene, camera);
}

requestAnimationFrame(animate);

console.log("WILD FRONTIER iniciado com sucesso!");
