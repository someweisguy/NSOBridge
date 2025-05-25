import { BoutIdContext } from "@/app/provider";
import GameTimer from "@/components/game-timer";
import { PropsWithChildren, useContext } from "react";

interface JamControllerProps extends PropsWithChildren {
  boutId?: string;
}

export default function JamController({
  boutId,
  children,
}: JamControllerProps) {
  const [boutIdContext] = useContext(BoutIdContext);
  boutId ??= boutIdContext;

  return (
    <div className="justify-center content-center grid grid-flow-row">
      <div className="grid grid-flow-col">
        <GameTimer boutId={boutId} />
      </div>
      <div className="justify-center content-center grid grid-flow-col">
        {children}
      </div>
    </div>
  );
}

/*
Lineup: startJam, callTimeout, endPeriod

Jam: stopJam, stopJamCallTimeout

Timeout:


Stopped: starJam, startLineup, startIntermissionClock


*/
