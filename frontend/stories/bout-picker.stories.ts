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
  {
    value: "",
    label: "Salt vs. Pepper",
  },
  {
    value: "",
    label: "Sun vs. Moon",
  },
  {
    value: "",
    label: "Alpha vs. Omega",
  },
  {
    value: "",
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
