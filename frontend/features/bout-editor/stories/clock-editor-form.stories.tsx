import type { Meta, StoryObj } from "@storybook/react-vite";
import ClockEditorForm from "../components/clock-editor-form";

const meta: Meta = {
  component: ClockEditorForm,
  title: "Bout Editor/Clock Editor Form",
  argTypes: {},
};

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    clock: {
      startTimestamp: new Date(),
      elapsed: 0,
      alarm: 30 * 60 * 1000,
    },
  },
};

export default meta;
