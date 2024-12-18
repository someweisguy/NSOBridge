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
import useBout from "../../../hooks/useBout";

export default function JamController(): ReactElement {
  const boutId: BoutIdType = useContext(BoutIdContext);
  const jamId: JamIdType = useContext(JamIdContext);
  const jam: JamType = useJam(boutId, jamId);
  const { latency } = useSocketState();

  const gameState = useBout<string>(boutId, (bout) => bout.gameState);

  const startStopJam = useCallback(() => {
    if (jam.start == null) {
      dispatch("bout", "startJam", { boutId, latency });
    } else if (jam.stop == null) {
      dispatch("bout", "stopJam", { boutId, latency });
    }
  }, [boutId, jam, latency]);

  const setStopReason = useCallback(
    (stopReason: string) => {
      dispatch("bout", "setStopReason", { boutId, jamId, stopReason });
    },
    [boutId, jamId]
  );

  if (jam.start == null) {
    return (
      <Button
        disabled={gameState == "timeout"}
        onClick={startStopJam}
        color="green"
      >
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
          <Button
            onClick={() => setStopReason("called")}
            isSelected={jam.stopReason == "called"}
          >
            Called
          </Button>
          <Button
            onClick={() => setStopReason("time")}
            isSelected={jam.stopReason == "time"}
          >
            Time
          </Button>
          <Button
            onClick={() => setStopReason("injury")}
            isSelected={jam.stopReason == "injury"}
          >
            Injury
          </Button>
          <Button
            onClick={() => setStopReason("other")}
            isSelected={jam.stopReason == "other"}
          >
            Other
          </Button>
        </ComboButton>
      </div>
    );
  }
}
