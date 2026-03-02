import TitledSegmentedControl from "@/components/titled-segmented-control";
import { useSuspenseTimeout } from "@/hooks/use-suspense-timeout";
import { SegmentedControlProps } from "@mantine/core";
import { useSetTimeoutType } from "../hooks/use-set-timeout-type";

interface TimeoutTypeEditorContainerProps extends Omit<
  SegmentedControlProps,
  "data" | "value" | "onChange"
> {
  boutUuid: string;
  timeoutNum: number;
}

export default function TimeoutTypeEditorContainer({
  boutUuid,
  timeoutNum,
  ...props
}: TimeoutTypeEditorContainerProps) {
  const { data: timeout } = useSuspenseTimeout(boutUuid, timeoutNum);
  const setType = useSetTimeoutType(boutUuid, timeoutNum);

  return (
    <TitledSegmentedControl
      title="Timeout Type"
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
