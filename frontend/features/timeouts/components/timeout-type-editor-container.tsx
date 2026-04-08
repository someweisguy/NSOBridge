import TitledSegmentedControl from "@/components/titled-segmented-control";
import { useSuspenseTimeout } from "@/hooks/use-suspense-timeout";
import { TimeoutUri } from "@/types/query";
import { SegmentedControlProps } from "@mantine/core";
import { useSetTimeoutType } from "../hooks/use-set-timeout-type";

/**
 * Display a control which allows users to edit the type of the Timeout - either a
 * "Timeout" or an "Official Review."
 */
export default function TimeoutTypeEditorContainer({
  boutUuid,
  timeoutNum,
  ...props
}: TimeoutUri & Omit<SegmentedControlProps, "data" | "value" | "onChange">) {
  const { data: timeout } = useSuspenseTimeout({ boutUuid, timeoutNum });
  const setType = useSetTimeoutType({ boutUuid, timeoutNum });

  return (
    <TitledSegmentedControl
      label="Timeout Type"
      data={[
        { value: "timeout", label: "Timeout" },
        { value: "review", label: "Official Review" },
      ]}
      value={timeout.isReview ? "review" : "timeout"}
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
