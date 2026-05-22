import TeamCard from "@/components/team-card";
import type { Meta, StoryObj } from "@storybook/react-vite";

const meta: Meta<typeof TeamCard> = {
  component: TeamCard,
  title: "Team Card",
};

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    uuid: "",
    num: 0,
    teamName: "Home",
    reverse: false,
    numTimeouts: 3,
    numReviews: 1,
    timeoutsRemaining: 3,
    reviewsRemaining: 1,
    timeoutIsActive: false,
    isReview: false,
    boutScore: 88,
    scoreOffset: 0,
    jamScore: 0,
  },
};

export default meta;
