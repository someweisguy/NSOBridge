import ScoreKeeper from "../../features/ScoreKeeper/components/ScoreKeeper";
import JamController from "../../features/JamController/components/JamController";
import Clock from "../../components/Clock";

export default function ScoreboardOperator() {


  return (
    <>
      <div className="flex flex-col items-center">
        <JamController>
          <Clock type="lineup" />
          <div className="flex flex-row gap-4">
            <div className="flex flex-col items-center">
              <ScoreKeeper team="home" />
            </div>
            <div className="flex flex-col items-center">
              <ScoreKeeper team="away" />
            </div>
          </div>
        </JamController>
      </div>
    </>
  );
}
