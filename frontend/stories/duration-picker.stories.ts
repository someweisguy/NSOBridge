import DurationPicker from "@/components/duration-picker";
import type { Meta, StoryObj } from "@storybook/react-vite";

const meta: Meta<typeof DurationPicker> = {
  component: DurationPicker,
  title: "Duration Picker",
};

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export default meta;
