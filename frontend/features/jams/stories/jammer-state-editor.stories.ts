import type { Meta, StoryObj } from "@storybook/react-vite";
import JammerStateEditor from "../components/jammer-state-editor";

const meta: Meta<typeof JammerStateEditor> = {
  component: JammerStateEditor,
  title: "Jammer State Editor",
};

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    teamJamUri: { boutUuid: "", periodNum: 0, jamNum: 0, teamNum: 0 },
    teamJam: {
      teamNum: 0,
      events: [],
    },
  },
};

export const NotLeadEligible: Story = {
  args: {
    teamJamUri: { boutUuid: "", periodNum: 0, jamNum: 0, teamNum: 0 },
    teamJam: {
      teamNum: 0,
      events: [],
    },
  },
};

export default meta;
