import type { Meta, StoryObj } from "@storybook/react-vite";
import JammerStatusController from "../components/jammer-status-controller";

const meta: Meta = {
  component: JammerStatusController,
  title: "TeamJam Operator/Jammer Status Controller",
  argTypes: {
    teamUuid: {
      control: false,
    },
  },
};

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    teamUuid: "",
    leadIsDeclared: false,
    disabled: false,
    jammerLead: false,
    jammerLost: false,
    jammerStarPass: false,
  },
};

export default meta;
