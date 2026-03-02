import type { Meta, StoryObj } from "@storybook/react-vite";
import JammerState from "../components/jammer-state";

const meta: Meta<typeof JammerState> = {
  component: JammerState,
  title: "jams/Jammer State",
};

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    isLeadEligible: true,
  },
};

export const NotLeadEligible: Story = {
  args: {
    isLeadEligible: false,
  },
};

export default meta;
