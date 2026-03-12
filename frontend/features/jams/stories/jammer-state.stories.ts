import type { Meta, StoryObj } from "@storybook/react-vite";
import JammerState from "../components/jammer-state";

const meta: Meta<typeof JammerState> = {
  component: JammerState,
  title: "Jammer State",
};

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    isLeadEligible: true,
    lead: false,
    lost: false,
    starPass: false,
  },
};

export const NotLeadEligible: Story = {
  args: {
    isLeadEligible: false,
  },
};

export default meta;
