import { send } from './client'


interface StoreArgs {
  boutId: string,
  periodId?: number,
  jamId?: number,
  team?: string
};

interface Timer {
  elapsed: number,
  alarm: number | null,
  isRunning: boolean
};

interface Bout {
  clocks: {
    intermission: Timer,
    period: Timer,
    lineup: Timer,
    jam: Timer,
    timeout: Timer
  },
  info: {
    date: string,
    gameNumber: string,
    venue: string,
  },
  jams: {
    jamCounts: [number, number],
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


const seriesStore: Map<string, Bout> = new Map();


async function getStore(name: string, args: StoreArgs) {


}