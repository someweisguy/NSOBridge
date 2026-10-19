import type { Meta, StoryObj } from "@storybook/react-vite";
import TimeoutEditor from "../components/timeout-editor";

const meta: Meta = {
  component: TimeoutEditor,
  title: "Bout Operator/Timeout Editor",
  argTypes: {
    timeoutUuid: {
      control: false,
    },
    teamUuid: {
      control: "inline-radio",
      options: ["home", "away"],
    },
  },
};

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    jamUuid: "",
    isReview: false,
    teamIsOfficials: false,
    teamUuid: "home",
    retained: false,
    teams: [
      {
        label: "Home",
        value: "home",
      },
      {
        label: "Away",
        value: "away",
      },
    ],
  },
};

export default meta;
