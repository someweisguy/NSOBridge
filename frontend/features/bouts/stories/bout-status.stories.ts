import type { Meta, StoryObj } from "@storybook/react-vite";
import BoutStatus from "../components/bout-status";

const meta: Meta<typeof BoutStatus> = {
  component: BoutStatus,
  title: "bouts/Bout Status",
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
