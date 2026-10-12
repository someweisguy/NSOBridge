import { useUpdateJamStopReason } from "@/features/new-operator/hooks/use-update-jam-stop-reason";
import { Jam, StopReasonString } from "@/types/jam";
import { Fieldset, FieldsetProps, SegmentedControl } from "@mantine/core";

interface JamStopReasonEditorProps extends FieldsetProps {
  jam: Jam;
}

/**
 * Display a control which allows users to set the reason that a Jam ended.
 */
export default function JamStopReasonEditor({
  jam,
  ...props
}: JamStopReasonEditorProps) {
  const { mutate: setStopReason } = useUpdateJamStopReason({ jam });

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
        value={jam.stopReason ?? "other"}
        onChange={(value: StopReasonString) => setStopReason(value)}
      />
    </Fieldset>
  );
}
