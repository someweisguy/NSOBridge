import ResponsiveScroller from "@/components/responsive-scroller";
import { Button } from "@mantine/core";
import type { Meta, StoryObj } from "@storybook/react-vite";

const meta: Meta<typeof ResponsiveScroller> = {
  component: ResponsiveScroller,
  title: "Responsive Scroller",
};

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    w: "200px",
    children: Array.from({ length: 10 }, (_, i: number) => (
      <Button variant="subtle" key={i} w="60px" h="80px">
        {i}
      </Button>
    )),
  },
};

export default meta;
