import type { Meta, StoryObj } from "@storybook/react-vite";
import JammerTripControl from "../components/jammer-trip-control";

const meta: Meta<typeof JammerTripControl> = {
  component: JammerTripControl,
  title: "Jammer Trip Control",
  argTypes: {
    w: {
      control: { type: "number" },
    },
  },
};

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    numPasses: 4,
    showInitial: false,
  },
};

export default meta;
