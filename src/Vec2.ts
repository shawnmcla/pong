export class Vec2 {
  constructor(public x: number, public y: number) { }
  static from(v: Vec2) {
    return new Vec2(v.x, v.y);
  }

  toNegated(): Vec2 {
    return new Vec2(-this.x, -this.y);
  }

  add(v: Vec2) {
    this.x += v.x;
    this.y += v.y;
    return this;
  }

  sub(v: Vec2) {
    this.x -= v.x;
    this.y -= v.y;
    return this;
  }

  mul(v: Vec2) {
    this.x *= v.x;
    this.y *= v.y;
    return this;
  }

  div(v: Vec2) {
    this.x /= v.x;
    this.y /= v.y;
    return this;
  }

  scale(s: number) {
    this.x *= s;
    this.y *= s;
    return this;
  }

  clamp(min: Vec2, max: Vec2) {
    this.x = Math.max(min.x, Math.min(this.x, max.x));
    this.y = Math.max(min.y, Math.min(this.y, max.y));
    return this;
  }

  toClamped(min: Vec2, max: Vec2) {
    return new Vec2(Math.max(min.x, Math.min(this.x, max.x)), Math.max(min.y, Math.min(this.y, max.y)));
  }

  toScaled(s: number) {
    return new Vec2(this.x * s, this.y * s);
  }

  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }
}