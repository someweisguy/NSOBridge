import ResponsiveScroller from "@/components/responsive-scroller";
import { Card } from "@mantine/core";
import type { Meta, StoryObj } from "@storybook/react-vite";

const meta: Meta<typeof ResponsiveScroller> = {
  component: ResponsiveScroller,
  title: "Responsive Scroller",
};

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: Array.from({ length: 10 }, (_, i: number) => (
      <Card withBorder key={i} w="60px" h="80px">
        {i}
      </Card>
    )),
  },
};

export default meta;
