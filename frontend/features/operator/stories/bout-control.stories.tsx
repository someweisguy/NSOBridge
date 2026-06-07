import type { Meta, StoryObj } from "@storybook/react-vite";
import BoutControl from "../components/bout-control";

const meta: Meta<typeof BoutControl> = {
  component: BoutControl,
  title: "Bout Control",
  argTypes: {
    state: {
      control: { type: "inline-radio" },
      options: ["lineup", "jam", "timeout", "stopped", "final"],
    },
  },
};

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    latestJamUri: { boutUuid: "", periodNum: 0, jamNum: 1 },
    state: "lineup",
  },
};

export default meta;
