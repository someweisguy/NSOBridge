import TitledSegmentedControl from "@/components/titled-segmented-control";
import type { Meta, StoryObj } from "@storybook/react-vite";

const meta: Meta<typeof TitledSegmentedControl> = {
  component: TitledSegmentedControl,
  title: "Titled Segmented Control",
};

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: "My Title",
    data: ["Option 1", "Option 2", "Option 3", "Option 4"],
  },
};

export default meta;
