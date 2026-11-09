import OperatorPage from "@/app/operator";
import type { Meta, StoryObj } from "@storybook/react-vite";

const meta: Meta = {
  component: OperatorPage,
  title: "Pages/Operator",
  globals: {
    viewport: {
      value: "smallDesktop",
    },
  },
  parameters: {
    layout: "fullscreen",
  },
};

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export default meta;
