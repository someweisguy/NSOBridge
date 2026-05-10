import type { Meta, StoryObj } from "@storybook/react-vite";
import BoutControl from "../components/bout-control";

const meta: Meta<typeof BoutControl> = {
  component: BoutControl,
  title: "Bout Control",
  argTypes: {
    stopReason: {
      control: {
        type: "inline-radio",
      },
      options: ["called", "elapsed", "injury", null],
    },
    state: {
      control: { type: "inline-radio" },
      options: ["lineup", "jam", "timeout", "stopped", "final"],
    },
    teamNum: {
      control: {
        type: "number",
      },
    },
  },
};

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    teamData: [
      { label: "Home", value: "0" },
      { label: "Away", value: "1" },
    ],
    state: "lineup",
    teamNum: null,
    teamIsOfficials: false,
    isReview: false,
    retained: false,
    latestPeriodNum: 0,
    latestJamNum: 1,
    latestTimeoutNum: 1,
    stopReason: null,
  },
};

export default meta;
