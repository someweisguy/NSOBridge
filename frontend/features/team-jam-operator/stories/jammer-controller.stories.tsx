import type { Meta, StoryObj } from "@storybook/react-vite";
import JammerController from "../components/jammer-controller";

const meta: Meta = {
  component: JammerController,
  title: "TeamJam Operator/Jammer Controller",
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
    jammerTripEvents: [],
    teamIsInJam: true,
    jammerLead: false,
    jammerLost: false,
    jammerStarPass: false,
    jammerHasInitial: false,
    pointsPerTrip: 4,
    disableLeadCheckbox: false,
    disabled: false,
  },
};

export default meta;
