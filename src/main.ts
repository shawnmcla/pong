import { Vec2 } from "./Vec2";
import { Line } from "./Line";
import { Rect } from "./Rect";

const canvas = document.getElementById('game')! as HTMLCanvasElement;
if (!canvas) throw new Error('Canvas not found');
const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
if (!ctx) throw new Error('2d context not found');

const paddleOffset = 30;
const pw = 10;
const ph = 60;
const bw = 10;
const bh = 10;
const minPaddleVel = new Vec2(0, -200);
const maxPaddleVel = new Vec2(0, 200);
const minBallVel = new Vec2(-500, -500);
const maxBallVel = new Vec2(500, 500);
const bounceRatio = 0.025;
const baseVel = 15;

let p1Score = 0;
let p2Score = 0;
let ballDir = Math.random() > 0.5 ? 1 : -1;
let waiting = false;

enum InputType {
  Up,
  Down,
  None
};

class Paddle extends Rect {
  vel = new Vec2(0, 0);
  constructor(public pos: Vec2, public size: Vec2) {
    super(pos, size);
  }
  handleInput(type: InputType) {
    switch (type) {
      case InputType.Up:
        this.vel.y -= baseVel;
        break;
      case InputType.Down:
        this.vel.y += baseVel;
        break;
      case InputType.None:
        const sign = -Math.sign(this.vel.y);
        this.vel.y += sign * baseVel * 2;
        if (Math.sign(this.vel.y) === sign) this.vel.y = 0;
        break;
    }
  }

  update(dt: number) {
    this.vel.clamp(minPaddleVel, maxPaddleVel);
    this.pos.add(this.vel.toScaled(dt));
  }
}

export class Ball extends Rect {
  vel = new Vec2(ballDir * 200, 0);
  bounceCount = 0;
  constructor(public pos: Vec2, public size: Vec2) {
    super(pos, size);
  }

  reset() {
    this.pos = new Vec2(canvas.width / 2, canvas.height / 2);
    this.vel.x = 0;
    this.vel.y = 0;
    this.bounceCount = 0;
  }

  shoot() {
    this.vel = new Vec2(ballDir * 200, 0);
  }

  update(dt: number) {
    this.pos.add(this.vel.toScaled(dt));
  }

  bounce(paddle: Paddle) {
    const distanceFromCenter = (this.pos.y + this.size.y / 2) - (paddle.pos.y + paddle.size.y / 2);
    this.vel.y = distanceFromCenter * 2;
    this.vel.x *= -1;
    this.vel.scale(1 + this.bounceCount * bounceRatio);
    this.bounceCount++;
    this.vel.clamp(minBallVel, maxBallVel);
  }
}

export class Particle extends Rect {
  initialTtl: number;

  constructor(public pos: Vec2, public vel = new Vec2(0, 0), public ttl = 2) {
    super(pos, new Vec2(3, 3));
    this.initialTtl = ttl;
  }

  get life() {
    return this.ttl / this.initialTtl;
  }

  update(dt: number) {
    this.ttl -= dt;
    if (this.ttl <= 0) return;
    this.pos.add(this.vel.toScaled(dt));
  }
}

let keys: Record<string, boolean> = {};
document.addEventListener('keydown', (e) => {
  if(e.key === ' ') {
    if(waiting){
      waiting = false;
      ball.shoot();
    }
  }
  keys[e.key] = true;
});
document.addEventListener('keyup', (e) => {
  keys[e.key] = false;
});

const p1 = new Paddle(new Vec2(paddleOffset, canvas.height / 2 - ph / 2), new Vec2(pw, ph));
const p2 = new Paddle(new Vec2(canvas.width - paddleOffset - pw, canvas.height / 2 - ph / 2), new Vec2(pw, ph));
const ball = new Ball(new Vec2(canvas.width / 2, canvas.height / 2), new Vec2(bw, bh));
let particles: Particle[] = [];

function processInput() {
  if (keys['w']) {
    p1.handleInput(InputType.Up);
    emitParticlesVertical(new Vec2(0, 1), new Vec2(p1.pos.x + pw/2, p1.pos.y + ph - 10), 1);
  } else if (keys['s']) {
    p1.handleInput(InputType.Down);
    emitParticlesVertical(new Vec2(0, -1), new Vec2(p1.pos.x + pw/2, p1.pos.y + 10), 1);
  } else {
    p1.handleInput(InputType.None);
  }

  if (keys['ArrowUp']) {
    p2.handleInput(InputType.Up);
    emitParticlesVertical(new Vec2(0, 1), new Vec2(p2.pos.x + pw/2, p2.pos.y + ph - 10), 1);
  } else if (keys['ArrowDown']) {
    p2.handleInput(InputType.Down);
    emitParticlesVertical(new Vec2(0, -1), new Vec2(p2.pos.x + pw/2, p2.pos.y + 10), 1);
  } else {
    p2.handleInput(InputType.None);
  }
}

function randomRange(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function emitParticles(direction: Vec2, pos: Vec2, count = 20) {
  for (let i = 0; i < count; i++) {
    const vel = Vec2.from(direction).scale(randomRange(50, 150));
    vel.y += randomRange(-50, 50);
    const p = new Particle(Vec2.from(pos), vel, randomRange(0.5, 1.5));
    particles.push(p);
  }
}
function emitParticlesVertical(direction: Vec2, pos: Vec2, count=20){
  for (let i = 0; i < count; i++) {
    const vel = Vec2.from(direction).scale(randomRange(50, 150));
    vel.x += randomRange(-50, 50);
    const p = new Particle(Vec2.from(pos), vel, randomRange(0.5, 1.5));
    particles.push(p);
  }
}
let frameCount = 0;
function update(dt: number) {
  processInput();
  p1.update(dt);
  p2.update(dt);

  const ballPrevPos = Rect.from(ball);
  ball.update(dt);

  particles.forEach(p => p.update(dt));
  particles = particles.filter(p => p.ttl > 0);
  // Check for collisions..
  // .. Ball and top/bottom bounds
  if (ball.pos.y < 0 || ball.pos.y > canvas.height - ball.size.y) {
    ball.vel.y *= -1;
  }
  // ..Ball and left/right bounds
  // .. Ball and paddles
  if (ball.intersects(p1)) {
    ball.pos.x = p1.right;
    ball.bounce(p1);
    emitParticles(new Vec2(1, 0), ball.pos);
  }
  // Ball went past paddle, check lines to see if they collided
  else if (ballPrevPos.pos.x >= p1.right && ball.pos.x < p1.right) {
    const line = new Line(ballPrevPos.center, ball.center);
    if (p1.intersectsLine(line)) {
      // Put ball where it would have collided
      let intersectionPoint = line.intersection(new Line(p1.topRight, p1.bottomRight));
      if (!intersectionPoint) {
        intersectionPoint = new Vec2(p1.right, p1.center.y);
      }
      ball.pos.x = intersectionPoint.x;
      ball.pos.y = intersectionPoint.y;
      ball.bounce(p1);
      emitParticles(new Vec2(1, 0), ball.pos);
    }
  }
  else if (ball.intersects(p2)) {
    ball.pos.x = p2.pos.x - ball.size.x;
    ball.bounce(p2);
    emitParticles(new Vec2(-1, 0), new Vec2(ball.pos.x + ball.size.x, ball.pos.y + ball.size.y / 2));
  }
  // Ball went past paddle, check lines to see if they collided
  else if (ballPrevPos.right <= p2.pos.x && ball.right > p2.pos.x) {
    const line = new Line(ballPrevPos.center, ball.center);
    if (p2.intersectsLine(line)) {
      // Put ball where it would have collided
      let intersectionPoint = line.intersection(new Line(p2.topLeft, p2.bottomLeft));
      if (!intersectionPoint) {
        intersectionPoint = new Vec2(p2.pos.x, p2.center.y);
      }
      ball.pos.x = intersectionPoint.x - ball.size.x;
      ball.pos.y = intersectionPoint.y - ball.size.y;
      ball.bounce(p1);
      emitParticles(new Vec2(1, 0), ball.pos);
    }
  }

  if (ball.pos.x <= -ball.size.x){
    p2Score++;
    ballDir = 1;
    waiting = true;
    ball.reset();
  }
  else if(ball.pos.x >= canvas.width) {
    p1Score++;
    ballDir = -1;
    waiting = true;
    ball.reset();
  }

  if (frameCount++ % 10 === 0) {
    updateDebugText();
  }
}

let debugTextLines: string[] = [];
function updateDebugText() {
  debugTextLines = [`P1: pos ${p1.pos.x.toFixed(2)}, ${p1.pos.y.toFixed(2)} vel ${p1.vel.x.toFixed(2)}, ${p1.vel.y.toFixed(2)}`,
  `P2: pos ${p2.pos.x.toFixed(2)}, ${p2.pos.y.toFixed(2)} vel ${p2.vel.x.toFixed(2)}, ${p2.vel.y.toFixed(2)}`,
  `Ball: pos ${ball.pos.x.toFixed(2)}, ${ball.pos.y.toFixed(2)} vel ${ball.vel.x.toFixed(2)}, ${ball.vel.y.toFixed(2)}`,
  `Particles count: ${particles.length} | Keys: ${Object.keys(keys).filter(k => keys[k]).join(', ')}`];
}

function drawDebugInfo() {
  ctx.fillStyle = '#6F6F6F';
  ctx.font = '12px monospace';
  const y = canvas.height - (debugTextLines.length) * 16;

  for (let i = 0; i < debugTextLines.length; i++) {
    ctx.fillText(debugTextLines[i], 10, y + i * 18);
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawDebugInfo();

  ctx.fillStyle = 'white';
  ctx.fillRect(p1.pos.x, p1.pos.y, p1.size.x, p1.size.y);
  ctx.fillRect(p2.pos.x, p2.pos.y, p2.size.x, p2.size.y);
  ctx.fillRect(ball.pos.x, ball.pos.y, ball.size.x, ball.size.y);
  particles.forEach(p => {
    ctx.fillStyle = `rgba(255, 255, 255, ${p.life})`;
    ctx.fillRect(p.pos.x, p.pos.y, p.size.x, p.size.y);
  });

  ctx.fillStyle = "#AFAFAF";
  ctx.font = '48px sans-serif';
  ctx.fillText(p1Score.toString(), 100, 60);
  ctx.fillText(p2Score.toString(), canvas.width  - 150, 60);

}

let prev = 0;

function tick(ts: number) {
  const dt = (ts - prev) / 1000;
  prev = ts;
  update(dt);
  draw();
  requestAnimationFrame(tick);
}

tick(0);