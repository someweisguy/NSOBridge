import type { Meta, StoryObj } from "@storybook/react-vite";
import PassEditor from "../components/pass-editor";

const meta: Meta<typeof PassEditor> = {
  component: PassEditor,
  title: "Pass Editor",
};

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    numPasses: 4,
    showInitial: false,
  },
};

export const ShowInitial: Story = {
  args: {
    numPasses: 4,
    showInitial: true,
  },
};

export default meta;
