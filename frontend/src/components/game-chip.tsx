import { useContext } from "react";
import { BoutIdContext } from "../contexts/BoutIdContext";
import useBout from "../hooks/useBout";
import { BoutIdType } from "../types/bout";
import Clock from "./clock";
import useClock from "@/hooks/useClock";

export default function GameChip({ boutId }: { boutId?: BoutIdType }) {
  const boutIdContext = useContext<BoutIdType>(BoutIdContext);
  if (boutId === undefined) {
    boutId = boutIdContext;
  }
  if (!boutId) {
    throw Error("No BoutId provided");
  }

  const periodNum = useBout<number>(boutId, (bout) =>
    Number(bout.numJams[1] > 0)
  );
  const [jamNum, playState, scoreState] = useBout<[number, string, string]>(
    boutId,
    (bout) => [bout.numJams[periodNum] - 1, bout.playState, bout.scoreState]
  );

  // Add an optional flag to the game chip to indicate the game state
  let flag: string | null = null;
  if (scoreState === "live") {
    if (playState === "timeout") {
      flag = "Timeout";
    } else if (playState === "stopped") {
      if (periodNum === 0) {
        flag = "Pregame";
      } else {
        flag = "Halftime";
      }
    }
  } else if (scoreState === "unofficial") {
    flag = "Unofficial";
  } else {
    flag = "Final";
  }

  // TODO: change chip style when in pregame, halftime, unofficial, or final

  return (
    <div className="flex flex-col py-1 m-3 overflow-hidden text-xl rounded-lg bg-raisin-100 max-w-min">
      <div className="flex flex-row p-1 font-mono rounded-b-lg place-content-between bg-pink">
        <div className="flex-1 w-16 px-2 text-right min-w-fit">
          <Clock {...useClock(boutId, "period")} />
        </div>
        <div className="flex flex-none w-20 px-1 place-content-around border-x border-raisin border-raisin-400">
          <span className="flex-1 max-w-min">P{periodNum + 1}</span>
          <span className="flex-1 max-w-min">
            {playState === "lineup" ? "L" : "J"}
            {jamNum + 1}
          </span>
        </div>
        <div className="flex-1 w-16 px-1 text-right">
          <Clock
            {...useClock(boutId, playState === "stopped" ? "jam" : playState)}
            showMillis={playState === "jam" ? "auto" : "never"}
          />
        </div>
      </div>
      <div
        className={`${
          flag ? "visible" : "invisible"
        } bg-blue-200 size-full h-full font-semibold text-center text-sm`}
      >
        {flag}
      </div>
    </div>
  );
}
