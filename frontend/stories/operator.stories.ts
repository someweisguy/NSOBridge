import OperatorView from "@/app/operator-view";
import { Bout } from "@/types/bout";
import { Jam, TeamJam } from "@/types/jam";
import { Clock } from "@/types/timeout";
import type { Meta, StoryObj } from "@storybook/react-vite";

const meta: Meta<typeof OperatorView> = {
  component: OperatorView,
  title: "Operator View",
};

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    bout: Object.assign<Bout, Partial<Bout>>(new Bout(), {
      uuid: "c240e3d7-3cda-442f-8d3b-261de9ac6de0",
      rulesetName: "WFTDA 2025",
      seriesUuid: "d6599d68-5426-4214-b115-6f056627c06b",
      clock: new Clock({
        startTimestamp: null,
        elapsed: 716921,
        alarm: 1800000,
      }),
      isRunning: true,
      startCountdown: null,
      isFinal: false,
      state: "timeout",
      teams: [
        {
          name: "Home",
          league: "",
          mnemonic: "",
          num: 0,
          boutScore: 0,
          jamScore: 0,
          timeoutsRemaining: 3,
          reviewsRemaining: 1,
          scoreOffset: 0,
          skaters: [],
        },
        {
          name: "Away",
          league: "",
          mnemonic: "",
          num: 1,
          boutScore: 0,
          jamScore: 0,
          timeoutsRemaining: 3,
          reviewsRemaining: 1,
          scoreOffset: 0,
          skaters: [],
        },
      ],
      jamCounts: [2, 0, 0],
      timeoutCount: 1,
    }),
    activeJam: Object.assign<Jam, Partial<Jam>>(new Jam(), {
      boutUuid: "c240e3d7-3cda-442f-8d3b-261de9ac6de0",
      period: 0,
      num: 0,
      startTimestamp: new Date("2026-04-07T21:17:51.358034"),
      stopTimestamp: new Date("2026-04-07T21:17:52.038021"),
      stopReason: null,
      teamJams: [
        Object.assign(new TeamJam(), {
          teamNum: 0,
          events: [],
        }),
        Object.assign(new TeamJam(), {
          teamNum: 1,
          events: [],
        }),
      ],
    }),
    latestJam: Object.assign<Jam, Partial<Jam>>(new Jam(), {
      boutUuid: "c240e3d7-3cda-442f-8d3b-261de9ac6de0",
      period: 0,
      num: 1,
      startTimestamp: null,
      stopTimestamp: null,
      stopReason: null,
      teamJams: [
        Object.assign(new TeamJam(), {
          teamNum: 0,
          events: [],
        }),
        Object.assign(new TeamJam(), {
          teamNum: 1,
          events: [],
        }),
      ],
    }),
  },
};

export default meta;
