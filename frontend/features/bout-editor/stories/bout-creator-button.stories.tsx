import type { Meta, StoryObj } from "@storybook/react-vite";
import BoutCreatorButton from "../components/bout-creator-button";

const meta: Meta = {
  component: BoutCreatorButton,
  title: "Bout Editor/Bout Creator Button",
  argTypes: {},
};

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    activeSeriesUuid: "",
  },
};

export default meta;
