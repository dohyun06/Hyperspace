import { Controller } from './controller.js';
import { Graph } from './graph.js';

class App {
  constructor() {
    this.controller = new Controller();
    this.graph = new Graph(this.controller);

    this.canvas = document.querySelector('canvas');
    this.ctx = this.canvas.getContext('2d');

    window.addEventListener('resize', this.resize.bind(this), false);
    this.resize();

    requestAnimationFrame(this.animate.bind(this));
  }

  resize() {
    this.width = (document.body.clientWidth * 75) / 100;
    this.height = document.body.clientHeight;
    this.canvas.width = this.width * 2;
    this.canvas.height = this.height * 2;

    this.ctx.scale(2, 2);

    this.graph.resize(this.width, this.height);
  }

  animate() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    this.graph.draw(this.ctx);

    requestAnimationFrame(this.animate.bind(this));
  }
}

window.onload = () => {
  new App();
};
