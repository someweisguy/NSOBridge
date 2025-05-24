import { BoutIdContext } from "@/app/provider";
import useBout from "@/hooks/use-bout";
import { Timeout, TimeoutCounts, TimeoutType } from "@/lib/client/api/bout";
import { TeamString } from "@/lib/client/api/jam";
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
  teamTimeoutCounts: TimeoutCounts,
  timeoutType: TimeoutType,
  totalTimeouts: number
): PipPropState[] {
  const latestTimeout: Timeout | undefined = timeouts[timeouts.length - 1];
  return Array.from({ length: totalTimeouts }, (_, i) => {
    if (teamTimeoutCounts.timeoutsRemaining > i) {
      // The timeout has not be used yet
      return "remaining";
    } else if (
      latestTimeout?.team === team &&
      latestTimeout.duration === null &&
      latestTimeout.type == timeoutType
    ) {
      // The latest timeout is the correct type, in progress, and called by this team
      return "in-progress";
    }
    return "used";
  });
}

export default function TimeoutBar({ boutId, team }: TimeoutPipsProps) {
  const [boutIdContext] = useContext(BoutIdContext);
  boutId = boutId ?? boutIdContext;

  const timeoutPipStates: PipPropState[] = useBout(boutId, (bout) =>
    computeTimeoutState(
      team,
      bout.timer.timeouts,
      bout.timer.timeoutCounts[team],
      "timeout",
      3
    )
  );

  const reviewPipStates: PipPropState[] = useBout(boutId, (bout) =>
    computeTimeoutState(
      team,
      bout.timer.timeouts,
      bout.timer.timeoutCounts[team],
      "review",
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
