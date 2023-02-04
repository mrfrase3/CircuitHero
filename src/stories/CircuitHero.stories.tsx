import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';

import { CircuitHero } from '../Components/CircuitHero';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Components/CircuitHero',
  component: CircuitHero,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  argTypes: {
    pipColour: { control: 'color' },
    trailColour: { control: 'color' },
  },
} as ComponentMeta<typeof CircuitHero>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof CircuitHero> = (args) => <CircuitHero {...args} />;

export const Primary = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Primary.args = {
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
  randomPipsPerSecond: 50,
  generateRandomPips: true,
  maxPips: 200
};

export const MouseMove = Template.bind({});

MouseMove.args = {
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
  randomPipsPerSecond: 50,
  generateRandomPips: false,
  maxPips: 200
};

export const MouseMoveHighSpec = Template.bind({});
MouseMoveHighSpec.args = {
  width: 600,
  height: 400,
  pipColour: '#FF9F1C',
  trailColour: '#67E0A3',
  speed: 0.1,
  pipHalflife: 1000,
  turnHalflife: 500,
  trailLife: 2000,
  bifurcateHalflife: 3000,
  mousePipsPerSecond: 80,
  randomPipsPerSecond: 80,
  generateRandomPips: false,
  maxPips: 500
};

export const BifurcationAmplification = Template.bind({});
BifurcationAmplification.args = {
  width: 600,
  height: 400,
  pipColour: '#FF9F1C',
  trailColour: '#67E0A3',
  speed: 0.05,
  pipHalflife: 1000,
  turnHalflife: 500,
  trailLife: 2000,
  bifurcateHalflife: 700,
  mousePipsPerSecond: 10,
  randomPipsPerSecond: 10,
  generateRandomPips: false,
  maxPips: 300
};