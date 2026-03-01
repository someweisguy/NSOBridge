import BoutPicker from "@/components/bout-picker";
import type { Meta, StoryObj } from "@storybook/react-vite";

const meta: Meta<typeof BoutPicker> = {
  component: BoutPicker,
};

const boutData = [
  {
    value: "",
    label: "Home vs. Away",
  },
];

type Story = StoryObj<typeof meta>;

export const Bout: Story = {
  args: {
    data: boutData,
  },
};

export default meta;
