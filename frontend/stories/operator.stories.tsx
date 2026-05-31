import Operator from "@/app/operator";
import { Bout } from "@/types/bout";
import { Jam } from "@/types/jam";
import { Timeout } from "@/types/timeout";
import { mockApiResponse } from "@/utils/mock-api";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { http, HttpResponse } from "msw";

const bout: Bout = {
  uuid: "060f177d-efba-427f-8220-740440aefa6a",
  rulesetName: "WFTDA 2025",
  seriesUuid: "780153bf-dc83-432d-894c-7bc9be1796fb",
  clock: {
    startTimestamp: null,
    elapsed: 1704491,
    alarm: 1800000,
  },
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
      reviewsRemaining: 0,
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
  jamCounts: [4, 0, 0],
  timeoutCount: 6,
};
const allBouts = [bout];

const jam: Jam = {
  boutUuid: "060f177d-efba-427f-8220-740440aefa6a",
  period: 0,
  num: 2,
  startTimestamp: "2026-05-21T19:14:01.415035",
  stopTimestamp: "2026-05-21T19:14:02.756517",
  stopReason: "elapsed",
  teamJams: [
    {
      teamNum: 0,
      events: [
        {
          timestamp: "2026-05-30T17:37:54.440417",
          lead: false,
          lost: false,
          passes: 0,
          starPass: false,
        },
        {
          timestamp: "2026-05-30T17:38:03.880934",
          lead: true,
          lost: false,
          passes: null,
          starPass: false,
        },
        {
          timestamp: "2026-05-30T17:39:50.919934",
          lead: false,
          lost: false,
          passes: 4,
          starPass: false,
        },
        {
          timestamp: "2026-05-30T17:39:51.597357",
          lead: false,
          lost: false,
          passes: 4,
          starPass: false,
        },
        {
          timestamp: "2026-05-30T17:39:52.806932",
          lead: false,
          lost: false,
          passes: 4,
          starPass: false,
        },
        {
          timestamp: "2026-05-30T19:00:13.958413",
          lead: false,
          lost: false,
          passes: 4,
          starPass: false,
        },
        {
          timestamp: "2026-05-30T19:00:14.866356",
          lead: false,
          lost: false,
          passes: 4,
          starPass: false,
        },
        {
          timestamp: "2026-05-30T19:00:18.204427",
          lead: false,
          lost: false,
          passes: 4,
          starPass: false,
        },
        {
          timestamp: "2026-05-30T19:20:27.979653",
          lead: false,
          lost: false,
          passes: 3,
          starPass: false,
        },
        {
          timestamp: "2026-05-30T19:20:33.260732",
          lead: false,
          lost: false,
          passes: 0,
          starPass: false,
        },
      ],
    },
    {
      teamNum: 1,
      events: [
        {
          timestamp: "2026-05-30T19:22:54.712890",
          lead: false,
          lost: false,
          passes: 0,
          starPass: false,
        },
      ],
    },
  ],
};

const timeout: Timeout = {
  boutUuid: "060f177d-efba-427f-8220-740440aefa6a",
  num: 5,
  startTimestamp: new Date().toISOString(),
  stopTimestamp: null,
  clockElapsed: 1704491,
  teamIsOfficials: false,
  isReview: false,
  details: "",
  result: "",
  retained: false,
  periodNum: 0,
  jamNum: 2,
  teamNum: null,
};

const meta: Meta = {
  component: Operator,
  title: "Pages/Operator",
  globals: {
    viewport: {
      value: "smallDesktop",
    },
  },
  parameters: {
    msw: {
      handlers: [
        http.get("/api/bout/ruleset", () => {
          return HttpResponse.json(mockApiResponse(rulesetData));
        }),
        http.get("/api/bout/allRulesetNames", () => {
          return HttpResponse.json(mockApiResponse(["WFTDA 2025"]));
        }),
      ],
    },
  },
};

const rulesetData = {
  name: "WFTDA 2025",
  numPeriods: 2,
  jamDuration: 120000,
  lineupDuration: 30000,
  pointsPerTrip: 4,
  numTimeouts: 3,
  numReviews: 1,
};

type Story = StoryObj<typeof meta>;

export const PostJam: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get("/api/bout/ruleset", () => {
          return HttpResponse.json(mockApiResponse(rulesetData));
        }),
        http.get("/api/bout/allRulesetNames", () => {
          return HttpResponse.json(mockApiResponse(["WFTDA 2025"]));
        }),
        http.get("/api/bout/allBouts", () => {
          return HttpResponse.json(mockApiResponse<Bout[]>(allBouts));
        }),
        http.get("/api/jam", () => {
          return HttpResponse.json(mockApiResponse<Jam>(jam));
        }),
        http.get("/api/timeout", () => {
          return HttpResponse.json(mockApiResponse<Timeout>(timeout));
        }),
      ],
    },
  },
  args: {},
};

export const InTimeout: Story = {
  name: "Timeout",
  parameters: {
    msw: {
      handlers: [
        http.get("/api/bout/ruleset", () => {
          return HttpResponse.json(mockApiResponse(rulesetData));
        }),
        http.get("/api/bout/allRulesetNames", () => {
          return HttpResponse.json(mockApiResponse(["WFTDA 2025"]));
        }),
        http.get("/api/bout/allBouts", () => {
          return HttpResponse.json(mockApiResponse<Bout[]>(allBouts));
        }),
        http.get("/api/jam", () => {
          return HttpResponse.json(mockApiResponse<Jam>(jam));
        }),
        http.get("/api/timeout", () => {
          return HttpResponse.json(mockApiResponse<Timeout>(timeout));
        }),
      ],
    },
  },
  args: {},
};

export default meta;
