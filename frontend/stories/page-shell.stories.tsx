import type { Meta, StoryObj } from "@storybook/react-vite";
import PageView from "../components/page-shell";

const meta: Meta<typeof PageView> = {
  component: PageView,
  title: "Page View",
};

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: "Page data goes here.",
  },
};

export default meta;
