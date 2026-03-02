import type { Meta, StoryObj } from "@storybook/react-vite";
import { JamClock } from "../components/jam-clock";

const meta: Meta = {
  component: JamClock,
  title: "Jam Clock",
};

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    startTimestamp: new Date(),
    alarm: 2 * 60 * 1000,
    isStopped: false,
    stopReasonText: "-",
  },
};

export const Called: Story = {
  args: {
    startTimestamp: new Date(),
    alarm: 2 * 60 * 1000,
    isStopped: true,
    stopReasonText: "Called",
  },
};

export const TimedOut: Story = {
  args: {
    startTimestamp: new Date(),
    alarm: 2 * 60 * 1000,
    isStopped: true,
    stopReasonText: "Time",
  },
};

export const Injury: Story = {
  args: {
    startTimestamp: new Date(),
    alarm: 2 * 60 * 1000,
    isStopped: true,
    stopReasonText: "Injury",
  },
};

export const UnknownStopReason: Story = {
  args: {
    startTimestamp: new Date(),
    alarm: 2 * 60 * 1000,
    isStopped: true,
  },
};

export default meta;
