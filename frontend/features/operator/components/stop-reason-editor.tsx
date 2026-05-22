import { StopReasonString } from "@/types/jam";
import {
  Fieldset,
  SegmentedControl,
  SegmentedControlProps,
} from "@mantine/core";

interface JamStopReasonEditorProps {
  stopReason: StopReasonString | null;
}

/**
 * Display a control which allows users to set the reason that a Jam ended.
 */
export default function JamStopReasonEditor({
  stopReason,
  ...props
}: JamStopReasonEditorProps &
  Omit<SegmentedControlProps, "data" | "value" | "onChange">) {
  return (
    <Fieldset legend="Why did the jam end?" w="fit-content">
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
        value={stopReason ?? "other"}
        onChange={() => null} // TODO: add mutator
        {...props}
      />
    </Fieldset>
  );
}
