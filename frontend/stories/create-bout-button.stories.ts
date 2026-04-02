import CreateBoutButton from "@/components/create-bout-button";
import type { Meta, StoryObj } from "@storybook/react-vite";

const meta: Meta = {
  component: CreateBoutButton,
  title: "Create Bout Button",
};

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    rulesetNames: ["WFTDA 2025", "WFTDA 2026", "Survival"],
  },
};

export default meta;
