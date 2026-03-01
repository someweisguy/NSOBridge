import BoutPicker from "@/components/bout-picker";
import type { Meta, StoryObj } from "@storybook/react-vite";

const meta: Meta<typeof BoutPicker> = {
  component: BoutPicker,
  title: "Bout Picker",
};

const boutData = [
  {
    value: "0",
    label: "Home vs. Away",
  },
  {
    value: "1",
    label: "Salt vs. Pepper",
  },
  {
    value: "2",
    label: "Sun vs. Moon",
  },
  {
    value: "3",
    label: "Alpha vs. Omega",
  },
  {
    value: "4",
    label: "Spaces vs. Tabs",
  },
];

type Story = StoryObj<typeof meta>;

export const Bout: Story = {
  args: {
    data: boutData,
  },
};

export default meta;
