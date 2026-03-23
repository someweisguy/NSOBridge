import DurationPicker from "@/components/duration-picker";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";

const meta: Meta<typeof DurationPicker> = {
  component: DurationPicker,
  title: "Duration Picker",
};

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: "Label",
    description: "Description",
    onChange: fn(),
    size: "sm",
    radius: "md",
    disabled: false,
  },
};

export default meta;
