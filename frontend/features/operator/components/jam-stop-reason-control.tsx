import { Jam } from "@/lib/game/jams";
import { JamContext } from "@/utils/contexts";
import {
  SegmentedControl,
  SegmentedControlProps,
  Stack,
  Text,
} from "@mantine/core";
import { useContext } from "react";

export default function JamStopReasonControl({
  ...props
}: Omit<SegmentedControlProps, "data" | "value" | "onChange">) {
  const jam: Jam | null = useContext(JamContext);
  if (jam == null) {
    throw new Error("JamStopReasonControl must be used within a JamProvider");
  }

  return (
    <Stack gap="0">
      <Text size="sm" fw="300">
        Jam Stop Reason
      </Text>
      <SegmentedControl
        data={[
          {
            value: "called",
            label: "Called",
          },
          {
            value: "elapsed",
            label: "Time",
          },
          {
            value: "injury",
            label: "Injury",
          },
          {
            value: "other",
            label: "Other",
          },
        ]}
        value={jam.stopReason ?? "other"}
        onChange={() => null} // FIXME: add mutator
        {...props}
      />
    </Stack>
  );
}
