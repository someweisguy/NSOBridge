import { BoutIdContext } from "@/app/provider";
import { editTimeout, TimeoutState } from "@/lib/client/api/bout";
import { TeamString } from "@/lib/client/api/types";
import { Switch, ToggleGroup } from "radix-ui";
import { useContext, useEffect, useRef, useState } from "react";

interface TimeoutControlsProps {
  boutId?: string;
}

export default function TimeoutControls({ boutId }: TimeoutControlsProps) {
  const [boutIdContext] = useContext(BoutIdContext);
  boutId ??= boutIdContext;

  const [timeoutState, setTimeoutState] = useState<TimeoutState>({
    isReview: false,
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
      <Switch.Root onCheckedChange={(checked: boolean) => {
        setTimeoutState((timeout) => {
          if (checked && timeout.team === "official") {
            return { ...timeout, isReview: checked, team: null }
          }
          return { ...timeout, isReview: checked }
        })
      }}>
        <Switch.Thumb />
      </Switch.Root>

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
        onValueChange={(value: "true" | "false") => {
          setTimeoutState((timeout) => ({ ...timeout, type: value }));
        }}
      >
        <ToggleGroup.Item value="true">Timeout</ToggleGroup.Item>
        <ToggleGroup.Item value="false">Review</ToggleGroup.Item>
      </ToggleGroup.Root>
    </>
  );
}
