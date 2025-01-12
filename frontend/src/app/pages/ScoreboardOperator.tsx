import ScoreKeeper from "../../features/ScoreKeeper/components/ScoreKeeper";
import JamPaginator from "../../features/JamPaginator/components/JamPaginator";
import Container from "../../components/Container";
import JamEndReason from "../../features/JamEndReason/components/JamEndReason";
import GameChip from "../../components/GameChip";
import GameController from "../../features/GameController/components/GameController";
import ScoreViewer from "../../features/ScoreViewer/components/ScoreViewer";

export default function ScoreboardOperator() {
  return (
    <div className="grid grid-flow-row grid-cols-1">
      <div className="flex flex-row items-center">
        <GameChip />
        <GameController />
      </div>
      <JamPaginator left={<JamEndReason />}>
        <div className="flex flex-row gap-4">
          <Container>
            <ScoreViewer team="home" />
            <ScoreKeeper team="home" />
          </Container>
          <Container>
            <ScoreViewer team="away" />
            <ScoreKeeper team="away" />
          </Container>
        </div>
      </JamPaginator>
    </div>
  );
}
