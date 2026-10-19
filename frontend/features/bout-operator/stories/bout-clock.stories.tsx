import {
  boutStateArgType,
  boutSubStateArgType,
  jamStopReasonArgType,
} from "@/utils/storybook";
import type { Meta, StoryObj } from "@storybook/react-vite";
import BoutClock from "../components/bout-clock";

const meta: Meta = {
  component: BoutClock,
  title: "Bout Operator/Bout Clock",
  argTypes: {
    jamStopReason: jamStopReasonArgType,
    boutState: boutStateArgType,
    boutSubState: boutSubStateArgType,
  },
};

type Story = StoryObj<typeof meta>;

export const Jam: Story = {
  args: {
    boutClock: {
      startTimestamp: new Date(),
      elapsed: 0,
      alarm: 30 * 60 * 1000,
    },
    boutState: "jam",
    boutSubState: "jam",
    periodNum: 0,
    jamNum: 0,
    jamStopReason: "call",
    lastEventTimestamp: new Date(),
    jamDuration: 2 * 60 * 1000,
  },
};

export default meta;
