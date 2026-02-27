import { useSuspenseTimeout } from "@/hooks/use-suspense-timeout";
import { Bout } from "@/lib/game/bouts";
import { Checkbox, CheckboxProps } from "@mantine/core";
import { useSetTimeoutRetained } from "../hooks/use-set-timeout-retained";

interface TimeoutRetainedEditorContainerProps extends Omit<
  CheckboxProps,
  "onChange"
> {
  bout: Bout;
  timeoutNum: number;
}

export default function TimeoutRetainedEditorContainer({
  bout,
  timeoutNum,
  label = "Review is Retained?",
}: TimeoutRetainedEditorContainerProps) {
  const { data: timeout } = useSuspenseTimeout(bout.uuid, timeoutNum);

  const setRetained = useSetTimeoutRetained(timeout);
  return (
    <Checkbox
      label={label}
      checked={timeout.retained && timeout.isReview}
      disabled={!timeout.isReview}
      onChange={(event) => setRetained.mutate(event.currentTarget.checked)}
    ></Checkbox>
  );
}
