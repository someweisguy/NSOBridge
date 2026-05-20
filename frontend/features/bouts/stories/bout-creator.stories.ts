import type { Meta, StoryObj } from "@storybook/react-vite";
import BoutCreator from "../components/bout-creator";

const meta: Meta = {
  component: BoutCreator,
  title: "Bout Creator",
};

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    rulesetNames: ["WFTDA 2025", "WFTDA 2024", "WFTDA 2000"],
  },
};

export default meta;
