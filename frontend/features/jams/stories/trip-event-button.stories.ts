import type { Meta, StoryObj } from "@storybook/react-vite";
import TripEventButton from "../components/trip-event-button";

const meta: Meta<typeof TripEventButton> = {
  component: TripEventButton,
  title: "jams/Trip Event Button",
};

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    tripNum: 0,
    passes: 4,
  },
};

export default meta;
