import { Scoreboard } from "@/app/scoreboard";
import type { Meta, StoryObj } from "@storybook/react-vite";

const meta: Meta = {
  component: Scoreboard,
  title: "Pages/Scoreboard",
  parameters: {
    layout: "fullscreen",
  },
};

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    query: {
      seriesUuid: "780153bf-dc83-432d-894c-7bc9be1796fb",
    },
  },
  args: {},
};

export default meta;
