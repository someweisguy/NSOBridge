import TitledSegmentedControl from "@/components/titled-segmented-control";
import { TimeoutUri } from "@/types/query";
import { SegmentedControlProps } from "@mantine/core";
import { useDeferredValue } from "react";
import { useSetTimeoutTeam } from "../hooks/use-set-timeout-team";

interface TimeoutCallerEditorProps extends Omit<
  SegmentedControlProps,
  "value" | "onChange"
> {
  timeoutUri: TimeoutUri;
  teamNum: number | null;
  teamIsOfficials: boolean;
  isReview: boolean;
}

/**
 * Display a control which allows users to edit the calling team of the desired Timeout.
 */
export default function TimeoutCallerEditor({
  timeoutUri,
  teamNum,
  teamIsOfficials,
  isReview,
  data,
  ...props
}: TimeoutCallerEditorProps) {
  // Used to solve a minor UI glitch that occurs when selecting the initial value of a
  // SegmentedControl component
  const isInitialSelection = useDeferredValue(
    teamNum == null && !teamIsOfficials,
  );

  const setTeam = useSetTimeoutTeam({ ...timeoutUri });

  return (
    <TitledSegmentedControl
      label="Calling Team"
      data={[
        ...data,
        {
          value: String(NaN),
          label: "Official",
          disabled: isReview,
        },
      ]}
      value={
        teamNum == null
          ? teamIsOfficials
            ? String(NaN)
            : "" // Nothing selected
          : String(teamNum)
      }
      transitionDuration={isInitialSelection ? 0 : 200}
      onChange={(teamNum) =>
        setTeam.mutate(teamNum == String(NaN) ? null : Number(teamNum))
      }
      {...props}
    />
  );
}
