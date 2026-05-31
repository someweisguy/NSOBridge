import { StopReasonString } from "@/types/jam";
import { JamUri } from "@/types/query";
import { Fieldset, FieldsetProps, SegmentedControl } from "@mantine/core";
import { useSetJamStopReason } from "../hooks/use-set-jam-stop-reason";

interface JamStopReasonEditorProps extends FieldsetProps {
  jamUri: JamUri;
  stopReason: StopReasonString | null;
}

/**
 * Display a control which allows users to set the reason that a Jam ended.
 */
export default function JamStopReasonEditor({
  jamUri,
  stopReason,
  ...props
}: JamStopReasonEditorProps) {
  const setStopReason = useSetJamStopReason(jamUri);

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
        onChange={(value: string) =>
          setStopReason.mutate(value as StopReasonString)
        }
      />
    </Fieldset>
  );
}
