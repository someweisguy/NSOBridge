import Operator from "@/app/operator";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { http, HttpResponse } from "msw";

const mockApiResponse = (data: unknown, statusCode = 200) => {
  return {
    data: data,
    statusCode: statusCode,
    timestamp: new Date().toString(),
  };
};

const meta: Meta = {
  component: Operator,
  title: "Operator Page",
};

type Story = StoryObj<typeof meta>;

const rulesetData = {
  name: "WFTDA 2025",
  numPeriods: 2,
  jamDuration: 120000,
  lineupDuration: 30000,
  pointsPerTrip: 4,
  numTimeouts: 3,
  numReviews: 1,
};
const boutData = {
  uuid: "5d68fdab-b8bc-4631-8b7d-734217eb986d",
  rulesetName: "WFTDA 2025",
  seriesUuid: "bb4b8918-3cf3-4cad-9ef9-79c89e49d9a9",
  clock: {
    startTimestamp: "2026-04-30T21:21:32.173787",
    elapsed: 0,
    alarm: 1800000,
  },
  isRunning: true,
  startCountdown: null,
  isFinal: false,
  state: "lineup",
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
  timeoutCount: 0,
};
const jamData = {
  boutUuid: "5d68fdab-b8bc-4631-8b7d-734217eb986d",
  period: 0,
  num: 0,
  startTimestamp: "2026-04-30T21:21:32.173787",
  stopTimestamp: null,
  stopReason: null,
  teamJams: [
    {
      teamNum: 0,
      events: [],
    },
    {
      teamNum: 1,
      events: [],
    },
  ],
};
const allBoutsData = [boutData];

export const Default: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get("/api/bout/allBouts", () => {
          return HttpResponse.json(mockApiResponse(allBoutsData));
        }),
        http.get("/api/bout/ruleset", () => {
          return HttpResponse.json(mockApiResponse(rulesetData));
        }),
        http.get("/api/jam", () => {
          return HttpResponse.json(mockApiResponse(jamData));
        }),
      ],
    },
  },
  args: {},
};

export default meta;
