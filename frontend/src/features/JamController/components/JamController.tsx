import {
  PropsWithChildren,
  ReactElement,
  useContext,
} from "react";
import TraverseJamButton from "./TraverseJamButton";
import CurrentJam from "./CurrentJam";
import useJamNavigation from "../hooks/useJamNavigation";
import { BoutIdContext } from "../../../contexts/BoutIdContext";
import { BoutIdType } from "../../../types/BoutIdType";
import StartJam from "./StartJam";
import StopJam from "./StopJam";
import { JamType } from "../../../types/JamType";
import useJam from "../../../hooks/useJam";
import { JamIdContext } from "../../../contexts/JamIdContext";

export default function JamController({
  children,
}: PropsWithChildren): ReactElement {
  const boutId: BoutIdType = useContext(BoutIdContext);

  const {
    currentJamId,
    nextJamExists,
    goToNextJam,
    previousJamExists,
    goToPreviousJam,
    // goToCustomJam,  // TODO
  } = useJamNavigation(boutId);

  const jam: JamType = useJam(boutId, currentJamId);
  const jamHasStarted: boolean = jam.start != null;
  const jamHasFinished: boolean = jam.stop != null;

  const [periodNum, jamNum] = currentJamId;

  return (
    <div className="flex flex-col">
      <div className="flex flex-row items-center">
        <div className="basis-1/2">
          {jamHasStarted ? (jamHasFinished ? <></> : <StopJam />) : <StartJam />}
        </div>

        <div className="basis-1/2 place-items-end">
          <div className="flex items-center p-4">
            <TraverseJamButton
              disabled={!previousJamExists}
              onClick={goToPreviousJam}
            >
              &#10094;
            </TraverseJamButton>
            <CurrentJam periodNum={periodNum} jamNum={jamNum} />
            <TraverseJamButton disabled={!nextJamExists} onClick={goToNextJam}>
              Go to Next Jam &#10095;
            </TraverseJamButton>
          </div>
        </div>
      </div>
      <JamIdContext.Provider value={currentJamId}>
        {children}
      </JamIdContext.Provider>
    </div>
  );
}
