import TitledSegmentedControl from "@/components/titled-segmented-control";
import { useSuspenseTimeout } from "@/hooks/use-suspense-timeout";
import { TimeoutUri } from "@/types/query";
import { SegmentedControlProps } from "@mantine/core";
import { useDeferredValue } from "react";
import { useSetTimeoutTeam } from "../hooks/use-set-timeout-team";

/**
 * Display a control which allows users to edit the calling team of the desired Timeout.
 */
export default function TimeoutCallerEditorContainer({
  boutUuid,
  timeoutNum,
  data,
  ...props
}: TimeoutUri & Omit<SegmentedControlProps, "value" | "onChange">) {
  const { data: timeout } = useSuspenseTimeout({ boutUuid, timeoutNum });

  // Used to solve a minor UI glitch that occurs when selecting the initial value of a
  // SegmentedControl component
  const isInitialSelection = useDeferredValue(
    timeout.teamNum == null && !timeout.teamIsOfficials,
  );

  const setTeam = useSetTimeoutTeam({ boutUuid, timeoutNum });

  return (
    <TitledSegmentedControl
      label="Calling Team"
      data={[
        ...data,
        {
          value: String(NaN),
          label: "Official",
          disabled: timeout.isReview,
        },
      ]}
      value={
        timeout.teamNum == null
          ? timeout.teamIsOfficials
            ? String(NaN)
            : "" // Nothing selected
          : String(timeout.teamNum)
      }
      transitionDuration={isInitialSelection ? 0 : 200}
      onChange={(teamNum) =>
        setTeam.mutate(teamNum == String(NaN) ? null : Number(teamNum))
      }
      {...props}
    />
  );
}
