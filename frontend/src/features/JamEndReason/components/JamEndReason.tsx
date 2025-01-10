import { ReactElement, useCallback, useContext } from "react";
import ComboButton from "../../../components/ComboButton";
import Button from "../../../components/Button";
import dispatch from "../../../app/client";
import { BoutIdContext } from "../../../contexts/BoutIdContext";
import { JamIdContext } from "../../JamPaginator/components/JamPaginator";
import useJam from "../../../hooks/useJam";
import { BoutIdType } from "../../../types/bout";
import { JamIdType, JamType } from "../../../types/jam";

export default function JamEndReason(): ReactElement {
  const boutId: BoutIdType = useContext(BoutIdContext);
  const jamId: JamIdType = useContext(JamIdContext);
  const jam: JamType = useJam(boutId, jamId);

  const setStopReason = useCallback(
    (stopReason: string) => {
      dispatch("bout", "setStopReason", { boutId, jamId, stopReason });
    },
    [boutId, jamId]
  );

  return (
    <div className={`max-w-fit ${jam.stop == null && "hidden"}`}>
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
