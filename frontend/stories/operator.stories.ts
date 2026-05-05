import Operator from "@/app/operator";
import { Bout } from "@/types/bout";
import { Jam } from "@/types/jam";
import { Timeout } from "@/types/timeout";
import { mockApiResponse } from "@/utils/mock-api";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { http, HttpResponse } from "msw";

const meta: Meta = {
  component: Operator,
  title: "Pages/Operator",
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

export const PostJam: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get("/api/bout/ruleset", () => {
          return HttpResponse.json(mockApiResponse(rulesetData));
        }),
        http.get("/api/bout/allBouts", () => {
          return HttpResponse.json(
            mockApiResponse<Bout[]>([
              {
                uuid: "defcc687-5fdb-4699-9786-fb649c5488db",
                rulesetName: "WFTDA 2025",
                seriesUuid: "cd44455d-6cc0-4ff6-8032-f9c536218f74",
                clock: {
                  startTimestamp: new Date(
                    Date.now() - 90 * 1000,
                  ).toISOString(),
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
                    boutScore: 8,
                    jamScore: 8,
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
                    boutScore: 2,
                    jamScore: 2,
                    timeoutsRemaining: 3,
                    reviewsRemaining: 1,
                    scoreOffset: 0,
                    skaters: [],
                  },
                ],
                jamCounts: [2, 0, 0],
                timeoutCount: 0,
              },
            ]),
          );
        }),
        http.get("/api/jam", () => {
          return HttpResponse.json(
            mockApiResponse<Jam>({
              boutUuid: "defcc687-5fdb-4699-9786-fb649c5488db",
              period: 0,
              num: 0,
              startTimestamp: new Date(Date.now() - 90 * 1000).toISOString(),
              stopTimestamp: new Date().toISOString(),
              stopReason: null,
              teamJams: [
                {
                  teamNum: 0,
                  events: [
                    {
                      timestamp: "2026-05-04T09:38:44.175021",
                      lead: true,
                      lost: false,
                      passes: null,
                      starPass: false,
                    },
                    {
                      timestamp: "2026-05-04T09:38:44.175021",
                      lead: false,
                      lost: false,
                      passes: 0,
                      starPass: false,
                    },
                    {
                      timestamp: "2026-05-04T09:38:44.968050",
                      lead: false,
                      lost: false,
                      passes: 4,
                      starPass: false,
                    },
                    {
                      timestamp: "2026-05-04T09:38:47.283217",
                      lead: false,
                      lost: false,
                      passes: 4,
                      starPass: false,
                    },
                  ],
                },
                {
                  teamNum: 1,
                  events: [
                    {
                      timestamp: "2026-05-04T09:38:53.210425",
                      lead: false,
                      lost: true,
                      passes: null,
                      starPass: false,
                    },
                    {
                      timestamp: "2026-05-04T09:38:53.210425",
                      lead: false,
                      lost: false,
                      passes: 0,
                      starPass: false,
                    },
                    {
                      timestamp: "2026-05-04T09:39:00.116051",
                      lead: false,
                      lost: false,
                      passes: 2,
                      starPass: false,
                    },
                  ],
                },
              ],
            }),
          );
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
        http.get("/api/bout/allBouts", () => {
          return HttpResponse.json(
            mockApiResponse<Bout[]>([
              {
                uuid: "27ced413-0a20-49e2-b570-7fa776f768c0",
                rulesetName: "WFTDA 2025",
                seriesUuid: "e9f0a658-7dfc-43c4-8027-7d7d33c79575",
                clock: {
                  startTimestamp: null,
                  elapsed: 14675,
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
                    boutScore: 8,
                    jamScore: 8,
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
                    boutScore: 2,
                    jamScore: 2,
                    timeoutsRemaining: 3,
                    reviewsRemaining: 1,
                    scoreOffset: 0,
                    skaters: [],
                  },
                ],
                jamCounts: [2, 0, 0],
                timeoutCount: 1,
              },
            ]),
          );
        }),
        http.get("/api/jam", () => {
          return HttpResponse.json(
            mockApiResponse<Jam>({
              boutUuid: "27ced413-0a20-49e2-b570-7fa776f768c0",
              period: 0,
              num: 1,
              startTimestamp: null,
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
            }),
          );
        }),
        http.get("/api/timeout", () => {
          return HttpResponse.json(
            mockApiResponse<Timeout>({
              boutUuid: "27ced413-0a20-49e2-b570-7fa776f768c0",
              num: 0,
              startTimestamp: "2026-05-04T19:25:55.192421",
              stopTimestamp: null,
              clockElapsed: 14675,
              teamIsOfficials: false,
              isReview: false,
              details: "",
              result: "",
              retained: false,
              periodNum: 0,
              jamNum: 0,
              teamNum: null,
            }),
          );
        }),
      ],
    },
  },
  args: {},
};

export default meta;
