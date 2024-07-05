import { Vec2 } from "./Vec2";
import { Line } from "./Line";


export class Rect {
  constructor(public pos: Vec2, public size: Vec2) { }
  get center(): Vec2 { return new Vec2(this.pos.x + this.size.x / 2, this.pos.y + this.size.y / 2); }
  get topLeft(): Vec2 { return this.pos; }
  get bottomRight(): Vec2 { return Vec2.from(this.pos).add(this.size); }
  get topRight(): Vec2 { return new Vec2(this.pos.x + this.size.x, this.pos.y); }
  get bottomLeft(): Vec2 { return new Vec2(this.pos.x, this.pos.y + this.size.y); }
  get right(): number { return this.pos.x + this.size.x; }
  get bottom(): number { return this.pos.y + this.size.y; }
  static from(r: Rect) {
    return new Rect(Vec2.from(r.pos), Vec2.from(r.size));
  }
  pointInside(p: Vec2) {
    return p.x > this.pos.x && p.x < this.pos.x + this.size.x && p.y > this.pos.y && p.y < this.pos.y + this.size.y;
  }
  intersects(r: Rect) {
    return this.pos.x < r.pos.x + r.size.x && this.pos.x + this.size.x > r.pos.x && this.pos.y < r.pos.y + r.size.y && this.pos.y + this.size.y > r.pos.y;
  }
  intersectsLine(l: Line) {
    let minX = l.p1.x;
    let maxX = l.p2.x;

    if (l.p1.x > l.p2.x) {
      minX = l.p2.x;
      maxX = l.p1.x;
    }

    if (maxX > this.pos.x + this.size.x)
      maxX = this.pos.x + this.size.x;

    if (minX < this.pos.x)
      minX = this.pos.x;

    if (minX > maxX)
      return false;

    let minY = l.p1.y;
    let maxY = l.p2.y;

    let dx = l.p2.x - l.p1.x;

    if (Math.abs(dx) > 1e-7) {
      let a = (l.p2.y - l.p1.y) / dx;
      let b = l.p1.y - a * l.p1.x;
      minY = a * minX + b;
      maxY = a * maxX + b;
    }

    if (minY > maxY) {
      let tmp = maxY;
      maxY = minY;
      minY = tmp;
    }

    if (maxY > this.pos.y + this.size.y)
      maxY = this.pos.y + this.size.y;

    if (minY < this.pos.y)
      minY = this.pos.y;

    if (minY > maxY)
      return false;

    return true;
  }
}
