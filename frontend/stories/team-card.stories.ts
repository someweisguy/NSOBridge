import TeamCard from "@/components/team-card";
import type { Meta, StoryObj } from "@storybook/react-vite";

const meta: Meta<typeof TeamCard> = {
  component: TeamCard,
  title: "Team Card",
};

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export default meta;
