import { ReactElement } from "react";
import JamTraverseButton from "./JamTraverseButton";
import CurrentJam from "./CurrentJam";
import { JamNavigationType } from "../types/JamNavigationType";

export default function JamNavigator({ jamIndex }: { jamIndex: JamNavigationType }): ReactElement {
  const {
    currentJamId,
    nextJamExists,
    goToNextJam,
    previousJamExists,
    goToPreviousJam,
  } = jamIndex;

  return (
    <div className="flex w-full items-center p-4 max-w-[400px]">
      <JamTraverseButton disabled={!previousJamExists} onClick={goToPreviousJam}>Back</JamTraverseButton>
      <CurrentJam jamId={currentJamId} />
      <JamTraverseButton disabled={!nextJamExists} onClick={goToNextJam}>Next</JamTraverseButton>
    </div>
  );
}
