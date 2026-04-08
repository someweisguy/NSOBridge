import type { Meta, StoryObj } from "@storybook/react-vite";
import JammerStateEditor from "../components/jammer-state-editor";

const meta: Meta<typeof JammerStateEditor> = {
  component: JammerStateEditor,
  title: "Jammer State Editor",
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
