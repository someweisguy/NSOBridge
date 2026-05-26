import type { Meta, StoryObj } from "@storybook/react-vite";
import TimeoutEditor from "../components/timeout-editor";

const meta: Meta<typeof TimeoutEditor> = {
  component: TimeoutEditor,
  title: "Timeout Editor",
};

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    timeoutUri: { boutUuid: "", timeoutNum: 0 },

    teamNum: 0,
    teamIsOfficials: false,
    isReview: false,
    isRetained: false,

    teamData: [
      { value: "0", label: "Home" },
      { value: "1", label: "Away" },
    ],
  },
};

export default meta;
