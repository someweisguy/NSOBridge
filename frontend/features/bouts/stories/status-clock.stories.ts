import { StatusClock } from "@/features/bouts/components/status-clock";
import type { Meta, StoryObj } from "@storybook/react-vite";

const meta: Meta = {
  component: StatusClock,
  title: "Status Clock",
  argTypes: {
    since: {
      control: "date",
    },
  },
};

type Story = StoryObj<typeof meta>;

export const Lineup: Story = {
  args: {
    stateText: "Lineup",
    since: new Date(),
  },
};

export const Halftime: Story = {
  args: {
    stateText: "Halftime",
    since: new Date(new Date().getTime() + 1800000),
  },
};

export const NoState: Story = {
  args: {
    stateText: "",
    since: new Date(new Date().getTime() + 1800000),
  },
};

export default meta;
