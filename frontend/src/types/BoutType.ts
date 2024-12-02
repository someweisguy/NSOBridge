import { ClockType } from "../types/ClockType";

export type BoutType = {
  clocks: {
    intermission: ClockType,
    period: ClockType,
    lineup: ClockType,
    jam: ClockType,
    timeout: ClockType
  },
  info: {
    date: string,
    gameNumber: string,
    venue: string,
  },
  jams: {
    counts: [number, number],
    score: {
      home: number,
      away: number
    },
    // TODO: penalties
  },
  roster: {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    home: {
      // TODO
    },
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    away: {
      // TODO
    },
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    officials: {
      // TODO
    }
  },
  timeouts: {
    remaining: {
      home: {
        timeouts: number,
        officialReviews: number
      },
      away: {
        timeouts: number,
        officialReviews: number
      }
    },
    ongoing: {
      caller: string,
      isOfficialReview: boolean,
      isRetained: boolean,
      notes: string
    } | null,
  }
};