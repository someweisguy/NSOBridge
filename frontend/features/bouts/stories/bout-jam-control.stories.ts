import type { Meta, StoryObj } from "@storybook/react-vite";
import BoutJamControl from "../components/bout-jam-control";

const meta: Meta = {
  component: BoutJamControl,
  title: "bouts/Bout Jam Control",
  argTypes: {},
};

type Story = StoryObj<typeof meta>;

export const JamNotRunning: Story = {
  args: {
    state: "lineup",
  },
};

export const JamRunning: Story = {
  args: {
    state: "jam",
  },
};

export default meta;
