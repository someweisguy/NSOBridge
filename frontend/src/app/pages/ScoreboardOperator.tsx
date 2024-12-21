import ScoreKeeper from "../../features/ScoreKeeper/components/ScoreKeeper";
import JamPaginator from "../../features/JamPaginator/components/JamPaginator";
import Container from "../../components/Container";
import JamController from "../../features/JamController/components/JamController";
import TimeoutController from "../../features/TimeoutController/components/TimeoutController";
import Clock from "../../components/Clock";
import JamEndReason from "../../features/JamEndReason/components/JamEndReason";

export default function ScoreboardOperator() {
  return (
    <>
      <div className="flex w-full spaced-between">
        <div className="flex-1">
          <JamController />
        </div>
        <div className="flex-1">
          <TimeoutController />
        </div>
      </div>
      <JamPaginator left={<JamEndReason />}>
        <Clock type="period" />
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
