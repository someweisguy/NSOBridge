import type { Meta, StoryObj } from "@storybook/react-vite";
import TeamJamTripHistory from "../components/team-jam-trip-history";

const meta: Meta<typeof TeamJamTripHistory> = {
  component: TeamJamTripHistory,
  title: "jams/Trip History",
  argTypes: {
    w: {
      control: { type: "number" },
    },
  },
};

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    events: [
      {
        passes: 0,
        lead: false,
        lost: false,
        starPass: false,
        timestamp: new Date(),
      },
      {
        passes: 4,
        lead: false,
        lost: false,
        starPass: false,
        timestamp: new Date(),
      },
      {
        passes: 4,
        lead: false,
        lost: false,
        starPass: false,
        timestamp: new Date(),
      },
    ],
  },
};

export default meta;
