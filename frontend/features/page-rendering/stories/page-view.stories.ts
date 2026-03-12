import type { Meta, StoryObj } from "@storybook/react-vite";
import PageView from "../components/page-view";

const meta: Meta<typeof PageView> = {
  component: PageView,
  title: "Page View",
};

const boutData = [
  {
    value: "1",
    label: "Salt vs. Pepper",
  },
  {
    value: "2",
    label: "Sun vs. Moon",
  },
  {
    value: "3",
    label: "Alpha vs. Omega",
  },
  {
    value: "4",
    label: "Spaces vs. Tabs",
  },
  {
    value: "5",
    label: "Emacs vs. Vim",
  },
  {
    value: "0",
    label: "Home vs. Away",
  },
];

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    boutData,
    children: "Page data goes here.",
  },
};

export default meta;
