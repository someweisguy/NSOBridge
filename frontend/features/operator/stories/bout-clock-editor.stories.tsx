import type { Meta, StoryObj } from "@storybook/react-vite";
import BoutClockEditor from "../components/bout-clock-editor";

const meta: Meta<typeof BoutClockEditor> = {
  component: BoutClockEditor,
  title: "Bout Clock Editor",
};

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    boutUuid: "",
  },
};

export default meta;
