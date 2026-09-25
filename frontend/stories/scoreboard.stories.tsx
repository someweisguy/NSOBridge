import { Scoreboard } from "@/app/scoreboard";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { defaultDataHandlers } from "./msw/default-data";

const meta: Meta = {
  component: Scoreboard,
  title: "Pages/Scoreboard",
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
    query: {
      seriesUuid: "780153bf-dc83-432d-894c-7bc9be1796fb",
    },
    msw: {
      handlers: [...defaultDataHandlers],
    },
  },
  args: {},
};

export const InTimeout: Story = {
  name: "Timeout",
  parameters: {
    query: {
      seriesUuid: "780153bf-dc83-432d-894c-7bc9be1796fb",
    },
    msw: {
      handlers: [...defaultDataHandlers],
    },
  },
  args: {},
};

export default meta;
