import Operator from "@/app/operator";
import { Bout } from "@/types/bout";
import { Jam } from "@/types/jam";
import { Timeout } from "@/types/timeout";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { http, HttpResponse } from "msw";

const mockApiResponse = <T = unknown>(data: T, statusCode = 200) => {
  return {
    data: data,
    statusCode: statusCode,
    timestamp: new Date().toString(),
  };
};

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

export const Default: Story = {
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
                uuid: "5d68fdab-b8bc-4631-8b7d-734217eb986d",
                rulesetName: "WFTDA 2025",
                seriesUuid: "bb4b8918-3cf3-4cad-9ef9-79c89e49d9a9",
                clock: {
                  startTimestamp: new Date(
                    Date.now() - 2 * 60 * 1000,
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
              },
            ]),
          );
        }),
        http.get("/api/jam", () => {
          return HttpResponse.json(
            mockApiResponse<Jam>({
              boutUuid: "5d68fdab-b8bc-4631-8b7d-734217eb986d",
              period: 0,
              num: 0,
              startTimestamp: new Date(
                new Date(Date.now() - 2 * 60 * 1000),
              ).toISOString(),
              stopTimestamp: new Date().toISOString(),
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
            mockApiResponse<Timeout | null>({
              boutUuid: "5d68fdab-b8bc-4631-8b7d-734217eb986d",
              num: 0,
              startTimestamp: "2026-05-02T14:04:28.707586",
              stopTimestamp: null,
              clockElapsed: 146576533,
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
