import { ReactElement, useCallback, useContext } from "react";
import dispatch from "../../../app/client";
import { BoutIdContext } from "../../../contexts/BoutIdContext";
import { JamIdContext } from "../../JamPaginator/components/JamPaginator";
import useJam from "../../../hooks/useJam";
import { BoutIdType } from "../../../types/bout";
import { JamIdType, JamType } from "../../../types/jam";
import { ToggleGroup } from "@radix-ui/react-toggle-group";
import { ToggleGroupItem } from "@/components/ui/toggle-group";

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
      <ToggleGroup
        type="single"
        defaultValue={jam.stopReason!}
        onValueChange={(value) => setStopReason(value)}
      >
        <ToggleGroupItem value="called">Called</ToggleGroupItem>
        <ToggleGroupItem value="time">Time</ToggleGroupItem>
        <ToggleGroupItem value="injury">Injury</ToggleGroupItem>
        <ToggleGroupItem value="other">Other</ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}
