import type { Meta, StoryObj } from "@storybook/react-vite";
import JammerStateEditor from "../components/jammer-state-editor";

const meta: Meta<typeof JammerStateEditor> = {
  component: JammerStateEditor,
  title: "Jammer State Editor",
};

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const NotLeadEligible: Story = {
  args: {},
};

export default meta;
