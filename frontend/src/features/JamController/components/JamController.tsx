import { ReactElement, useCallback, useContext } from "react";
import { BoutIdType } from "../../../types/BoutIdType";
import { BoutIdContext } from "../../../contexts/BoutIdContext";
import { JamIdType } from "../../../types/JamIdType";
import { JamIdContext } from "../../JamPaginator/components/JamPaginator";
import { useSocketState } from "../../../app/hooks/useConnection";
import dispatch from "../../../app/client";
import { JamType } from "../../../types/JamType";
import useJam from "../../../hooks/useJam";
import Button from "../../../components/Button";
import Clock from "../../../components/Clock";
import ComboButton from "../../../components/ComboButton";

export default function JamController(): ReactElement {
  const boutId: BoutIdType = useContext(BoutIdContext);
  const jamId: JamIdType = useContext(JamIdContext);
  const jam: JamType = useJam(boutId, jamId);
  const { latency } = useSocketState();

  const startStopJam = useCallback(() => {
    if (jam.start == null) {
      dispatch("bout", "startJam", { boutId, latency });
    } else if (jam.stop == null) {
      dispatch("bout", "stopJam", { boutId, latency });
    }
  }, [boutId, jam, latency]);

  if (jam.start == null) {
    return (
      <Button onClick={startStopJam} color="green">
        <p className="min-w-20">Start Jam</p>
      </Button>
    );
  } else if (jam.stop == null) {
    return (
      <Button onClick={startStopJam} color="red">
        <p className="min-w-20">
          <Clock type="jam" />
        </p>
      </Button>
    );
  } else {
    return (
      <div className="max-w-fit">
        <ComboButton>
          <Button isSelected={jam.stopReason == "called"}>Called</Button>
          <Button isSelected={jam.stopReason == "time"}>Time</Button>
          <Button isSelected={jam.stopReason == "injury"}>Injury</Button>
          <Button isSelected={jam.stopReason == "other"}>Other</Button>
        </ComboButton>
      </div>
    );
  }
}
