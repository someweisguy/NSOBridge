import { BoutIdContext } from "@/app/provider";
import Button from "@/components/button";
import GameTimer from "@/components/game-timer";
import useBout from "@/hooks/use-bout";
import { selectGameState, startJam, stopJam } from "@/lib/client/api/bout";
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

  const gameState = useBout(boutId, selectGameState);
  const buttonRow = useMemo(() => {
    switch (gameState) {
      case "intermission":
      case "lineup":
        return (
          <>
            <Button onClick={() => void startJam(boutId)}>Start Jam</Button>
          </>
        );
      case "jam":
        return (
          <>
            <Button onClick={() => void stopJam(boutId)}>End Jam</Button>
          </>
        );
    }
  }, [gameState, boutId]);

  return (
    <div className="justify-content-center grid grid-flow-row w-1/2">
      <div className="justify-start items-center gap-4 grid grid-flow-col m-2 w-full">
        <GameTimer boutId={boutId} />
        <div className="w-full">
          {buttonRow}
        </div>
      </div>
      <div className="justify-center grid grid-flow-col">{children}</div>
    </div>
  );
}
