import TeamScore from "@/features/bouts/components/team-score";
import TimeoutsLeft from "@/features/bouts/components/timeouts-left";
import type { Meta, StoryObj } from "@storybook/react-vite";

const meta: Meta<typeof TeamScore> = {
  component: TeamScore,
  title: "Team Score",
  argTypes: {
    aside: {
      control: false,
    },
  },
};

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    reverse: false,
    boutScore: 888,
    scoreOffset: 0,
    jamScore: 88,
    lead: true,
    lost: false,
    starPass: false,
    textSize: 30,
    aside: <></>,
    w: "fit-content",
    justify: "space-between",
  },
};

export const WithTimeouts: Story = {
  args: {
    reverse: false,
    boutScore: 123,
    scoreOffset: 0,
    jamScore: 4,
    lead: true,
    lost: false,
    starPass: false,
    textSize: 30,
    aside: (
      <TimeoutsLeft
        numTimeouts={3}
        numReviews={1}
        timeoutsRemaining={3}
        reviewsRemaining={1}
        timeoutIsActive={false}
        isReview={false}
        size={24}
      />
    ),
    w: "fit-content",
    justify: "space-between",
  },
};

export default meta;
