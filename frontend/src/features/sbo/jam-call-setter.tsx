import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { BoutIdContext } from "@/contexts/BoutIdContext";
import { ReactElement, useCallback, useContext } from "react";
import { JamIdContext } from "../JamPaginator/components/JamPaginator";
import useJam from "@/hooks/useJam";
import dispatch from "@/app/client";

export default function JamCallSetter(): ReactElement {
  const boutId = useContext(BoutIdContext);
  const jamId = useContext(JamIdContext);
  const jam = useJam(boutId, jamId);

  const setStopReason = useCallback(
    (stopReason: string) => {
      dispatch("bout", "setStopReason", { boutId, jamId, stopReason });
    },
    [boutId, jamId]
  );

  if (jam.stopReason == null) {
    return <div>This Jam has not ended</div>;
  }

  return (
    <ToggleGroup
      type="single"
      value={jam.stopReason}
      onValueChange={(stopReason) => setStopReason(stopReason)}
    >
      <ToggleGroupItem value="called">Called</ToggleGroupItem>
      <ToggleGroupItem value="time">Time</ToggleGroupItem>
      <ToggleGroupItem value="injury">Injury</ToggleGroupItem>
      <ToggleGroupItem value="other">Other</ToggleGroupItem>
    </ToggleGroup>
  );
}
