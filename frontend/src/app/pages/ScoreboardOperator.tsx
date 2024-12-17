import ScoreKeeper from "../../features/ScoreKeeper/components/ScoreKeeper";
import JamPaginator from "../../features/JamPaginator/components/JamPaginator";
import Container from "../../components/Container";

export default function ScoreboardOperator() {
  return (
    <>
      <JamPaginator>
        {/* <Clock type="lineup" />
          &nbsp;
          <Clock type="period" />
          &nbsp;
          <Clock type="timeout" /> */}
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
