// ——————————————————————————————————————————————————
// Vertex
// ——————————————————————————————————————————————————

class Vertex {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }
  distanceSq(other) {
    const dx = other.x - this.x;
    const dy = other.y - this.y;
    return dx * dx + dy * dy;
  }
  distance(other) {
    const dx = other.x - this.x;
    const dy = other.y - this.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
  angle(other) {
    const dx = other.x - this.x;
    const dy = other.y - this.y;
    return Math.atan2(dy, dx);
  }
  lerp(other, amount) {
    const dx = other.x - this.x;
    const dy = other.y - this.y;
    return new Vertex(this.x + dx * amount, this.y + dy * amount);
  }
  clone() {
    return new Vertex(this.x, this.y);
  }
}

// ——————————————————————————————————————————————————
// Exports
// ——————————————————————————————————————————————————

export default Vertex;
