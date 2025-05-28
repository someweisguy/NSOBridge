import { BoutIdContext } from "@/app/provider";
import useBout from "@/hooks/use-bout";
import { editTimeout, TimeoutState } from "@/lib/client/api/bout";
import { Bout, TeamString, Timeout } from "@/lib/client/api/types";
import { Switch, ToggleGroup } from "radix-ui";
import { useContext, useEffect, useRef, useState } from "react";

interface TimeoutControlsProps {
  boutId?: string;
}

export default function TimeoutControls({ boutId }: TimeoutControlsProps) {
  const [boutIdContext] = useContext(BoutIdContext);
  boutId ??= boutIdContext;

  const bout: Bout = useBout(boutId);
  const [timeoutState, setTimeoutState] = useState<TimeoutState>(() => {
    const numTimeouts = bout.timer.timeouts.length;
    const timeout: Timeout | undefined = bout.timer.timeouts[numTimeouts - 1];
    return {
      isReview: timeout.isReview ?? false,
      team: timeout.team ?? null,
      details: timeout.details ?? "",
      result: timeout.result ?? "",
      retained: timeout.retained ?? false,
    };
  });
  const firstUpdate = useRef(true);

  useEffect(() => {
    if (firstUpdate.current) {
      firstUpdate.current = false;
      return; // Prevent the effects of this useEffect from firing immediately
    }
    void editTimeout(boutId, -1, timeoutState);
  }, [timeoutState, boutId]);

  // TODO: make switch and toggle group its own component
  return (
    <>
      <Switch.Root
        defaultChecked={timeoutState.isReview}
        onCheckedChange={(checked: boolean) => {
          setTimeoutState((timeout) => {
            if (checked && timeout.team === "official") {
              return { ...timeout, isReview: checked, team: null };
            }
            return { ...timeout, isReview: checked };
          });
        }}
      >
        <Switch.Thumb className="block bg-black rounded-full size-[21px] transition-transform translate-x-0.5 data-[state=checked]:translate-x-[19px] duration-100 will-change-transform" />
      </Switch.Root>

      <ToggleGroup.Root
        type="single"
        onValueChange={(value: TeamString) => {
          setTimeoutState((timeout) => ({ ...timeout, team: value }));
        }}
      >
        <ToggleGroup.Item value="home">Home</ToggleGroup.Item>
        <ToggleGroup.Item value="away">Away</ToggleGroup.Item>
        <ToggleGroup.Item disabled={timeoutState.isReview} value="official">
          Official
        </ToggleGroup.Item>
      </ToggleGroup.Root>
    </>
  );
}
