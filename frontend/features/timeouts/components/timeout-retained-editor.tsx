import { TimeoutUri } from "@/types/query";
import { Checkbox, CheckboxProps } from "@mantine/core";
import { useSetTimeoutRetained } from "../hooks/use-set-timeout-retained";

interface TimeoutRetainedEditorProps extends Omit<CheckboxProps, "onChange"> {
  timeoutUri: TimeoutUri;
  retained: boolean;
  isReview: boolean;
}

/**
 * Display a control with allows users to edit whether or not a Timeout or Official
 * Review was retained. In WFTDA 2026 rules, only Official Reviews can be retained. For
 * simplicity and flexibility the database schema allows either Timeouts or Reviews to
 * be retained.
 */
export default function TimeoutRetainedEditor({
  timeoutUri,
  retained,
  isReview,
  label = "Review is Retained?",
}: TimeoutRetainedEditorProps) {
  const setRetained = useSetTimeoutRetained({ ...timeoutUri });
  return (
    <Checkbox
      label={label}
      checked={retained && isReview}
      disabled={!isReview}
      onChange={(event) => setRetained.mutate(event.currentTarget.checked)}
    />
  );
}
