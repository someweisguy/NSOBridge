import type { Meta, StoryObj } from "@storybook/react-vite";
import BoutCreatorForm from "../components/bout-creator-form";

const meta: Meta = {
  component: BoutCreatorForm,
  title: "Bout Editor/Bout Creator Form",
  argTypes: {},
};

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    seriesUuid: "",
    rulesetNames: ["WFTDA 2025"],
  },
};

export default meta;
