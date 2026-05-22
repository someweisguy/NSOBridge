import { StopReasonString } from "@/types/jam";
import { JamUri } from "@/types/query";
import {
  Fieldset,
  SegmentedControl,
  SegmentedControlProps,
} from "@mantine/core";
import { useSetJamStopReason } from "../hooks/use-set-jam-stop-reason";

interface JamStopReasonEditorProps {
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
}: JamStopReasonEditorProps &
  Omit<SegmentedControlProps, "data" | "value" | "onChange">) {
  const setStopReason = useSetJamStopReason(jamUri);

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
        onChange={(value: string) =>
          setStopReason.mutate(value as StopReasonString)
        }
        {...props}
      />
    </Fieldset>
  );
}
