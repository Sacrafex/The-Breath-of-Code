
class SimplexNoise {
  constructor(seed = 0) {
    this.p = new Uint8Array(512);
    for (let i = 0; i < 256; ++i) this.p[i] = i;
    let n, q;
    for (let i = 255; i > 0; --i) {
      n = Math.floor((seed = (seed * 9301 + 49297) % 233280) / 233280 * (i + 1));
      q = this.p[i];
      this.p[i] = this.p[n];
      this.p[n] = q;
    }
    for (let i = 0; i < 256; ++i) this.p[256 + i] = this.p[i];
  }
  grad(hash, x, y) {
    const h = hash & 3;
    const u = h < 2 ? x : y;
    const v = h < 2 ? y : x;
    return ((h & 1) ? -u : u) + ((h & 2) ? -2.0 * v : 2.0 * v);
  }
  noise(x, y) {
    const X = Math.floor(x) & 255, Y = Math.floor(y) & 255;
    x -= Math.floor(x); y -= Math.floor(y);
    const u = x * x * (3 - 2 * x), v = y * y * (3 - 2 * y);
    const A = this.p[X] + Y, B = this.p[X + 1] + Y;
    return this.lerp(v,
      this.lerp(u, this.grad(this.p[A], x, y), this.grad(this.p[B], x - 1, y)),
      this.lerp(u, this.grad(this.p[A + 1], x, y - 1), this.grad(this.p[B + 1], x - 1, y - 1))
    ) * 0.5 + 0.5;
  }
  lerp(t, a, b) { return a + t * (b - a); }
}

function generateWorldMap(width, height, seed = 42) {
  const simplex = new SimplexNoise(seed);
  const map = [];
  for (let y = 0; y < height; y++) {
    const row = [];
    for (let x = 0; x < width; x++) {
      const nx = x / width - 0.5, ny = y / height - 0.5;
      let e = simplex.noise(nx * 6, ny * 6);
      if (e < 0.22) row.push('water');
      else if (e < 0.32) row.push('stone');
      else if (e < 0.7) row.push('grass');
      else row.push('dirt');
    }
    map.push(row);
  }
  return map;
}

window.generateWorldMap = generateWorldMap;
