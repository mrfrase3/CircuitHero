
// randomly decide whether to floor or ceil the number of pips to generate
// weighted by the fractional part
export const weightedFloorOrCeil = (pips: number) => {
  return Math.floor(pips) + (Math.random() < (pips % 1) ? 1 : 0)
}

// location
export interface ILocation {
  x: number;
  y: number;
}

// direction utils
export type IDirection = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

const directions = Array.from(Array(8).keys());
const sinPrecalc = directions.map((input) => Math.sin(input * Math.PI/4));
const cosPrecalc = directions.map((input) => Math.cos(input * Math.PI/4));
export const sinDirection = (direction: IDirection) => sinPrecalc[direction];
export const cosDirection = (direction: IDirection) => cosPrecalc[direction];

export const randomDirection = () => Math.floor(Math.random() * 8) as IDirection;

// calculate the probability of an event occurring given a half-life and the time elapsed
export const probabilityFromHalflifeAndElapsed = (halflife: number, elapsed: number) => {
  return Math.random() > (Math.pow(0.5,(elapsed/halflife)))
}

// set the opacity of a colour
export const setOpacity = (colour: string, opacity: number) => {
  if (colour.startsWith('#')) {
    return colour.slice(0, 7) + Math.round(opacity * 255).toString(16);
  }
  if (colour.startsWith('rgb(')) {
    return colour.replace(/$rgb\(/, `rgba(`).replace(/\)$/, `,${opacity})`);
  }
  if (colour.startsWith('rgba(')) {
    return colour.replace(/,[0-9.]+\)$/, `,${opacity})`);
  }
  if (colour.startsWith('hsl(')) {
    return colour.replace(/$hsl\(/, `hsla(`).replace(/\)$/, `,${opacity})`);
  }
  if (colour.startsWith('hsla(')) {
    return colour.replace(/,[0-9.]+\)$/, `,${opacity})`);
  }
  return colour;
}
