import TimeoutsLeft from "@/features/timeouts/components/timeouts-left";
import type { Meta, StoryObj } from "@storybook/react-vite";

const meta: Meta = {
  component: TimeoutsLeft,
  title: "Timeouts Left",
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
    size: 24,
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
    size: 24,
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
    size: 24,
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
    size: 24,
  },
};

export default meta;
