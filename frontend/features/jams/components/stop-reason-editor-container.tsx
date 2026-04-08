import TitledSegmentedControl from "@/components/titled-segmented-control";
import { useSuspenseJam } from "@/hooks/use-suspense-jam";
import { JamUri } from "@/types/query";
import { SegmentedControlProps } from "@mantine/core";

/**
 * Display a control which allows users to set the reason that a Jam ended.
 */
export default function JamStopReasonEditorContainer({
  boutUuid,
  periodNum,
  jamNum,
  ...props
}: JamUri & Omit<SegmentedControlProps, "data" | "value" | "onChange">) {
  const { data: jam } = useSuspenseJam({ boutUuid, periodNum, jamNum });

  return (
    <TitledSegmentedControl
      label="Jam Stop Reason"
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
      disabled={true} // TODO: remove when mutator is added
      onChange={() => null} // TODO: add mutator
      {...props}
    />
  );
}
