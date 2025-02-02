import ScoreKeeper from "../../features/ScoreKeeper/components/ScoreKeeper";
import JamPaginator from "../../features/JamPaginator/components/JamPaginator";
import JamEndReason from "../../features/JamEndReason/components/JamEndReason";
import GameChip from "../../components/game-chip";
import GameController from "../../features/GameController/components/GameController";
import ScoreViewer from "../../features/ScoreViewer/components/ScoreViewer";
import { Card } from "@/components/ui/card";

export default function ScoreboardOperator() {
  return (
    <div className="grid grid-flow-row grid-cols-1">
      <div className="flex flex-row items-center">
        <GameChip />
        <GameController />
      </div>
      <JamPaginator left={<JamEndReason />}>
        <div className="flex flex-row gap-4">
          <Card>
            <ScoreViewer team="home" />
            <ScoreKeeper team="home" />
          </Card>
          <Card>
            <ScoreViewer team="away" />
            <ScoreKeeper team="away" />
          </Card>
        </div>
      </JamPaginator>
    </div>
  );
}
