import type { Meta, StoryObj } from "@storybook/react-vite";
import ClockEditor from "../components/clock-editor";

const meta: Meta = {
  component: ClockEditor,
  title: "Bout Editor/Clock Editor",
  argTypes: {},
};

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    clock: {
      startTimestamp: new Date(),
      elapsed: 0,
      alarm: 30 * 60 * 1000,
    },
  },
};

export default meta;
