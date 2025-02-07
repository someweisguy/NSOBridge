import ScoreKeeper from "../../features/sbo/ScoreKeeper";
import JamPaginator from "../../features/JamPaginator/components/JamPaginator";
import GameChip from "../../features/sbo/game-chip";
import GameController from "../../features/GameController/components/GameController";
import ScoreViewer from "../../features/ScoreViewer/components/ScoreViewer";
import { Card } from "@/components/ui/card";
import JamCallSetter from "@/features/sbo/jam-call-setter";

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
