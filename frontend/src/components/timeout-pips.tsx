import { BoutIdContext } from "@/app/provider";
import useBout from "@/hooks/use-bout";
import { TeamString, Timeout } from "@/lib/client/api/types";

import { useContext } from "react";

type PipPropState = "remaining" | "in-progress" | "used";

interface TimeoutPipsProps {
  boutId?: string;
  team: TeamString;
}

interface PipProps {
  state: PipPropState;
}

function computeTimeoutState(
  team: TeamString,
  timeouts: Timeout[],
  teamTimeoutCounts: number,
  isReview: boolean,
  totalTimeouts: number
): PipPropState[] {
  const pipStates: PipPropState[] = Array.from(
    { length: totalTimeouts },
    (_, i) => {
      return i < teamTimeoutCounts ? "remaining" : "used";
    }
  );

  const timeout: Timeout | undefined = timeouts[timeouts.length - 1];
  if (
    timeout?.team == team &&
    timeout.elapsed === 0 &&
    timeout.isReview === isReview
  ) {
    pipStates[teamTimeoutCounts - 1] = "in-progress";
  }

  return pipStates;
}

export default function TimeoutBar({ boutId, team }: TimeoutPipsProps) {
  const [boutIdContext] = useContext(BoutIdContext);
  boutId = boutId ?? boutIdContext;

  const timeoutPipStates: PipPropState[] = useBout(boutId, (bout) =>
    computeTimeoutState(
      team,
      bout.timer.timeouts,
      bout[team].clockStops.timeout,
      false,
      3
    )
  );

  const reviewPipStates: PipPropState[] = useBout(boutId, (bout) =>
    computeTimeoutState(
      team,
      bout.timer.timeouts,
      bout[team].clockStops.review,
      true,
      1
    )
  );

  return (
    <div className="grid-cols-1 m-3 border rounded-md size-fit">
      {timeoutPipStates.map((state, i) => (
        <TimeoutPip key={i} state={state} />
      ))}
      <hr className="mx-1 border-gray-300"></hr>
      {reviewPipStates.map((state, i) => (
        <OfficialReviewPip key={i} state={state} />
      ))}
    </div>
  );
}

function TimeoutPip({ state }: PipProps) {
  return (
    <div
      data-state={state}
      className="data-[state=used]:invisible bg-gray-500 m-1 rounded-full size-3 data-[state=in-progress]:animate-pulse"
    ></div>
  );
}

function OfficialReviewPip({ state }: PipProps) {
  return <TimeoutPip state={state} />;
}
