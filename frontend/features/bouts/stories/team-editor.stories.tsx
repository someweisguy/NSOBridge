import type { Meta, StoryObj } from "@storybook/react-vite";
import TeamEditor from "../components/team-editor";

const meta: Meta = {
  component: TeamEditor,
  title: "TeamEditor",
};

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export default meta;
