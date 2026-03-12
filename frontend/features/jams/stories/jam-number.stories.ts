import type { Meta, StoryObj } from "@storybook/react-vite";
import JamNumber from "../components/jam-number";

const meta: Meta = {
  component: JamNumber,
  title: "Jam Number",
};

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    jamNum: 0,
    periodNum: 0,
  },
};

export default meta;
