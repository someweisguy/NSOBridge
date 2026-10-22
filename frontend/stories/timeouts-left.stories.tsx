import TimeoutsLeft from "@/components/timeouts-left";
import type { Meta, StoryObj } from "@storybook/react-vite";

const meta: Meta = {
  component: TimeoutsLeft,
  title: "Timeouts Left",
  argTypes: {
    h: {
      control: "text",
    },
  },
};

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    numTimeouts: 3,
    numReviews: 1,
    timeoutsRemaining: 3,
    reviewsRemaining: 1,
    timeoutIsActive: false,
    isReview: false,
    h: "5rem",
  },
};

export const ActiveTimeout: Story = {
  args: {
    numTimeouts: 3,
    numReviews: 1,
    timeoutsRemaining: 3,
    reviewsRemaining: 1,
    timeoutIsActive: true,
    isReview: false,
    h: "5rem",
  },
};

export const ActiveReview: Story = {
  args: {
    numTimeouts: 3,
    numReviews: 1,
    timeoutsRemaining: 3,
    reviewsRemaining: 1,
    timeoutIsActive: true,
    isReview: true,
    h: "5rem",
  },
};

export const TimeoutsUsed: Story = {
  args: {
    numTimeouts: 3,
    numReviews: 1,
    timeoutsRemaining: 2,
    reviewsRemaining: 1,
    timeoutIsActive: false,
    isReview: false,
    h: "5rem",
  },
};

export default meta;
