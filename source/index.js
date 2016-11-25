// ——————————————————————————————————————————————————
// Dependencies
// ——————————————————————————————————————————————————

import Polygon from './polygon';
import Vertex from './vertex';
import Sketch from 'sketch-js';

// ——————————————————————————————————————————————————
// Main
// ——————————————————————————————————————————————————

const Crystallisation = Sketch.create({
  // Sketch settings
  container: document.getElementById('container'),
  autoclear: false,
  retina: 'auto',
  // Configurable
  settings: {
    iterations: 50,
    randomness: 0.25,
    opposite: 0.1,
    minAngle: 0.4,
    minSide: 2
  },
  // Custom properties
  polygons: [],
  lines: [],
  // Setup
  setup() {
    this.reset();
  },
  // Subdivide next polygon
  step() {
    // Choose a polygon to subdivide
    const index = ~~random(this.polygons.length - 1);
    // Subdivide the polygon
    const slices = this.polygons[index].subdivide(
      this.settings.randomness,
      this.settings.opposite
    );
    // Check whether all slices are usable
    let drop = false;
    let i, slice, n = slices.length;
    for (i = 0; i < n; i++) {
      slice = slices[i];
      if (slice.minAngle() < this.settings.minAngle) {
        drop = true;
        break;
      }
    }
    for (i = 0; i < n; i++) {
      slice = slices[i];
      if (slice.minSide() < this.settings.minSide) {
        drop = true;
        break;
      }
    }
    // If all slices are usable
    if (!drop) {
      // Remember unique lines from the chosen polygons
      this.polygons[index].unique.forEach(line => this.lines.push(line));
      // Draw and store the slices
      // TODO move to top level
      
      slices.forEach(slice => {
        this.polygons.push(slice);
        slice.draw(this);
      });
      this.fill();
      this.stroke();
      // Remove the original polygon
      this.polygons.splice(index, 1);
    }
  },
  // Clears the canvas
  clear() {
    this.clearRect(0, 0, this.canvas.width, this.canvas.height);
  },
  // Clears polygons to a single rectangle
  reset() {
    // Initial bounding box points
    const a = new Vertex(0, 0);
    const b = new Vertex(this.width, 0);
    const c = new Vertex(this.width, this.height);
    const d = new Vertex(0, this.height);
    // Initial bounding polygon
    this.polygons = [new Polygon(a, b, c, d)];
    // Clear stored lines
    this.lines = [];
    this.clear();
  },
  resize() {
    this.strokeStyle = '#333';
    this.fillStyle = '#fcfcfc';
    this.lineWidth = 0.25;
  },
  // Toggle update loop
  toggle() {
    if (this.running) this.stop();
    else this.start();
  },
  // Sketch.js update loop
  draw() {
    for (let i = 0; i < this.settings.iterations; i++) {
      this.step();
    }
  },
  // Save output as an image
  export() {
    window.open(this.canvas.toDataURL(), 'Crystallisation');
  }
});

const gui = new dat.GUI();
gui.add(Crystallisation.settings, 'minSide').min(0).max(100).name('Min Side Length');
gui.add(Crystallisation.settings, 'minAngle').min(0.0).max(1.2).step(0.01).name('Min Angle (rad)');
gui.add(Crystallisation.settings, 'iterations').min(1).max(100).name('Iterations');
gui.add(Crystallisation.settings, 'randomness').min(0.0).max(1.0).step(0.01).name('Randomness');
gui.add(Crystallisation.settings, 'opposite').min(0.0).max(1.0).step(0.01).name('Opposite Sides');
gui.add(Crystallisation, 'toggle').name('Start / Stop');
gui.add(Crystallisation, 'reset').name('Reset Polygons');
gui.add(Crystallisation, 'clear').name('Clear Canvas');
gui.add(Crystallisation, 'export').name('Save');
gui.close();
