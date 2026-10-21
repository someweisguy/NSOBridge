import type { Meta, StoryObj } from "@storybook/react-vite";
import TripController from "../components/trip-controller";

const meta: Meta = {
  component: TripController,
  title: "TeamJam Operator/Trip Controller",
  argTypes: {},
};

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    teamIsInThisJam: true,
    pointsPerTrip: 4,
    tripEvents: [],
    editable: true,
    deletable: true,
  },
};

export default meta;
