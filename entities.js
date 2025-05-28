const NUM_ENTITIES = 8;
let entities = [];

const HUMAN_COLORS = [
  '#f4b400', '#4285f4', '#0f9d58', '#db4437', '#ab47bc', '#00acc1', '#ff7043', '#9e9d24', '#5c6bc0', '#8d6e63', '#43a047', '#c62828', '#ad1457', '#6d4c41', '#00897b', '#ffa000'
];

function randomWalkableTile() {
  let x, y, tries = 0;
  do {
    x = Math.floor(Math.random() * WORLD_SIZE);
    y = Math.floor(Math.random() * WORLD_SIZE);
    tries++;
    if (tries > 1000) return { x: 0, y: 0 };
  } while (!world[y] || !blockTypes[world[y][x]] || !blockTypes[world[y][x]].walkable || entities.some(e => e.x === x && e.y === y));
  return { x, y };
}

function createEntity(id) {
  const pos = randomWalkableTile();
  return {
    id,
    name: `Human ${id+1}`,
    x: pos.x,
    y: pos.y,
    color: HUMAN_COLORS[id % HUMAN_COLORS.length],
    emotions: [],
    ideas: [],
    religion: '',
    foundation: '',
    goal: null,
    path: [],
    wonder: Math.random() * 100
  };
}

function spawnEntity() {
  const id = entities.length;
  const entity = createEntity(id);
  entities.push(entity);
  renderPanel && renderPanel();
  drawEntities && drawEntities();
}

function spawnEntityAt(x, y) {
  const id = entities.length;
  entities.push({
    id,
    name: `Human ${id+1}`,
    x,
    y,
    color: HUMAN_COLORS[id % HUMAN_COLORS.length],
    emotions: [],
    ideas: [],
    religion: '',
    foundation: '',
    goal: null,
    path: [],
    wonder: Math.random() * 100
  });
  drawEntities && drawEntities();
}

function moveEntities() {
  for (const e of entities) {
    if (!e.goal || (e.x === e.goal.x && e.y === e.goal.y) || Math.random() < 0.05) {
      let best = null, bestScore = -Infinity;
      for (let tries = 0; tries < 20; tries++) {
        const tx = Math.max(1, Math.min(WORLD_SIZE-2, e.x + Math.floor(Math.random()*21)-10));
        const ty = Math.max(1, Math.min(WORLD_SIZE-2, e.y + Math.floor(Math.random()*21)-10));
        if (!blockTypes[world[ty][tx]].walkable) continue;
        let dist = Math.abs(tx-e.x)+Math.abs(ty-e.y);
        let borderDist = Math.min(tx, ty, WORLD_SIZE-1-tx, WORLD_SIZE-1-ty);
        let score = dist + Math.random()*e.wonder + borderDist*2;
        if (score > bestScore) {
          bestScore = score;
          best = {x: tx, y: ty};
        }
      }
      if (best) {
        e.goal = best;
        e.path = findPath(e.x, e.y, e.goal.x, e.goal.y);
      }
    }
    if (e.path && e.path.length > 0) {
      const next = e.path.shift();
      if (next && blockTypes[world[next.y][next.x]].walkable && !entities.some(ent => ent.x === next.x && ent.y === next.y)) {
        e.x = next.x;
        e.y = next.y;
      }
    }
  }
}

function findPath(sx, sy, ex, ey) {
  const open = [{x: sx, y: sy, g: 0, h: Math.abs(ex-sx)+Math.abs(ey-sy), path: []}];
  const closed = new Set();
  while (open.length) {
    open.sort((a, b) => (a.g+a.h)-(b.g+b.h));
    const curr = open.shift();
    if (curr.x === ex && curr.y === ey) return curr.path.concat([{x: ex, y: ey}]);
    closed.add(curr.x+','+curr.y);
    for (const [dx,dy] of [[0,1],[1,0],[0,-1],[-1,0]]) {
      const nx = curr.x+dx, ny = curr.y+dy;
      if (nx<0||ny<0||nx>=WORLD_SIZE||ny>=WORLD_SIZE) continue;
      if (!blockTypes[world[ny][nx]].walkable) continue;
      if (closed.has(nx+','+ny)) continue;
      open.push({x: nx, y: ny, g: curr.g+1, h: Math.abs(ex-nx)+Math.abs(ey-ny), path: curr.path.concat([{x: nx, y: ny}])});
    }
  }
  return [];
}

function drawEntities() {
  const canvas = document.getElementById('world');
  const ctx = canvas.getContext('2d');
  const size = canvas.width / VIEWPORT_SIZE;
  for (const e of entities) {
    const vx = e.x - camera.x;
    const vy = e.y - camera.y;
    if (vx >= 0 && vx < VIEWPORT_SIZE && vy >= 0 && vy < VIEWPORT_SIZE) {
      ctx.beginPath();
      ctx.arc((vx+0.5)*size, (vy+0.5)*size, size*0.3, 0, 2*Math.PI);
      ctx.fillStyle = e.color;
      ctx.fill();
      ctx.strokeStyle = '#333';
      ctx.stroke();
    }
  }
}

function addEmotion(entity, emotion) {
  if (!entity.emotions.includes(emotion)) {
    entity.emotions.push(emotion);
  }
}

window.spawnEntity = spawnEntity;
window.spawnEntityAt = spawnEntityAt;
window.moveEntities = moveEntities;
window.drawEntities = drawEntities;
window.entities = entities;
window.addEmotion = addEmotion;
document.addEventListener('DOMContentLoaded', () => {
});
