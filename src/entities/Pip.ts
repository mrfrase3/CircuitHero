import type { ICircuitHeroProps } from "../CircuitHero";
import {
  randomDirection,
  probabilityFromHalflifeAndElapsed,
  setOpacity,
  sinDirection,
  cosDirection,
  type IDirection,
  type ILocation,
} from "../utils";

export class Pip {
  props: ICircuitHeroProps
  canvas: HTMLCanvasElement
  direction: IDirection
  location: ILocation
  path: ILocation[]
  bornAt: number
  stoppedAt: number
  remainingLife: number // percentage of life remaining when stopped, between 0 and 1
  diedAt: number

  constructor(
    props: ICircuitHeroProps,
    canvas: HTMLCanvasElement,
    location: ILocation,
    direction?: IDirection
  ) {
    this.props = props;
    this.canvas = canvas;
    this.reset(location, direction);
  }

  get isStopped() {
    return this.stoppedAt > 0;
  }

  get isAlive() {
    return this.diedAt === 0;
  }

  get lastLocation() {
    return this.path[this.path.length - 1];
  }

  reset(location: ILocation, direction?: IDirection) {
    this.direction = direction || randomDirection();
    this.location = { ...location };
    this.path = [{ ...location }, { ...location }];
    this.bornAt = performance.now();
    this.stoppedAt = 0;
    this.remainingLife = 1;
    this.diedAt = 0;
  }

  addPathLocation(location: ILocation) {
    this.path.push({ ...location });
  }

  tryStop(now: number, delta: number) {
    if (this.isStopped) {
      if (this.isAlive && (now - this.stoppedAt > this.props.trailLife)) {
        this.diedAt = now;
      } else {
        this.remainingLife = Math.max(1 - ((now - this.stoppedAt) / this.props.trailLife), 0);
      }
      return;
    }
    if (
      this.location.x < -10
      || this.location.y < -10
      || this.location.x > this.canvas.width + 10
      || this.location.y > this.canvas.height + 10
      || probabilityFromHalflifeAndElapsed(this.props.pipHalflife, delta)
    ) {
      this.stoppedAt = now;
    }
  }

  turnOnePlace() {
    const change = Math.random() > 0.5 ? 1 : -1;
    return (this.direction + change + 8) % 8 as IDirection;
  }

  tryTurn(now: number, delta: number) {
    if (this.isStopped || !this.isAlive) {
      return;
    }
    if (probabilityFromHalflifeAndElapsed(this.props.turnHalflife, delta)) {
      this.direction = this.turnOnePlace();
      this.addPathLocation(this.location);
    }
  }

  tryBifurcate(now: number, delta: number) {
    return !this.isStopped
      && this.isAlive
      && probabilityFromHalflifeAndElapsed(this.props.bifurcateHalflife, delta);
  }

  evaluatePathDistance(now: number) {
    if (!this.isAlive) {
      return;
    }
    let distance = this.props.trailLife * this.props.speed;
    if (this.isStopped) {
      const timeLeft = this.props.trailLife - (now - this.stoppedAt);
      distance = timeLeft * this.props.speed;
    }
    let pathLength = 0;
    for(let i = this.path.length -1; i > 0; i--) {
      const currLocation = this.path[i];
      const prevLocation = this.path[i-1];
      const x = currLocation.x - prevLocation.x;
      const y = currLocation.y - prevLocation.y;
      let thisPathLength: number;
      if (x == 0) {
        thisPathLength = Math.abs(y);
      } else if (y == 0) {
        thisPathLength = Math.abs(x);
      } else {
        thisPathLength = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
      }
      pathLength += thisPathLength;
      if (pathLength > distance) {
        this.path.splice(0, i - 1);
        const terminatingDistance = pathLength - distance;
        const scale = terminatingDistance / thisPathLength;
        this.path[0].x = prevLocation.x + scale * x;
        this.path[0].y = prevLocation.y + scale * y;
        break;
      }
    }
  }
  
  move(now: number, delta: number) {
    if (this.isStopped || !this.isAlive) {
      if (this.isAlive) this.evaluatePathDistance(now);
      return;
    }

    const speed = this.props.speed;
    this.location.x = this.location.x + speed * delta * cosDirection(this.direction);
    this.location.y = this.location.y + speed * delta * sinDirection(this.direction);
    this.lastLocation.x = this.location.x;
    this.lastLocation.y = this.location.y;
    this.evaluatePathDistance(now);
  }

  tick(now: number, delta: number) {
    this.tryStop(now, delta);
    this.tryTurn(now, delta);
    this.move(now, delta);
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (!this.isAlive) {
      return;
    }

    ctx.beginPath();
    const opacity = Math.max(0.1, this.remainingLife);
    const pipColour = setOpacity(this.props.pipColour, opacity);
    ctx.strokeStyle = pipColour;
    ctx.shadowColor = pipColour;
    ctx.shadowBlur = 4 * opacity;
    ctx.rect(this.location.x - 1, this.location.y - 1, 2, 2);
    ctx.stroke();

    const pathColour = setOpacity(this.props.trailColour, opacity);
    ctx.beginPath();
    ctx.strokeStyle = pathColour;
    ctx.shadowColor = pathColour;
    ctx.shadowBlur = 1 * opacity;
    ctx.moveTo(this.path[0].x, this.path[0].y)
    for(let i = 1; i < this.path.length; i++) {
        ctx.lineTo(this.path[i].x, this.path[i].y)
    }
    ctx.stroke();
  }

}
