/*
  Week 5 — Side Quest: "INTERFERENCE"
  Course: GBDA302

  Controls: WASD / Arrow Keys

  The world responds to you:
  — It starts dark and barely saturated. Colour unlocks as you explore.
  — Moving fast makes the interference field chaotic and vivid.
    Standing still lets it settle into something calm and beautiful.
  — Your trail persists as soft marks in the world — it remembers you.
  — Finding an anomaly sends a pulse through the whole screen.

  9 anomalies hidden across the world:
    BLOOM  — rings of light erupting outward
    VORTEX — spiral arms spinning around a glowing eye
    GLITCH — corrupted scanlines and colour breaks
*/

const WORLD_W = 4000;
const WORLD_H = 3000;
const VIEW_W  = 800;
const VIEW_H  = 480;
const CELL    = 10;

let player    = { x: WORLD_W / 2, y: WORLD_H / 2, spd: 3.5 };
let cam       = { x: 0, y: 0 };
let prevPos   = { x: WORLD_W / 2, y: WORLD_H / 2 };

let trail = [];
const TRAIL_LEN = 120;

let footprints = [];
let footTimer  = 0;
const FOOT_MAX = 600;

let chaos    = 0;
let velocity = 0;
let explore  = 0;
let pulses   = [];

let sources   = [];
let anomalies = [];
let t = 0;

function setup() {
  createCanvas(VIEW_W, VIEW_H);
  colorMode(HSB, 360, 100, 100, 100);

  for (let i = 0; i < 13; i++) {
    sources.push({
      x : random(WORLD_W),
      y : random(WORLD_H),
      λ : random(70, 220),
      ω : random(0.5, 2.4),
      φ : random(TWO_PI),
    });
  }

  const types = ['bloom','vortex','glitch','bloom','vortex','glitch','bloom','vortex','glitch'];
  for (let i = 0; i < 9; i++) {
    anomalies.push({
      type      : types[i],
      x         : random(600, WORLD_W - 600),
      y         : random(500, WORLD_H - 500),
      r         : random(110, 160),
      intensity : 0,
      phase     : random(TWO_PI),
      found     : false,
    });
  }
}

function draw() {
  t += 0.012;

  // ── 1. INPUT & MOVEMENT ───────────────────────────────────────
  const dx = (keyIsDown(RIGHT_ARROW)||keyIsDown(68)?1:0)
           - (keyIsDown(LEFT_ARROW) ||keyIsDown(65)?1:0);
  const dy = (keyIsDown(DOWN_ARROW) ||keyIsDown(83)?1:0)
           - (keyIsDown(UP_ARROW)   ||keyIsDown(87)?1:0);
  const len    = max(1, abs(dx) + abs(dy));
  const moving = dx !== 0 || dy !== 0;

  player.x = constrain(player.x + (dx / len) * player.spd, 0, WORLD_W);
  player.y = constrain(player.y + (dy / len) * player.spd, 0, WORLD_H);

  // ── 2. VELOCITY → CHAOS ───────────────────────────────────────
  velocity = dist(player.x, player.y, prevPos.x, prevPos.y);
  prevPos  = { x: player.x, y: player.y };
  chaos    = lerp(chaos, map(velocity, 0, player.spd, 0, 1, true), 0.04);

  // ── 3. EXPLORATION UNLOCK ─────────────────────────────────────
  explore = min(1, explore + (moving ? 0.0008 : 0.0001));

  // ── 4. TRAIL & FOOTPRINTS ─────────────────────────────────────
  trail.push({ x: player.x, y: player.y, h: (t * 55) % 360 });
  if (trail.length > TRAIL_LEN) trail.shift();

  footTimer++;
  if (moving && footTimer >= 18) {
    footTimer = 0;
    footprints.push({ x: player.x, y: player.y, age: 0, h: (t * 40) % 360 });
    if (footprints.length > FOOT_MAX) footprints.shift();
  }
  for (let f of footprints) f.age += 0.003;

  // ── 5. CAMERA ─────────────────────────────────────────────────
  const tX = constrain(player.x - VIEW_W / 2, 0, WORLD_W - VIEW_W);
  const tY = constrain(player.y - VIEW_H / 2, 0, WORLD_H - VIEW_H);
  cam.x = lerp(cam.x, tX, 0.1);
  cam.y = lerp(cam.y, tY, 0.1);

  // ── 6. ANOMALY PROXIMITY & DISCOVERY ─────────────────────────
  let maxGlitch = 0;
  for (let a of anomalies) {
    const d    = dist(player.x, player.y, a.x, a.y);
    const want = (d < a.r * 2.8) ? map(d, 0, a.r * 2.8, 1, 0) : 0;
    a.intensity = lerp(a.intensity, want, 0.04);

    if (!a.found && d < a.r) {
      a.found = true;
      pulses.push({
        x    : a.x,
        y    : a.y,
        born : t,
        hue  : a.type === 'bloom' ? 55 : a.type === 'vortex' ? 290 : 0,
        type : a.type,
      });
    }
    if (a.type === 'glitch') maxGlitch = max(maxGlitch, a.intensity);
  }

  // ── 7. BACKGROUND: WAVE INTERFERENCE ─────────────────────────
  background(0);
  const hDrift = t * 22;
  const satMin = lerp(10, 55,  explore);
  const satMax = lerp(40, 100, explore);
  const briMin = lerp(8,  20,  explore);
  const briMax = lerp(35, 82,  explore);
  const hSwing = lerp(120, 200, chaos);

  for (let sx = 0; sx < VIEW_W; sx += CELL) {
    for (let sy = 0; sy < VIEW_H; sy += CELL) {
      const wx = sx + cam.x;
      const wy = sy + cam.y;

      let w1 = 0, w2 = 0;
      for (let s of sources) {
        const ddx = wx - s.x, ddy = wy - s.y;
        const d   = sqrt(ddx * ddx + ddy * ddy);
        const ang = TWO_PI * d / s.λ - t * s.ω + s.φ;
        w1 += sin(ang);
        w2 += sin(ang * 1.41 + PI * 0.33);
      }
      w1 /= sources.length;
      w2 /= sources.length;

      const chaosShift = chaos > 0.1
        ? noise(wx * 0.005 + t * 0.4, wy * 0.005) * chaos * 80 : 0;

      const hue = (((w1 * hSwing + w2 * 70) + hDrift + chaosShift) % 360 + 360) % 360;
      const sat = map(w1 * w2, -1, 1, satMin, satMax);
      const bri = map(abs(w1) + abs(w2), 0, 2, briMin, briMax);

      noStroke();
      fill(hue, sat, bri);
      rect(sx, sy, CELL, CELL);
    }
  }

  // ── 8. WORLD-SPACE ELEMENTS ───────────────────────────────────
  push();
  translate(-cam.x, -cam.y);

  // Footprints — persistent glow marks
  noStroke();
  for (let f of footprints) {
    const alpha = map(f.age, 0, 1, 30, 0, true);
    if (alpha < 0.5) continue;
    fill(f.h, 55, 100, alpha);
    ellipse(f.x, f.y, map(f.age, 0, 1, 6, 18));
  }

  // Anomalies
  for (let a of anomalies) {
    if (a.intensity < 0.02) continue;
    const sx = a.x - cam.x, sy = a.y - cam.y;
    if (sx < -400 || sx > VIEW_W + 400 || sy < -400 || sy > VIEW_H + 400) continue;
    if (a.type === 'bloom')  drawBloom(a);
    if (a.type === 'vortex') drawVortex(a);
  }

  // Discovery pulses
  for (let i = pulses.length - 1; i >= 0; i--) {
    const p   = pulses[i];
    const age = t - p.born;
    if (age > 3.5) { pulses.splice(i, 1); continue; }
    const r  = map(age, 0, 3.5, 0, 420);
    const a  = map(age, 0, 3.5, 85, 0);
    const sw = map(age, 0, 3.5, 4, 0.5);
    noFill();
    stroke(p.hue, 80, 100, a);
    strokeWeight(sw);
    ellipse(p.x, p.y, r * 2);
    stroke(p.hue, 60, 100, a * 0.5);
    strokeWeight(sw * 0.6);
    ellipse(p.x, p.y, max(0, r - 60) * 2);
  }

  // Trail
  for (let i = 0; i < trail.length; i++) {
    const pct = i / trail.length;
    noStroke();
    fill(trail[i].h, 85, 100, pct * 90);
    ellipse(trail[i].x, trail[i].y, map(pct, 0, 1, 1.5, 11));
  }

  // Player
  const ph    = (t * 90) % 360;
  const pSize = lerp(18, 32, chaos);
  noStroke();
  for (let r = pSize; r > 0; r -= 3) {
    fill(ph, lerp(55, 90, chaos), 100, map(r, 0, pSize, lerp(55, 80, chaos), 0));
    ellipse(player.x, player.y, r * 2);
  }
  fill(0, 0, 100, 100);
  ellipse(player.x, player.y, 9);

  pop();

  // ── 9. GLITCH (screen space) ──────────────────────────────────
  if (maxGlitch > 0.05) drawGlitch(maxGlitch);

  // ── 10. DISCOVERY FLASH (screen space) ───────────────────────
  for (let p of pulses) {
    const age = t - p.born;
    if (age < 0.18) {
      noStroke();
      fill(p.hue, 40, 100, map(age, 0, 0.18, 28, 0));
      rect(0, 0, VIEW_W, VIEW_H);
    }
  }

  // ── 11. HUD ───────────────────────────────────────────────────
  const found = anomalies.filter(a => a.found).length;
  noStroke();
  textAlign(LEFT, TOP);
  textSize(11);
  textFont('monospace');
  fill(55, 35, 95, 40);
  text('INTERFERENCE', 14, 14);

  if (found > 0) {
    textAlign(RIGHT, TOP);
    fill(290, 60, 100, 50);
    text('anomalies: ' + found + '/9', VIEW_W - 14, 14);
  }

  if (chaos < 0.05 && explore > 0.05) {
    textAlign(CENTER, BOTTOM);
    textSize(10);
    fill(200, 15, 90, map(chaos, 0, 0.05, 22, 0));
    text('be still', VIEW_W / 2, VIEW_H - 12);
  }

  textAlign(LEFT, BOTTOM);
  textSize(10);
  fill(200, 20, 90, 22);
  text('WASD / ARROWS', 14, VIEW_H - 12);
}

function drawBloom(a) {
  const numRings = 14;
  for (let i = 0; i < numRings; i++) {
    const phase = (t * 1.6 + (i / numRings) * TWO_PI + a.phase) % TWO_PI;
    const r     = map(phase, 0, TWO_PI, 0, a.r * 2.8) * a.intensity;
    const alpha = map(phase, 0, TWO_PI, 90, 0) * a.intensity;
    const hue   = ((i / numRings * 360) + t * 45 + a.phase * 60) % 360;
    noFill();
    stroke(hue, 92, 100, alpha);
    strokeWeight(map(phase, 0, TWO_PI, 3, 0.4));
    ellipse(a.x, a.y, r * 2);
  }
  noStroke();
  for (let r = a.r * 0.55; r > 0; r -= 5) {
    const hue = ((r * 2.5 + t * 65) % 360 + 360) % 360;
    fill(hue, 100, 100, map(r, 0, a.r * 0.55, 90, 0) * a.intensity);
    ellipse(a.x, a.y, r * 2);
  }
}

function drawVortex(a) {
  push();
  translate(a.x, a.y);
  rotate(t * 1.1 * a.intensity);
  for (let arm = 0; arm < 5; arm++) {
    push();
    rotate((arm / 5) * TWO_PI);
    for (let step = 0; step < 90; step++) {
      const pct   = step / 90;
      const angle = pct * TWO_PI * 3.5;
      const r     = pct * a.r * 1.9 * a.intensity;
      const hue   = ((pct * 360 + arm * 72 + t * 70) % 360 + 360) % 360;
      stroke(hue, 88, 100, map(pct, 0, 1, 85, 0) * a.intensity);
      strokeWeight(map(pct, 0, 1, 2.8, 0.4));
      point(cos(angle) * r, sin(angle) * r);
    }
    pop();
  }
  noStroke();
  for (let r = 28; r > 0; r -= 3) {
    const hue = ((t * 130 + r * 6) % 360 + 360) % 360;
    fill(hue, 80, 100, map(r, 0, 28, 85, 0) * a.intensity);
    ellipse(0, 0, r * 2);
  }
  pop();
}

function drawGlitch(intensity) {
  for (let i = 0; i < floor(random(4, 10) * intensity); i++) {
    const gw = random(60, VIEW_W * 0.9);
    noStroke();
    fill(random(360), 95, 100, random(25, 65) * intensity);
    rect(random(VIEW_W - gw), random(VIEW_H), gw, random(2, floor(14 * intensity)));
  }
  for (let i = 0; i < floor(random(2, 6) * intensity); i++) {
    fill(0, 0, 100, random(15, 40) * intensity);
    rect(0, random(VIEW_H), VIEW_W, random(1, 3));
  }
  if (intensity > 0.55) {
    for (let i = 0; i < floor(random(3, 7)); i++) {
      fill(random() < 0.5 ? 0 : 180, 100, 100, random(15, 35) * intensity);
      rect(random(-6, 6), random(VIEW_H), VIEW_W, random(1, 5));
    }
  }
  if (random() < intensity * 0.35) {
    fill(random(360), 60, 100, 50 * intensity);
    rect(0, floor(random(VIEW_H)), VIEW_W, random(1, 6));
  }
}
