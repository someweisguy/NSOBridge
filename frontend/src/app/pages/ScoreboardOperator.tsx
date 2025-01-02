import ScoreKeeper from "../../features/ScoreKeeper/components/ScoreKeeper";
import JamPaginator from "../../features/JamPaginator/components/JamPaginator";
import Container from "../../components/Container";
import JamEndReason from "../../features/JamEndReason/components/JamEndReason";
import GameChip from "../../components/GameChip";
import GameController from "../../features/GameController/components/GameController";

export default function ScoreboardOperator() {
  return (
    <>
      <div className="flex flex-row items-center">
        <GameChip />
        <GameController />
      </div>
      <JamPaginator left={<JamEndReason />}>
        <div className="flex flex-row gap-4">
          <Container>
            <ScoreKeeper team="home" />
          </Container>
          <Container>
            <ScoreKeeper team="away" />
          </Container>
        </div>
      </JamPaginator>
    </>
  );
}
