import Operator from "@/app/operator";
import type { Meta, StoryObj } from "@storybook/react-vite";

const meta: Meta = {
  component: Operator,
  title: "Operator Page",
};

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export default meta;
