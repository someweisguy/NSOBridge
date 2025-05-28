import { BoutIdContext } from "@/app/provider";
import { editTimeout, TimeoutState } from "@/lib/client/api/bout";
import { TeamString, TimeoutTypeString } from "@/lib/client/api/types";
import { ToggleGroup } from "radix-ui";
import { useContext, useEffect, useRef, useState } from "react";

interface TimeoutControlsProps {
  boutId?: string;
}

export default function TimeoutControls({ boutId }: TimeoutControlsProps) {
  const [boutIdContext] = useContext(BoutIdContext);
  boutId ??= boutIdContext;

  const [timeoutState, setTimeoutState] = useState<TimeoutState>({
    type: null,
    team: null,
    details: "",
    result: "",
    retained: false,
  });
  const firstUpdate = useRef(true);

  useEffect(() => {
    if (firstUpdate.current) {
      firstUpdate.current = false;
      return; // Prevent the effects of this useEffect from firing immediately
    }
    void editTimeout(boutId, -1, timeoutState);
  }, [timeoutState, boutId]);

  // TODO: type, retained
  return (
    <>
      <ToggleGroup.Root
        type="single"
        onValueChange={(value: TeamString) => {
          setTimeoutState((timeout) => ({ ...timeout, team: value }));
        }}
      >
        <ToggleGroup.Item value="home">Home</ToggleGroup.Item>
        <ToggleGroup.Item value="away">Away</ToggleGroup.Item>
      </ToggleGroup.Root>

      <ToggleGroup.Root
        type="single"
        onValueChange={(value: TimeoutTypeString) => {
          setTimeoutState((timeout) => ({ ...timeout, type: value }));
        }}
      >
        <ToggleGroup.Item value="timeout">Timeout</ToggleGroup.Item>
        <ToggleGroup.Item value="review">Review</ToggleGroup.Item>
      </ToggleGroup.Root>
    </>
  );
}
