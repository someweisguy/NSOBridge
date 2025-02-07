import JamPaginator from "../../features/JamPaginator/components/JamPaginator";
import GameChip from "../../features/sbo/game-chip";
import GameController from "../../features/GameController/components/GameController";
import { Card } from "@/components/ui/card";
import JamCallSetter from "@/features/sbo/jam-call-setter";
import TeamScoreCard from "../../features/sbo/team-score-card";

export default function ScoreboardOperator() {
  return (
    <div className="grid grid-flow-row grid-cols-1">
      <div className="flex flex-row items-center">
        <GameChip />
        <GameController />
      </div>
      <JamPaginator left={<JamCallSetter />}>
        <div className="flex flex-row gap-4">
          <Card>
            <TeamScoreCard team="home" />
          </Card>
          <Card>
            <TeamScoreCard team="away" />
          </Card>
        </div>
      </JamPaginator>
    </div>
  );
}
