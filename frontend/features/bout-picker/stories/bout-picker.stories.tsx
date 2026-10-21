import type { Meta, StoryObj } from "@storybook/react-vite";
import BoutPicker from "../components/bout-picker";

const meta: Meta = {
  component: BoutPicker,
  title: "Bout Picker/Bout Picker",
  argTypes: {},
};

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    activeBoutUuid: "0",
    data: [
      {
        label: "Home vs. Away",
        value: "0",
      },
      {
        label: "Hot vs. Cold",
        value: "1",
      },
      {
        label: "Light vs. Dark",
        value: "2",
      },
    ],
  },
};

export default meta;
