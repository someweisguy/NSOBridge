import type { Meta, StoryObj } from "@storybook/react-vite";
import Undoer from "../components/undoer";

const meta: Meta = {
  component: Undoer,
  title: "Undo/Undoer",
  argTypes: {},
};

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export default meta;
