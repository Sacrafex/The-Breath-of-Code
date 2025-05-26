// Logic for generating the world grid and rendering it
const WORLD_SIZE = 256;
let camera = { x: 0, y: 0 };
let world = [];
let VIEWPORT_SIZE = 20;

const blockTypes = {
  "Border": {
    "color": "#222",
    "walkable": false,
    "description": "Unbreakable border.",
    "texture": "textures/border.png"
  },
  "stone": {
    "color": "#888",
    "walkable": false,
    "description": "Solid, unbreakable stone.",
    "texture": "textures/stone.png"
  },
  "water": {
    "color": "#4fc3f7",
    "walkable": false,
    "description": "Water blocks. Entities cannot walk here.",
    "texture": "textures/water.png"
  },
  "grass": {
    "color": "#7ec850",
    "walkable": true,
    "description": "Grassland. Entities can walk and rest here.",
    "texture": "textures/grass.png"
  },
  "dirt": {
    "color": "#b97a56",
    "walkable": true,
    "description": "Dirt. Walkable, but less comfortable than grass.",
    "texture": "textures/dirt.png"
  }
};

let blockTextures = {};

async function loadBlockTypes() {
  await loadBlockTextures();
}

async function loadBlockTextures() {
  blockTextures = {};
  for (const [key, val] of Object.entries(blockTypes)) {
    await new Promise((resolve) => {
      const img = new Image();
      img.onload = resolve;
      img.onerror = resolve;
      img.src = val.texture;
      blockTextures[key] = img;
    });
  }
}

function randomBlockType(x, y) {
  // Simple noise-based terrain generation
  const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
  const r = n - Math.floor(n);
  if (r < 0.15) return 'water';
  if (r < 0.3) return 'stone';
  if (r < 0.7) return 'grass';
  return 'dirt';
}

function generateWorld() {
  if (window.generateWorldMap) {
    const map = window.generateWorldMap(WORLD_SIZE, WORLD_SIZE, Math.floor(Math.random()*10000));
    world = [];
    for (let y = 0; y < WORLD_SIZE; y++) {
      let row = [];
      for (let x = 0; x < WORLD_SIZE; x++) {
        if (x === 0 || y === 0 || x === WORLD_SIZE-1 || y === WORLD_SIZE-1) {
          row.push('Border');
        } else {
          row.push(map[y][x]);
        }
      }
      world.push(row);
    }
  } else {
    world = [];
    for (let y = 0; y < WORLD_SIZE; y++) {
      let row = [];
      for (let x = 0; x < WORLD_SIZE; x++) {
        if (x === 0 || y === 0 || x === WORLD_SIZE-1 || y === WORLD_SIZE-1) {
          row.push('Border');
        } else {
          row.push(randomBlockType(x, y));
        }
      }
      world.push(row);
    }
  }
}

function drawWorld() {
  const canvas = document.getElementById('world');
  const ctx = canvas.getContext('2d');
  const size = canvas.width / VIEWPORT_SIZE;
  for (let vy = 0; vy < VIEWPORT_SIZE; vy++) {
    for (let vx = 0; vx < VIEWPORT_SIZE; vx++) {
      const wx = camera.x + vx;
      const wy = camera.y + vy;
      if (wx < 0 || wy < 0 || wx >= WORLD_SIZE || wy >= WORLD_SIZE) continue;
      const block = world[wy][wx];
      const type = blockTypes[block];
      const tex = blockTextures[block];
      if (tex && tex.complete && tex.naturalWidth > 0) {
        ctx.drawImage(tex, vx * size, vy * size, size, size);
      } else {
        ctx.fillStyle = type ? type.color : '#000';
        ctx.fillRect(vx * size, vy * size, size, size);
      }
    }
  }
}

function moveCamera(dx, dy) {
  camera.x = Math.max(0, Math.min(WORLD_SIZE - VIEWPORT_SIZE, camera.x + dx));
  camera.y = Math.max(0, Math.min(WORLD_SIZE - VIEWPORT_SIZE, camera.y + dy));
  drawWorld();
  drawEntities();
}

async function setupWorld() {
  await loadBlockTypes();
  generateWorld();
  drawWorld();
}

// Ensure drawEntities uses VIEWPORT_SIZE and camera for correct zoom and panning
if (typeof drawEntities === 'function') {
  const oldDrawEntities = drawEntities;
  window.drawEntities = function() {
    oldDrawEntities();
  };
}

document.addEventListener('DOMContentLoaded', () => {
  setupWorld();
});

window.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowUp') moveCamera(0, -1);
  if (e.key === 'ArrowDown') moveCamera(0, 1);
  if (e.key === 'ArrowLeft') moveCamera(-1, 0);
  if (e.key === 'ArrowRight') moveCamera(1, 0);
});

window.setupWorld = setupWorld;
window.moveCamera = moveCamera;
window.setViewportSize = function(size, centerZoom) {
  if (centerZoom) {
    const oldSize = VIEWPORT_SIZE;
    const centerX = camera.x + Math.floor(oldSize/2);
    const centerY = camera.y + Math.floor(oldSize/2);
    VIEWPORT_SIZE = size;
    camera.x = Math.max(0, Math.min(WORLD_SIZE - VIEWPORT_SIZE, centerX - Math.floor(size/2)));
    camera.y = Math.max(0, Math.min(WORLD_SIZE - VIEWPORT_SIZE, centerY - Math.floor(size/2)));
  } else {
    VIEWPORT_SIZE = size;
  }
  drawWorld();
  drawEntities && drawEntities();
};

window.generateChunkAt = function(wx, wy) {
  for (let y = Math.max(1, wy-8); y < Math.min(WORLD_SIZE-1, wy+8); y++) {
    for (let x = Math.max(1, wx-8); x < Math.min(WORLD_SIZE-1, wx+8); x++) {
      if (x === 0 || y === 0 || x === WORLD_SIZE-1 || y === WORLD_SIZE-1) continue;
      world[y][x] = window.generateWorldMap ? window.generateWorldMap(1, 1, Math.floor(Math.random()*10000))[0][0] : randomBlockType(x, y);
    }
  }
  drawWorld();
  drawEntities && drawEntities();
};
