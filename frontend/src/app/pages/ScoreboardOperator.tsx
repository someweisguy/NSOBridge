import ScoreKeeper from "../../features/ScoreKeeper/components/ScoreKeeper";
import JamPaginator from "../../features/JamPaginator/components/JamPaginator";
import Container from "../../components/Container";
import JamController from "../../features/JamController/components/JamController";
import TimeoutController from "../../features/TimeoutController/components/TimeoutController";
import JamEndReason from "../../features/JamEndReason/components/JamEndReason";
import IntermissionHandler from "../../features/IntermissionHandler/components/IntermissionHandler";
import GameChip from "../../components/GameChip";
import GameController from "../../features/GameController/components/GameController";


export default function ScoreboardOperator() {
  return (
    <>
      <div className="flex flex-row items-center">
        <GameChip />
        <GameController />
      </div>
      <IntermissionHandler />
      <div className="flex w-full spaced-between">
        <div className="flex-1">
          <JamController />
        </div>
        <div className="flex-1">
          <TimeoutController />
        </div>
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
