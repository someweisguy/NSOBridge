import { useGetter } from "./client";

export type TimerType = {
  elapsed: number,
  alarm: number | null,
  isRunning: boolean
};

export type BoutType = {
  clocks: {
    intermission: TimerType,
    period: TimerType,
    lineup: TimerType,
    jam: TimerType,
    timeout: TimerType
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

export default function useBout(boutId: string): BoutType {
  return useGetter<BoutType>("bout", { boutId });
}
