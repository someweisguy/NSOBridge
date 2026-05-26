import type { Meta, StoryObj } from "@storybook/react-vite";
import JammerState from "../components/jammer-state";

const meta: Meta<typeof JammerState> = {
  component: JammerState,
  title: "Jammer State",
  argTypes: {
    w: {
      type: "number",
    },
    h: {
      type: "number",
    },
  },
};

type Story = StoryObj<typeof meta>;

export const Lead: Story = {
  args: {
    lead: true,
    lost: false,
    starPass: false,
    w: 50,
    h: 50,
  },
};

export const Lost: Story = {
  args: {
    lead: false,
    lost: true,
    starPass: false,
    w: 50,
    h: 50,
  },
};

export const StarPass: Story = {
  args: {
    lead: false,
    lost: false,
    starPass: true,
    w: 50,
    h: 50,
  },
};

export const Default: Story = {
  args: {
    lead: false,
    lost: false,
    starPass: false,
    w: 50,
    h: 50,
  },
};

export default meta;
