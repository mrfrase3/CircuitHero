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
  pipTickGenerationChance: 0.5,
  generateRandomPips: true,
  randomMaxDensity: 10,
  maxPips: 200
};