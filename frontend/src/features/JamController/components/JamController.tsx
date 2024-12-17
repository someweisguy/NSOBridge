import { PropsWithChildren, ReactElement, useContext } from "react";
import { BoutIdContext } from "../../../contexts/BoutIdContext";
import { BoutIdType } from "../../../types/BoutIdType";
import useJamIterator from "../hooks/useJamIterator";
import Button from "../../../components/Button";

export default function JamController({
  left = <></>,
  right = <></>,
  children,
}: PropsWithChildren<{
  left?: ReactElement;
  right?: ReactElement;
}>): ReactElement {
  const boutId: BoutIdType = useContext(BoutIdContext);

  const [jamId, setJamId, nextJamId, previousJamId] = useJamIterator(boutId);
  const [periodNum, jamNum] = jamId;

  return (
    <div className="flex flex-col items-center size-full">
      <div className="flex flex-row w-full">
        <div className="flex-1 text-start">{left}</div>
        <div className="flex-initial justify-center w-fit grid grid-cols-[40%_auto_40%]">
          <div className="mx-2 whitespace-nowrap text-end min-w-fit">
            <Button
              disabled={previousJamId == null}
              onClick={() => setJamId(previousJamId!)}
            >
              &#10094;
            </Button>
          </div>
          <div className="text-center whitespace-nowrap min-w-fit">
            <Button color="blue">{`P${periodNum + 1} J${jamNum + 1}`}</Button>
          </div>
          <div className="mx-2 whitespace-nowrap text-start min-w-fit">
            <Button
              disabled={nextJamId == null}
              onClick={() => setJamId(nextJamId!)}
            >
              Go to Next Jam &#10095;
            </Button>
          </div>
        </div>
        <div className="flex-1 text-end">{right}</div>
      </div>
      {children}
    </div>
  );
}
