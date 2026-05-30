import type { Meta, StoryObj } from "@storybook/react-vite";
import JammerTrip from "../components/jammer-trip";

const meta: Meta<typeof JammerTrip> = {
  component: JammerTrip,
  title: "Jammer Trip",
};

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    tripIndex: 0,
    passes: 4,
    pointsPerTrip: 4,
  },
};

export default meta;
