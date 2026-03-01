import type { Meta, StoryObj } from "@storybook/react-vite";
import { BoutSecondaryStatus } from "../components/bout-secondary-status";

const meta: Meta<typeof BoutSecondaryStatus> = {
  component: BoutSecondaryStatus,
  title: "bouts/Bout Secondary Status",
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
