import GameClock from "@/features/bouts/components/game-clock";
import type { Meta, StoryObj } from "@storybook/react-vite";

const meta: Meta = {
  component: GameClock,
  title: "Game Clock",
  parameters: {
    deepControls: { enabled: true },
  },
};

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    clock: {
      startTimestamp: "",
      elapsed: 0,
      alarm: 1800000,
    },

    activePeriodNum: 0,
    activeJamNum: 0,
    uuid: "",
    state: {},
  },
};

export default meta;
