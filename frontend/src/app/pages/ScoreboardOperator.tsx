import ScoreKeeper from "../../features/ScoreKeeper/components/ScoreKeeper";
import JamPaginator from "../../features/JamPaginator/components/JamPaginator";
import Container from "../../components/Container";
import JamController from "../../features/JamController/components/JamController";
import TimeoutController from "../../features/TimeoutController/components/TimeoutController";
import Clock from "../../components/Clock";

export default function ScoreboardOperator() {
  return (
    <>
      <JamPaginator left={<JamController />} right={<TimeoutController />}>
        <Clock type="lineup" />
          &nbsp;
          <Clock type="period" />
          &nbsp;
          <Clock type="timeout" />
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
