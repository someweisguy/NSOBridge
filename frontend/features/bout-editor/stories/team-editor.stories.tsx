import type { Meta, StoryObj } from "@storybook/react-vite";
import TeamEditor from "../components/team-editor";

const meta: Meta = {
  component: TeamEditor,
  title: "Bout Editor/Team Editor",
  argTypes: {},
};

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    uuid: "",
    name: "Home Team",
    timeoutsRemaining: 3,
    reviewsRemaining: 1,
    numTimeouts: 3,
    numReviews: 1,
  },
};

export default meta;
