import type { Meta, StoryObj } from "@storybook/react-vite";
import TeamEditorForm from "../components/team-editor-form";

const meta: Meta = {
  component: TeamEditorForm,
  title: "Bout Editor/Team Editor Form",
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
