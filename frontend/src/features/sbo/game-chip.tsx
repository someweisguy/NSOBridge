import { useContext } from "react";
import { BoutIdContext } from "../../contexts/bout-id";
import useBout from "../../hooks/use-bout";
import { BoutIdType } from "../../types/bout";
import Clock from "../../components/clock";
import useClock from "@/hooks/use-clock";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

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

  // TODO: get flag to display exceptional game state (e.g. timeouts)

  return (
    <Card className="grid grid-flow-col gap-2 p-2">
      <Clock className="w-12" {...useClock(boutId, "period")} />
      <Separator orientation="vertical" />
      <div className="min-w-14 text-center">
        {"P" + (periodNum + 1)}&nbsp;
        {(playState === "lineup" ? "L" : "J") + (jamNum + 1)}
      </div>
      <Separator orientation="vertical" />
      <Clock
        className="w-12"
        {...useClock(boutId, playState === "stopped" ? "jam" : playState)}
        showMillis={playState === "jam" ? "auto" : "never"}
      />
    </Card>
  );
}
