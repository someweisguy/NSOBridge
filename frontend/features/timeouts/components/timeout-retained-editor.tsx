import { Timeout } from "@/lib/game/timeouts";
import { TimeoutContext } from "@/utils/contexts";
import { Checkbox, CheckboxProps } from "@mantine/core";
import { useContext } from "react";
import { useSetRetained } from "../hooks/set-retained";

export default function TimeoutRetainedEditor({
  label = "Review is Retained?",
}: Omit<CheckboxProps, "onChange">) {
  const timeout: Timeout | null = useContext(TimeoutContext);
  if (timeout == null) {
    throw new Error(
      "TimeoutRetainedEditor must be used within a TimeoutProvider",
    );
  }

  const setRetained = useSetRetained(timeout);
  return (
    <Checkbox
      label={label}
      checked={timeout.retained && timeout.isReview}
      disabled={!timeout.isReview}
      onChange={(event) => setRetained.mutate(event.currentTarget.checked)}
    ></Checkbox>
  );
}
