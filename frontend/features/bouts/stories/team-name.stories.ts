import type { Meta, StoryObj } from "@storybook/react-vite";
import TeamName from "../components/team-name";

const meta: Meta = {
  component: TeamName,
  title: "Team Name",
};

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    teamName: "Default Team Name",
  },
};

export default meta;
