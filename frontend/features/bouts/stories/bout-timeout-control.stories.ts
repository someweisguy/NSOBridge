import BoutTimeoutControl from "@/features/bouts/components/bout-timeout-control";
import type { Meta, StoryObj } from "@storybook/react-vite";

const meta: Meta = {
  component: BoutTimeoutControl,
  title: "bouts/Bout Timeout Control",
  argTypes: {},
};

type Story = StoryObj<typeof meta>;

export const TimeoutNotRunning: Story = {
  args: {
    state: "lineup",
  },
};

export const TimeoutRunning: Story = {
  args: {
    state: "timeout",
  },
};

export default meta;
