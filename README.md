# Circuit Style Hero Canvas

I was playing the game Transistor and was inspired by some of the animations in it, so I decided to try to replicate this in Javascript. The component is a massive mess that I will clean up one day but for now its cool to play with.

A deployed version of the storybook is available here:
https://aiden-ziegelaar.github.io/CircuitHero

To get started quick:

```yarn```

```yarn storybook```

# The Maths

Whilst it was fun to do the maths is pretty simple at its core, nothing above highschool level.

## Halflives

For each pip generated there a number of actions it can take on any tick, it can continue moving in the same direction, it can bifurcate into two pips, it can change direction, or it can die.

The likelihood of any of these functions occurring in a given tick is given by the halflife formulae:

$\% remaining = (\frac{1}{2})^{t/λ}$

or to convert this to a binary value of if the event occurred in that tick we can check if `Math.random()` returns a value greater than this number using the following javascript:

```javascript
  function probabilityFromHalflifeAndElapsed(halflife: number, elapsed: number): boolean {
      return Math.random() > (Math.pow(0.5,(elapsed/halflife)))
  }
```
## Directions

We want to emulate a circuit, hence to make a design reminiscent of a circuit board we constrain the ability of pips movement to the cardinal and intercardinal directions only. This allows us to easily precompute our sine and cosine multipliers:

```javascript
const directions = Array.from(Array(8).keys())
const sinPrecalc = directions.map((input) => Math.sin(input * Math.PI/4))
const cosPrecalc = directions.map((input) => Math.cos(input * Math.PI/4))
```

In this fashion we can consider the direction to be represented, not by a degree value, but by the index of the sine and cosine arrays, representing our 8 constrained directions.

## Trimming tails

For the pips themselves we can specify a very basic model:
```typescript
interface ILocation {
    x: number;
    y: number;
}

interface IPip {
    direction: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
    location: ILocation;
    path: IPath;
}

interface IPath {
    locations: ILocation[];
}
```
We can see our constrained directions indicated as the index of our sine and cosine array. To trim the tail all we do is add the distances of the locations in the path and work out the distance that the final element should be, either modifying the final element, or removing the last element and modifying the new last element in the case that a tail goes around a corner.

The trails have a lifetime and their length is determined by the velocity of each particle and the trail lifetime. For a pip that has been stopped, we simply add a timestamp to the pip of when it was stopped, then trim the tail by the difference in the stopped time and the elapsed time. Once the length of the tail reaches zero we remove the pip from the canvas.
