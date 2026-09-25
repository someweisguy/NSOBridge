import OperatorPage from "@/app/operator";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { defaultDataHandlers } from "./msw/default-data";

const meta: Meta = {
  component: OperatorPage,
  title: "Pages/Operator",
  globals: {
    viewport: {
      value: "smallDesktop",
    },
  },
  parameters: {
    layout: "fullscreen",
    msw: {
      handlers: [...defaultDataHandlers],
    },
  },
};

type Story = StoryObj<typeof meta>;

export const PostJam: Story = {
  parameters: {
    msw: {
      handlers: [...defaultDataHandlers],
    },
  },
  args: {},
};

export const InTimeout: Story = {
  name: "Timeout",
  parameters: {
    msw: {
      handlers: [...defaultDataHandlers],
    },
  },
  args: {},
};

export default meta;
