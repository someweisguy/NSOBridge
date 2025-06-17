import { BoutIdContext } from "@/app/provider";
import useBout from "@/hooks/use-bout";
import { useContext } from "react";

interface TeamScoreProps {
  boutId?: string;
  team: number;
  divider?: string;
}

export default function TeamScore({
  boutId,
  team,
  divider = "",
}: TeamScoreProps) {
  const [boutIdContext] = useContext(BoutIdContext);
  boutId ??= boutIdContext;

  const teamScore: number = useBout(
    boutId,
    (bout) => bout.teams[team].gameScore
  );
  const jamScore: number = useBout(boutId, (bout) => bout.teams[team].jamScore);

  return (
    <div className="flex flex-row justify-center place-items-center gap-2">
      <div className="content-center w-full font-bold text-7xl text-right">
        {teamScore}
      </div>
      <div className="content-center w-min text-4xl text-center">{divider}</div>
      <div className="content-center w-full text-4xl text-left">{jamScore}</div>
    </div>
  );
}
