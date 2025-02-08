import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { BoutIdContext } from "@/contexts/bout-id";
import { ReactElement, useCallback, useContext } from "react";
import useJam from "@/hooks/use-jam";
import dispatch from "@/lib/client";
import { JamIdContext } from "@/contexts/jam-id";

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
