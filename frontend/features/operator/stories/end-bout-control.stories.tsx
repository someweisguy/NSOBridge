import type { Meta, StoryObj } from "@storybook/react-vite";
import EndBoutControl from "../components/end-bout-control";

const meta: Meta<typeof EndBoutControl> = {
  component: EndBoutControl,
  title: "End Bout Control",
};

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export default meta;
