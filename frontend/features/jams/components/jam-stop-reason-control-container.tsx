import { useSuspenseJam } from "@/hooks/use-suspense-jam";
import { Bout } from "@/lib/game/bouts";
import {
  SegmentedControl,
  SegmentedControlProps,
  Stack,
  Text,
} from "@mantine/core";

interface JamStopReasonControlProps extends Omit<
  SegmentedControlProps,
  "data" | "value" | "onChange"
> {
  bout: Bout;
  periodNum: number;
  jamNum: number;
}

export default function JamStopReasonControlContainer({
  bout,
  periodNum,
  jamNum,
  ...props
}: JamStopReasonControlProps) {
  const { data: jam } = useSuspenseJam(bout.uuid, periodNum, jamNum);

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
