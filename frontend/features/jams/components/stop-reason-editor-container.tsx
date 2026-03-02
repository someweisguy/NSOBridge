import TitledSegmentedControl from "@/components/titled-segmented-control";
import { useSuspenseJam } from "@/hooks/use-suspense-jam";
import { SegmentedControlProps } from "@mantine/core";

interface JamStopReasonControlProps extends Omit<
  SegmentedControlProps,
  "data" | "value" | "onChange"
> {
  boutUuid: string;
  periodNum: number;
  jamNum: number;
}

export default function JamStopReasonControlContainer({
  boutUuid,
  periodNum,
  jamNum,
  ...props
}: JamStopReasonControlProps) {
  const { data: jam } = useSuspenseJam(boutUuid, periodNum, jamNum);

  return (
    <TitledSegmentedControl
      title="Jam Stop Reason"
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
  );
}
