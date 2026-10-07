import { StopReasonString } from "@/types/jam";
import { Fieldset, FieldsetProps, SegmentedControl } from "@mantine/core";

interface JamStopReasonEditorProps extends FieldsetProps {
  stopReason: StopReasonString | null;
}

/**
 * Display a control which allows users to set the reason that a Jam ended.
 */
export default function JamStopReasonEditor({
  stopReason,
  ...props
}: JamStopReasonEditorProps) {
  // const setStopReason = useSetJamStopReason(jamUri); // FIXME

  return (
    <Fieldset legend="Why did the jam end?" {...props}>
      <SegmentedControl
        size="xs"
        w="100%"
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
        // onChange={(value: string) =>  // FIXME
        //   setStopReason.mutate(value as StopReasonString)
        // }
      />
    </Fieldset>
  );
}
