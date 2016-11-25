// ——————————————————————————————————————————————————
// Dependencies
// ——————————————————————————————————————————————————

import Vertex from './vertex';
import Line from './line';

// ——————————————————————————————————————————————————
// Helpers
// ——————————————————————————————————————————————————

// Cosine rule (SSS) a^2 = b^2 + c^2 - 2bc cos A
const SSS = (a, b, c) => Math.acos(a * a + b * b - c * c) / (2 * a * b);

// ——————————————————————————————————————————————————
// Polygon
// ——————————————————————————————————————————————————

class Polygon {
  constructor(...vertices) {
    this.vertices = vertices;
    // Assign principal generation
    this.generation = 0;
    // unique lines
    this.unique = [];
  }
  // Subdivides this polygon into 2 and returns both
  subdivide(randomness = 0.0, opposite = 0.5) {
    let i1, i2, j1, j2, l1, l2, nv, p1, p2, v1, v2;
    // Current number of sides
    nv = this.vertices.length;
    // Choose two unique indices
    i1 = ~~random(nv);
    i2 = random() < opposite ? (~~(i1 + nv / 2) % nv) : ~~random(nv);
    while (i2 === i1) { i2 = ~~random(nv); }
    // Choose lerp points
    l1 = 0.5 + random(randomness * -0.5, randomness * 0.5);
    l2 = 0.5 + random(randomness * -0.5, randomness * 0.5);
    // Create new vertices as linear interpolations between adjacent
    v1 = this.vertices[i1].lerp(this.vertices[(i1 + 1) % nv], l1);
    v2 = this.vertices[i2].lerp(this.vertices[(i2 + 1) % nv], l2);
    // Winding iterators
    [j1, j2] = [i1, i2];
    // First polygon winds clockwise from v1 to v2
    p1 = new Polygon(v1);
    while (j1 !== i2) {
      p1.vertices.push(this.vertices[j1 = (j1 + 1) % nv]);
    }
    p1.vertices.push(v2);
    // Second polygon winds clockwise from v2 to v1
    p2 = new Polygon(v2);
    while (j2 !== i1) {
      p2.vertices.push(this.vertices[j2 = (j2 + 1) % nv]);
    }
    p2.vertices.push(v1);
    // Increment generations
    p1.generation = this.generation + 1;
    p2.generation = this.generation + 1;
    // Store this unique line only
    p1.unique.push(new Line(v1, v2));
    // Return new polygons
    return [p1, p2];
  }
  // Computes the centroid point
  centroid() {
    // Centroid points
    let cx = 0.0;
    let cy = 0.0;
    // Sum all vertices
    this.vertices.forEach(vertex => {
      cx += vertex.x;
      cy += vertex.y;
    });
    // Take an average as the centroid
    return new Vertex(
      cx / this.vertices.length,
      cy / this.vertices.length
    );
  }
  // Computes the minimum angle between vertices
  minAngle() {
    let val = Number.MAX_VALUE;
    let len = this.vertices.length;
    // Build triangles from vertices
    let prev, next, a, b, c, A, B, C;
    this.vertices.forEach((vertex, index) => {
      // Next / previous vertices in loop
      prev = this.vertices[(index - 1 + len) % len];
      next = this.vertices[(index + 1 + len) % len];
      // Compute triangle sides
      a = prev.distance(vertex);
      b = next.distance(vertex);
      c = next.distance(prev);
      // Compute angles
      A = SSS(b, c, a);
      B = SSS(c, a, b);
      C = Math.PI - A - B;
      // store the lowest
      val = min(val, C);
    });
    return val;
  }
  // Computes the minimum side length
  minSide() {
    let side = Number.MAX_VALUE;
    let prev = this.vertices[this.vertices.length - 1];
    this.vertices.forEach(vertex => {
      side = Math.min(side, vertex.distanceSq(prev));
      prev = vertex;
    });
    return Math.sqrt(side);
  }
  // Computes the perimeter of this polygon
  perimeter() {
    let first = this.vertices[0];
    let last = this.vertices[this.vertices.length - 1];
    let result = last.distance(first);
    this.vertices.reduce((a, b) => result += a.distance(b), b);
    return result;
  }
  // Draws this polygon to a given context
  draw(context) {
    context.beginPath();
    this.vertices.forEach(({ x, y }, index) => {
      if (index === 0) {
        context.moveTo(x, y);
      } else {
        context.lineTo(x, y);
      }
    });
    context.closePath();
  }
}

// ——————————————————————————————————————————————————
// Exports
// ——————————————————————————————————————————————————

export default Polygon;
