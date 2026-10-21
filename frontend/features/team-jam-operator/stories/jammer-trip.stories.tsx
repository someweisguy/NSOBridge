import type { Meta, StoryObj } from "@storybook/react-vite";
import JammerTrip from "../components/jammer-trip";

const meta: Meta = {
  component: JammerTrip,
  title: "TeamJam Operator/Jammer Trip",
  argTypes: {
    uuid: {
      control: false,
    },
  },
};

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    uuid: "",
    tripIndex: 0,
    passes: 4,
    pointsPerTrip: 4,
    enableEdit: true,
    enableDelete: true,
  },
};

export default meta;
