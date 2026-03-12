import BoutClock from "@/features/bouts/components/bout-clock";
import type { Meta, StoryObj } from "@storybook/react-vite";

const meta: Meta = {
  component: BoutClock,
  title: "Bout Clock",
};

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    isOvertime: false,
    startTimestamp: new Date(),
    alarm: 1800000,
    overtimeText: "OT",
  },
};

export const Centered: Story = {
  args: {
    isOvertime: false,
    startTimestamp: new Date(),
    alarm: 1800000,
    overtimeText: "OT",
    ta: "center",
  },
};

export default meta;
