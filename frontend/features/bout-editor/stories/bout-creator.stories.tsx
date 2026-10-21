import type { Meta, StoryObj } from "@storybook/react-vite";
import BoutCreator from "../components/bout-creator";

const meta: Meta = {
  component: BoutCreator,
  title: "Bout Creator/Bout Creator",
  argTypes: {},
};

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    activeSeriesUuid: "",
  },
};

export default meta;
