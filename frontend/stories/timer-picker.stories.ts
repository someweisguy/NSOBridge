import TimerPicker from "@/components/timer-picker";
import type { Meta, StoryObj } from "@storybook/react-vite";

const meta: Meta<typeof TimerPicker> = {
  component: TimerPicker,
  title: "Timer Picker",
};

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export default meta;
