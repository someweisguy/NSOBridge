import GameClock from "@/features/bouts/components/game-clock";
import type { Meta, StoryObj } from "@storybook/react-vite";

const meta: Meta = {
  component: GameClock,
  title: "Game Clock",
  argTypes: {
    stopReason: {
      control: "radio",
      options: ["called", "elapsed", "other", "injury", null],
    },
    state: {
      control: "radio",
      options: ["lineup", "stopped", "jam", "timeout", "final"],
    },
  },
};

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    clock: {
      startTimestamp: new Date().toISOString(),
      elapsed: 0,
      alarm: 1800000,
    },
    startTimestamp: new Date().toISOString(),
    activePeriodNum: 0,
    activeJamNum: 0,
    jamDuration: 120000,
    state: "lineup",
    stopReason: "elapsed",
    fz: 32,
    w: "400px",
  },
};

export default meta;
