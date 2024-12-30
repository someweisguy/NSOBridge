import { useContext } from "react";
import { BoutIdContext } from "../contexts/BoutIdContext";
import { BoutIdType } from "../types/BoutIdType";
import useBout from "../hooks/useBout";
import Clock from "../features/DynamicClock/components/Clock";

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
  const [jamNum, playState] = useBout<[number, string]>(boutId, (bout) => [
    bout.numJams[periodNum] - 1,
    bout.playState,
  ]);

  // TODO: add Pregame, halftime, unofficial, and final states

  return (
    <div className="flex flex-col bg-raisin-100 m-3 py-2 rounded-lg max-w-min text-lg overflow-hidden">
      <div className="flex flex-row place-content-between bg-pink p-1 rounded-b-lg font-mono">
        <div className="text-right flex-1 px-2 w-16 min-w-fit">
          <Clock type="period" />
        </div>
        <div className="flex flex-none place-content-around border-x px-1 border-raisin border-raisin-400 w-20">
          <span className="flex-1 max-w-min">P{periodNum + 1}</span>
          <span className="flex-1 max-w-min">
            {playState === "lineup" ? "L" : "J"}
            {jamNum + 1}
          </span>
        </div>

        <div className="text-right flex-1 px-1 w-16">
          <Clock type={playState === "stopped" ? "jam" : playState} />
        </div>
      </div>
      <div className="hidden bg-blue-200 w-full font-semibold text-center text-sm">
        Timeout
      </div>
    </div>
  );
}
