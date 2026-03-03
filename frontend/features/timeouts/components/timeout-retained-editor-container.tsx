import { useSuspenseTimeout } from "@/hooks/use-suspense-timeout";
import { Checkbox, CheckboxProps } from "@mantine/core";
import { useSetTimeoutRetained } from "../hooks/use-set-timeout-retained";

interface TimeoutRetainedEditorContainerProps extends Omit<
  CheckboxProps,
  "onChange"
> {
  boutUuid: string;
  timeoutNum: number;
}

export default function TimeoutRetainedEditorContainer({
  boutUuid,
  timeoutNum,
  label = "Review is Retained?",
}: TimeoutRetainedEditorContainerProps) {
  const { data: timeout } = useSuspenseTimeout({ boutUuid, timeoutNum });

  const setRetained = useSetTimeoutRetained(boutUuid, timeoutNum);
  return (
    <Checkbox
      label={label}
      checked={timeout.retained && timeout.isReview}
      disabled={!timeout.isReview}
      onChange={(event) => setRetained.mutate(event.currentTarget.checked)}
    ></Checkbox>
  );
}
