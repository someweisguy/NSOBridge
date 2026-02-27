import { useSuspenseJam } from "@/hooks/use-suspense-jam";
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
  uuid: string;
  periodNum: number;
  jamNum: number;
}

export default function JamStopReasonControlContainer({
  uuid,
  periodNum,
  jamNum,
  ...props
}: JamStopReasonControlProps) {
  const { data: jam } = useSuspenseJam(uuid, periodNum, jamNum);

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
