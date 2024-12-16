import { PropsWithChildren, ReactElement, useContext } from "react";
import { BoutIdContext } from "../../../contexts/BoutIdContext";
import { BoutIdType } from "../../../types/BoutIdType";
import useJamIterator from "../hooks/useJamIterator";
import Button from "../../../components/Button";

export default function JamController({
  children,
}: PropsWithChildren): ReactElement {
  const boutId: BoutIdType = useContext(BoutIdContext);

  const [jamId, setJamId, nextJamId, previousJamId] = useJamIterator(boutId);
  const [periodNum, jamNum] = jamId;

  return (
    <div>
      <Button
        disabled={previousJamId == null}
        onClick={() => setJamId(previousJamId!)}
      >
        &#10094;
      </Button>
      <Button color="blue">{`P${periodNum + 1} J${jamNum + 1}`}</Button>
      <Button disabled={nextJamId == null} onClick={() => setJamId(nextJamId!)}>
        Go to Next Jam &#10095;
      </Button>
      {children}
    </div>
  );
}
