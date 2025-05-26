import { BoutIdContext } from "@/app/provider";
import { useContext } from "react";
import Clock from "./clock";
import useActiveJamId from "@/hooks/use-active-jam-id";
import useLatestJamId from "@/hooks/use-latest-jam-id";
import useBout from "@/hooks/use-bout";

interface TimerViewProps {
  boutId?: string;
}

export default function GameTimer({ boutId }: TimerViewProps) {
  const [boutIdContext] = useContext(BoutIdContext);
  boutId ??= boutIdContext;

  const gameState: GameStateType = useBout(boutId, selectGameState);

  // Get the active or latest Jam ID
  const activeJamId = useActiveJamId(boutId);
  const latestJamId = useLatestJamId(boutId);
  const [periodNum, jamNum] = activeJamId ?? latestJamId;

  return (
    <div className="items-center gap-2 grid grid-flow-col p-1 border rounded-md w-fit text-xl">
      <div className="px-1 w-14 text-right">
        <Clock boutId={boutId} name="game" />
      </div>
      <div className="p-2 border-gray-200 border-x w-24 text-2xl text-center">
        P{periodNum + 1} {gameState === "lineup" ? "L" : "J"}
        {jamNum + 1}
      </div>
      <div className="px-1 w-12 text-right">
        <Clock
          boutId={boutId}
          name={["jam", "stopped"].includes(gameState) ? "jam" : "lineup"}
          showMillis={gameState === "jam" ? "auto" : false}
        />
      </div>
    </div>
  );
}
