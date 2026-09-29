import {
  ALL_RULESET_API,
  ALL_SERIES_API,
  BOUT_API,
  JAM_API,
  RULESET_API,
  SERIES_API,
} from "@/configs/endpoints";
import { getHandlerFactory } from "@/utils/mock-api";

export const defaultDataHandlers = [
  getHandlerFactory(ALL_SERIES_API, [
    {
      uuid: "fa2debd1-57a7-4c66-9cd5-fbbcf2c533df",
      name: "Default Series",
      activeBoutUuid: "727663f3-4421-47e1-ae19-424dcfce895b",
      boutUuids: ["727663f3-4421-47e1-ae19-424dcfce895b"],
    },
  ]),
  getHandlerFactory(
    SERIES_API,
    {
      uuid: "fa2debd1-57a7-4c66-9cd5-fbbcf2c533df",
      name: "Default Series",
      activeBoutUuid: "727663f3-4421-47e1-ae19-424dcfce895b",
      boutUuids: ["727663f3-4421-47e1-ae19-424dcfce895b"],
    },
    { uuid: "fa2debd1-57a7-4c66-9cd5-fbbcf2c533df" },
  ),
  getHandlerFactory(ALL_RULESET_API, [
    {
      name: "WFTDA 2025",
      numPeriods: 2,
      jamDuration: 120000,
      lineupDuration: 30000,
      pointsPerTrip: 4,
      numTimeouts: 3,
      numReviews: 1,
    },
  ]),
  getHandlerFactory(
    RULESET_API,
    {
      name: "WFTDA 2025",
      numPeriods: 2,
      jamDuration: 120000,
      lineupDuration: 30000,
      pointsPerTrip: 4,
      numTimeouts: 3,
      numReviews: 1,
    },
    { rulesetName: "WFTDA 2025" },
  ),
  getHandlerFactory(
    BOUT_API,
    {
      uuid: "727663f3-4421-47e1-ae19-424dcfce895b",
      rulesetName: "WFTDA 2025",
      seriesUuid: "fa2debd1-57a7-4c66-9cd5-fbbcf2c533df",
      clock: {
        startTimestamp: null,
        elapsed: 0,
        alarm: 1800000,
      },
      isRunning: false,
      startCountdown: null,
      state: "stopped",
      subState: "pregame",
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
      jamUuids: [["727663f3-4421-47e1-ae19-424dcece895b"], [], []],
      activeJamUuid: "727663f3-4421-47e1-ae19-424dcece895b",
      timeoutUuids: [],
    },
    { uuid: "727663f3-4421-47e1-ae19-424dcfce895b" },
  ),
  getHandlerFactory(
    JAM_API,
    {
      uuid: "727663f3-4421-47e1-ae19-424dcece895b",
      boutUuid: "727663f3-4421-47e1-ae19-424dcfce895b",
      period: 0,
      num: 0,
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
    },
    {
      uuid: "727663f3-4421-47e1-ae19-424dcfce895b",
    },
  ),
  getHandlerFactory(
    RULESET_API,
    {
      name: "WFTDA 2025",
      numPeriods: 2,
      jamDuration: 120000,
      lineupDuration: 30000,
      pointsPerTrip: 4,
      numTimeouts: 3,
      numReviews: 1,
    },
    { rulesetName: "WFTDA+2025" },
  ),
];
