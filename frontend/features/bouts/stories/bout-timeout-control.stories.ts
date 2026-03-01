import type { Meta, StoryObj } from "@storybook/react-vite";
import BoutTimeoutControl from "../components/bout-timeout-control";

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
