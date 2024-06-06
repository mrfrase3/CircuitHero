import { Pip } from "./entities/Pip";
import { weightedFloorOrCeil, type IDirection, type ILocation } from "./utils";

export interface ICircuitHeroProps {
  width: number;
  height: number;
  pipColour: string;
  trailColour: string;
  speed: number;
  pipHalflife: number;
  turnHalflife: number;
  trailLife: number;
  bifurcateHalflife: number;
  generateMousePips: boolean;
  mousePipsPerSecond: number;
  generateRandomPips: boolean;
  randomPipsPerSecond: number;
  maxPips: number;
}

export type CircuitHeroProps = Partial<ICircuitHeroProps>

const defaultCircuitHeroProps: ICircuitHeroProps = {
  width: 600,
  height: 400,
  pipColour: '#FF9F1C',
  trailColour: '#67E0A3',
  speed: 0.05,
  pipHalflife: 1000,
  turnHalflife: 500,
  trailLife: 2000,
  bifurcateHalflife: 3000,
  mousePipsPerSecond: 50,
  generateMousePips: true,
  randomPipsPerSecond: 50,
  generateRandomPips: true,
  maxPips: 200
};

export class CircuitHero {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  props: ICircuitHeroProps;
  pips: Pip[] = [];
  // trails: Trail[] = [];
  lastTime = 0;
  deadPips: Pip[] = [];
  mouseLocation: ILocation = { x: 0, y: 0 };
  isMouseOverCanvas = false;
  isAlive = false;

  constructor(canvas: HTMLCanvasElement, props: CircuitHeroProps) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Could not get canvas context');
    }
    this.ctx = ctx;
    this.props = {
      ...defaultCircuitHeroProps,
      ...props,
    }
    this.start();
  }

  createPip(location: ILocation, direction?: IDirection) {
    if (this.deadPips.length > 0) {
      const pip = this.deadPips.pop() as Pip;
      pip.reset(location, direction);
      this.pips.push(pip);
    } else {
      this.pips.push(new Pip(this.props, this.canvas, location, direction));
    }
  }

  onCanvasMouseMove = (event: MouseEvent) => {
    const rect = this.canvas.getBoundingClientRect();
    this.mouseLocation = {
      x: Math.floor(event.clientX - rect.left),
      y: Math.floor(event.clientY - rect.top),
    };
  }

  onCanvasMouseEnter = () => {
    this.isMouseOverCanvas = true;
  }

  onCanvasMouseLeave = () => {
    this.isMouseOverCanvas = false;
  }

  start() {
    if (this.props.generateMousePips) {
      this.canvas.addEventListener('mousemove', this.onCanvasMouseMove);
      this.canvas.addEventListener('mouseenter', this.onCanvasMouseEnter);
      this.canvas.addEventListener('mouseleave', this.onCanvasMouseLeave);
    }
    this.isAlive = true;
    this.lastTime = performance.now();
    this.loop();
  }

  stop() {
    if (this.props.generateMousePips) {
      this.canvas.removeEventListener('mousemove', this.onCanvasMouseMove);
      this.canvas.removeEventListener('mouseenter', this.onCanvasMouseEnter);
      this.canvas.removeEventListener('mouseleave', this.onCanvasMouseLeave);
    }
    this.isAlive = false;
  }

  generatePips(elapsed: number) {
    const pipsAvailable = this.props.maxPips - this.pips.length;
    if (pipsAvailable < 1) return;

    let mousePips = this.isMouseOverCanvas
      ? weightedFloorOrCeil(this.props.mousePipsPerSecond * (elapsed / 1000))
      : 0;
    let randomPips = this.props.generateRandomPips
      ? weightedFloorOrCeil(this.props.randomPipsPerSecond * (elapsed / 1000))
      : 0;
    if (!mousePips && !randomPips) return;
    const totalPips = mousePips + randomPips;
    if (totalPips > pipsAvailable) {
      const ratio = mousePips / (mousePips + randomPips);
      mousePips = Math.floor(pipsAvailable * ratio);
      randomPips = pipsAvailable - mousePips;
    }

    for (let i = 0; i < mousePips; i++) {
      this.createPip({ ...this.mouseLocation });
    }

    for (let i = 0; i < randomPips; i++) {
      this.createPip({
        x: Math.floor(Math.random() * this.canvas.width),
        y: Math.floor(Math.random() * this.canvas.height),
      });
    }
  }

  tick() {
    const now = performance.now();
    const elapsed = now - this.lastTime;
    this.lastTime = now;
    const removeIndexes: number[] = [];
    [...this.pips].forEach((pip, index) => {
      pip.tick(now, elapsed);
      if (!pip.isAlive) {
        removeIndexes.push(index);
      } else if (this.pips.length < this.props.maxPips) {
        if (pip.tryBifurcate(now, elapsed)) {
          this.createPip({ ...pip.location }, pip.turnOnePlace());
        }
      }
    });
    removeIndexes.reverse().forEach((index) => {
      const [pip] = this.pips.splice(index, 1);
      this.deadPips.push(pip);
    });
    this.generatePips(elapsed);
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.pips.forEach((pip) => {
      pip.draw(this.ctx);
    });
  }

  loop() {
    if (!this.isAlive) {
      return;
    }
    this.tick();
    this.draw();
    requestAnimationFrame(() => this.loop());
  }
}