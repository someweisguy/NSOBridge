import { boutStateArgType } from "@/utils/storybook";
import type { Meta, StoryObj } from "@storybook/react-vite";
import BoutPhaseController from "../components/bout-phase-controller";

const meta: Meta = {
  component: BoutPhaseController,
  title: "Bout Operator/Bout Phase Controller",
  argTypes: {
    boutUuid: {
      control: false,
    },
    boutState: boutStateArgType,
  },
};

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    boutUuid: "",
    boutState: "jam",
    showFinalizeBout: false,
  },
};

export default meta;
