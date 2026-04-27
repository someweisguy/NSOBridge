import TitledSegmentedControl from "@/components/titled-segmented-control";
import { TimeoutUri } from "@/types/query";
import { SegmentedControlProps } from "@mantine/core";
import { useSetTimeoutType } from "../hooks/use-set-timeout-type";

interface TimeoutTypeEditor extends Omit<
  SegmentedControlProps,
  "data" | "value" | "onChange"
> {
  timeoutUri: TimeoutUri;
  isReview: boolean;
}

/**
 * Display a control which allows users to edit the type of the Timeout - either a
 * "Timeout" or an "Official Review."
 */
export default function TimeoutTypeEditor({
  timeoutUri,
  isReview,
  ...props
}: TimeoutTypeEditor) {
  const setType = useSetTimeoutType({ ...timeoutUri });

  return (
    <TitledSegmentedControl
      label="Timeout Type"
      data={[
        { value: "timeout", label: "Timeout" },
        { value: "review", label: "Official Review" },
      ]}
      value={isReview ? "review" : "timeout"}
      onChange={(type: string) => {
        if (type != "review" && type != "timeout") {
          throw new Error("TimeoutTypeEditor is incorrectly configured");
        }
        setType.mutate(type);
      }}
      {...props}
    />
  );
}
