import Clock from "@/components/clock";
import type { Meta, StoryObj } from "@storybook/react-vite";

const meta: Meta = {
  component: Clock,
  title: "Clock",
};

type Story = StoryObj<typeof meta>;

export const Bout: Story = {
  args: {
    startTimestamp: new Date(),
    elapsed: 0,
    alarm: 1800000,
  },
};
export const Jam: Story = {
  args: {
    startTimestamp: new Date(),
    elapsed: 0,
    alarm: 120000,
    freeze: false,
    serverOffset: 0,
  },
};

export const CountUp: Story = {
  args: {
    startTimestamp: new Date(),
    elapsed: 0,
    serverOffset: 0,
    freeze: false,
  },
};

export default meta;
