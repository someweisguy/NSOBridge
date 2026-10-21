import type { Meta, StoryObj } from "@storybook/react-vite";
import TripAdder from "../components/trip-adder";

const meta: Meta = {
  component: TripAdder,
  title: "TeamJam Operator/Trip Adder",
  argTypes: {},
};

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    teamUuid: "",
    pointsPerTrip: 4,
  },
};

export default meta;
