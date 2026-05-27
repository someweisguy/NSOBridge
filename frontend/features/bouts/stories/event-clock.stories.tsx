import type { Meta, StoryObj } from "@storybook/react-vite";
import EventClock from "../components/event-clock";

const meta: Meta = {
  component: EventClock,
  title: "Event Clock",
  argTypes: {
    state: {
      control: "radio",
      options: ["lineup", "stopped", "jam", "timeout", "final"],
    },
  },
};

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    startTimestamp: new Date().toISOString(),
  },
};

export default meta;
