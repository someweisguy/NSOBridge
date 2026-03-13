import { useSuspenseTimeout } from "@/hooks/use-suspense-timeout";
import { TimeoutUri } from "@/types/query";
import { Checkbox, CheckboxProps } from "@mantine/core";
import { useSetTimeoutRetained } from "../hooks/use-set-timeout-retained";

/**
 * Display a control with allows users to edit whether or not a Timeout or Official
 * Review was retained. In WFTDA 2026 rules, only Official Reviews can be retained. For
 * simplicity and flexibility the database schema allows either Timeouts or Reviews to
 * be retained.
 */
export default function TimeoutRetainedEditorContainer({
  boutUuid,
  timeoutNum,
  label = "Review is Retained?",
}: TimeoutUri & Omit<CheckboxProps, "onChange">) {
  const { data: timeout } = useSuspenseTimeout({ boutUuid, timeoutNum });

  const setRetained = useSetTimeoutRetained({ boutUuid, timeoutNum });
  return (
    <Checkbox
      label={label}
      checked={timeout.retained && timeout.isReview}
      disabled={!timeout.isReview}
      onChange={(event) => setRetained.mutate(event.currentTarget.checked)}
    />
  );
}
