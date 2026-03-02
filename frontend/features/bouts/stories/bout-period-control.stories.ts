import BoutPeriodControl from "@/features/bouts/components/bout-period-control";
import type { Meta, StoryObj } from "@storybook/react-vite";

const meta: Meta = {
  component: BoutPeriodControl,
  title: "bouts/Bout Period Control",
  argTypes: {},
};

type Story = StoryObj<typeof meta>;

export const PeriodNotRunning: Story = {
  args: {
    state: "stopped",
  },
};

export const PeriodRunning: Story = {
  args: {
    state: "lineup",
  },
};

export default meta;
