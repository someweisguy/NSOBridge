import ResponsiveScroller from "@/components/responsive-scroller";
import type { Meta, StoryObj } from "@storybook/react-vite";

const meta: Meta<typeof ResponsiveScroller> = {
  component: ResponsiveScroller,
  title: "Responsive Scroller",
};

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: <></>,
  },
};

export default meta;
