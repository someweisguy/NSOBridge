import { Timeout } from "@/lib/game/timeouts";
import { TimeoutContext } from "@/utils/contexts";
import {
  SegmentedControl,
  SegmentedControlProps,
  Stack,
  Text,
} from "@mantine/core";
import { useContext } from "react";
import { useSetType } from "../hooks/set-type";

export default function TimeoutTypeEditor({
  ...props
}: Omit<SegmentedControlProps, "data" | "value" | "onChange">) {
  const timeout: Timeout | null = useContext(TimeoutContext);
  if (timeout == null) {
    throw new Error("TimeoutTypeEditor must be used within a TimeoutProvider");
  }

  const setType = useSetType(timeout);

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
