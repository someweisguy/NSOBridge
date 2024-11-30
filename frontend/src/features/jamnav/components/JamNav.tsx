import { ReactElement } from "react";
import JamTraverse from "./JamTraverse";
import CurrentJam from "./CurrentJam";
import { JamIndex } from "../types/JamIndex";

export default function JamNav({ jamIndex }: { jamIndex: JamIndex }): ReactElement {
  const {
    currentJamId,
    nextJamExists,
    goToNextJam,
    previousJamExists,
    goToPreviousJam,
  } = jamIndex;

  return (
    <div className="flex w-full items-center p-4 max-w-[400px]">
      <JamTraverse disabled={!previousJamExists} onClick={goToPreviousJam}>Back</JamTraverse>
      <CurrentJam jamId={currentJamId} />
      <JamTraverse disabled={!nextJamExists} onClick={goToNextJam}>Next</JamTraverse>
    </div>
  );
}
