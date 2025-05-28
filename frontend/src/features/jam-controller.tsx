import { BoutIdContext } from "@/app/provider";
import Button from "@/components/button";
import GameTimer from "@/components/game-timer";
import TimeoutControls from "@/components/timeout-controls";
import useBout, { selectClockIsRunning } from "@/hooks/use-bout";
import {
  callTimeout,
  endTimeout,
  startJam,
  stopJam,
} from "@/lib/client/api/bout";
import { PropsWithChildren, useContext, useMemo } from "react";

interface JamControllerProps extends PropsWithChildren {
  boutId?: string;
}

export default function JamController({
  boutId,
  children,
}: JamControllerProps) {
  const [boutIdContext] = useContext(BoutIdContext);
  boutId ??= boutIdContext;

  const isInJam = useBout(boutId, selectClockIsRunning("jam"));
  const isInLineup = useBout(boutId, selectClockIsRunning("lineup"));
  const isInTimeout = useBout(boutId, selectClockIsRunning("timeout"));

  const buttonRow = useMemo(() => {
    if (isInJam) {
      // Jam buttons
      return (
        <>
          <Button onClick={() => void stopJam(boutId)}>End Jam</Button>
        </>
      );
    } else if (isInTimeout) {
      // TODO: add Timeout options
      // Timeout Buttons
      return (
        <>
          <Button onClick={() => void endTimeout(boutId)}>End Timeout</Button>
          <TimeoutControls boutId={boutId} />
        </>
      );
    } else if (isInLineup) {
      // Lineup buttons
      return (
        <>
          <Button onClick={() => void startJam(boutId)}>Start Jam</Button>
          <Button onClick={() => void callTimeout(boutId)}>Call Timeout</Button>
        </>
      );
    } else {
      // TODO
      // Intermission buttons
      return (
        <>
          <Button onClick={() => void startJam(boutId)}>Start Jam</Button>
          <Button onClick={() => null}>Start Lineup</Button>
        </>
      );
    }
  }, [isInJam, isInLineup, isInTimeout, boutId]);

  return (
    <div className="justify-content-center grid grid-flow-row w-1/2">
      <div className="justify-start items-center gap-4 grid grid-flow-col m-2 w-full">
        <GameTimer boutId={boutId} />
        <div className="gap-2 grid grid-flow-col w-full">{buttonRow}</div>
      </div>
      <div className="justify-center grid grid-flow-col">{children}</div>
    </div>
  );
}
