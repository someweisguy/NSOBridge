import type { Meta, StoryObj } from "@storybook/react-vite";
import BoutCreatorForm from "../components/bout-creator-form";

const meta: Meta = {
  component: BoutCreatorForm,
  title: "Bout Creator",
};

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    rulesetNames: ["WFTDA 2025", "WFTDA 2024", "WFTDA 2000"],
    allSeriesData: [
      {
        label: "My Series",
        value: "",
      },
    ],
  },
};

export default meta;
