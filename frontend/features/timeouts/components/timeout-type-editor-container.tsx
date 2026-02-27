import { useSuspenseTimeout } from "@/hooks/use-suspense-timeout";
import { Bout } from "@/lib/game/bouts";
import {
  SegmentedControl,
  SegmentedControlProps,
  Stack,
  Text,
} from "@mantine/core";
import { useSetTimeoutType } from "../hooks/use-set-timeout-type";

interface TimeoutTypeEditorContainerProps extends Omit<
  SegmentedControlProps,
  "data" | "value" | "onChange"
> {
  bout: Bout;
  timeoutNum: number;
}

export default function TimeoutTypeEditorContainer({
  bout,
  timeoutNum,
  ...props
}: TimeoutTypeEditorContainerProps) {
  const { data: timeout } = useSuspenseTimeout(bout.uuid, timeoutNum);
  const setType = useSetTimeoutType(timeout);

  return (
    <Stack gap="0">
      <Text size="sm" fw="300">
        Timeout Type
      </Text>
      <SegmentedControl
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
    </Stack>
  );
}
