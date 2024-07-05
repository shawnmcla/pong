import { Vec2 } from "./Vec2";


export class Line {
  constructor(public p1: Vec2, public p2: Vec2) { }
  get length() {
    return Math.sqrt((this.p2.x - this.p1.x) ** 2 + (this.p2.y - this.p1.y) ** 2);
  }
  get slope() {
    return (this.p2.y - this.p1.y) / (this.p2.x - this.p1.x);
  }
  get yIntercept() {
    return this.p1.y - this.slope * this.p1.x;
  }
  get xIntercept() {
    return -this.yIntercept / this.slope;
  }
  get midpoint() {
    return new Vec2((this.p1.x + this.p2.x) / 2, (this.p1.y + this.p2.y) / 2);
  }

  // Given another line, return the intersection point or null if lines do not intersect
  intersection(l: Line) {
    let x1 = this.p1.x;
    let y1 = this.p1.y;
    let x2 = this.p2.x;
    let y2 = this.p2.y;
    let x3 = l.p1.x;
    let y3 = l.p1.y;
    let x4 = l.p2.x;
    let y4 = l.p2.y;

    let d = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    if (d === 0) return null;

    let x = ((x3 - x4) * (x1 * y2 - y1 * x2) - (x1 - x2) * (x3 * y4 - y3 * x4)) / d;
    let y = ((y3 - y4) * (x1 * y2 - y1 * x2) - (y1 - y2) * (x3 * y4 - y3 * x4)) / d;

    return new Vec2(x, y);
  }

  debugDraw(ctx: CanvasRenderingContext2D) {
    ctx.strokeStyle = "green";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(this.p1.x, this.p1.y);
    ctx.lineTo(this.p2.x, this.p2.y);
    ctx.stroke();
  }
}
