import TitledSegmentedControl from "@/components/titled-segmented-control";
import { StopReasonString } from "@/types/jam";

interface JamStopReasonEditorProps {
  stopReason: StopReasonString | null;
}

/**
 * Display a control which allows users to set the reason that a Jam ended.
 */
export default function JamStopReasonEditor({
  stopReason,
  ...props
}: JamStopReasonEditorProps) {
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
      value={stopReason ?? "other"}
      disabled={true} // TODO: remove when mutator is added
      onChange={() => null} // TODO: add mutator
      {...props}
    />
  );
}
