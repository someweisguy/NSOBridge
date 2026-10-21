import type { Meta, StoryObj } from "@storybook/react-vite";
import JammerController from "../components/jammer-controller";

const meta: Meta = {
  component: JammerController,
  title: "TeamJam Operator/Jammer Controller",
  argTypes: {
    teamUuid: {
      control: false,
    },
    jammerState: {
      control: "radio",
      options: ["lead", "lost", "starPass", null],
    },
  },
};

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    teamUuid: "",
    jammerState: "lead",
    leadIsDeclared: true,
    disabled: false,
  },
};

export default meta;
