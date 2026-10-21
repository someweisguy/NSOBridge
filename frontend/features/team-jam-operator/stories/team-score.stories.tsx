import type { Meta, StoryObj } from "@storybook/react-vite";
import TeamScore from "../components/team-score";

const meta: Meta = {
  component: TeamScore,
  title: "TeamJam Operator/Team Score",
  argTypes: {
    timeout: {
      control: "radio",
      options: ["timeout", "review", null],
    },
    jammerState: {
      control: "radio",
      options: ["lead", "lost", "starPass", null],
    },
  },
};

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    name: "Home",
    boutScore: 123,
    scoreOffset: 0,
    jamScore: 4,
    timeout: "timeout",
    timeoutsRemaining: 3,
    reviewsRemaining: 1,
    jammerState: "lead",
    jammerInitial: true,
    numTimeouts: 3,
    numReviews: 1,
    reverse: false,
  },
};

export default meta;
