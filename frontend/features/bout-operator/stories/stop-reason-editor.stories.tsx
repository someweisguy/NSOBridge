import { jamStopReasonArgType } from "@/utils/storybook";
import type { Meta, StoryObj } from "@storybook/react-vite";
import JamStopReasonEditor from "../components/stop-reason-editor";

const meta: Meta = {
  component: JamStopReasonEditor,
  title: "Bout Operator/Jam Stop Reason Editor",
  argTypes: {
    jamUuid: {
      control: false,
    },
    stopReason: jamStopReasonArgType,
  },
};

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    jamUuid: "",
  },
};

export default meta;
