import useRoster from "@/hooks/use-roster";
import useRuleset from "@/hooks/use-ruleset";
import useTimeout from "@/hooks/use-timeout";
import { Team } from "@/types/game";
import TimeoutBar from "../../components/timeout-bar";
import useBout from "@/hooks/use-bout";
import JammerStatus from "../../components/jammer-status";

interface ScoreViewProps {
  boutScore: number;
  jamScore: number;
}

function ScoreView({ boutScore, jamScore }: ScoreViewProps) {
  return (
    <div className="flex flex-row flex-nowrap justify-end gap-2 w-full size-full">
      <h1 className="content-center min-w-fit max-w-1/2 font-bold text-9xl text-right grow">
        {boutScore}
      </h1>
      <h2 className="content-center ps-4 text-7xl text-left shrink-0 basis-1/3">
        {jamScore}
      </h2>
    </div>
  );
}

interface TeamsViewProps {
  team: Team;
}

export default function TeamView({ team }: TeamsViewProps) {
  const bout = useBout(team.boutId);
  const roster = useRoster(team.rosterId);
  const activeTimeout = useTimeout(team.boutId, bout.numTimeouts - 1);
  const ruleset = useRuleset(team.boutId);

  return (
    <div className="place-content-stretch gap-7 grid grid-cols-3 p-4">
      <div className="place-content-center col-span-full font-bold text-7xl text-center">
        {roster.name}
      </div>
      <div className="justify-center items-center grid">
        <TimeoutBar
          team={team}
          activeTimeout={activeTimeout}
          ruleset={ruleset}
        />
      </div>
      <div className="justify-stretch items-center grid">
        <ScoreView
          boutScore={team.boutScore + team.scoreOffset}
          jamScore={team.jamScore}
        />
      </div>
      <div className="justify-center items-center grid">
        {/* TODO: Get Jammer status */}
        <JammerStatus lead={false} lost={false} starPass={false} />
      </div>
    </div>
  );
}
