import { useSuspenseTimeout } from "@/hooks/use-suspense-timeout";
import { Bout, Team } from "@/lib/game/bouts";
import {
  SegmentedControl,
  SegmentedControlProps,
  Stack,
  Text,
} from "@mantine/core";
import { useDeferredValue } from "react";
import { useSetTimeoutTeam } from "../hooks/use-set-timeout-team";

interface TimeoutCallerEditorContainerProps extends Omit<
  SegmentedControlProps,
  "data" | "value" | "onChange"
> {
  bout: Bout;
  timeoutNum: number;
}

export default function TimeoutCallerEditorContainer({
  bout,
  timeoutNum,
  ...props
}: TimeoutCallerEditorContainerProps) {
  const { data: timeout } = useSuspenseTimeout(bout.uuid, timeoutNum);

  // Used to solve a minor UI glitch that occurs when selecting the initial value of a
  // SegmentedControl component
  const isInitialSelection = useDeferredValue(
    timeout.teamNum == null && !timeout.teamIsOfficials,
  );

  const setTeam = useSetTimeoutTeam(timeout);

  return (
    <Stack gap="0">
      <Text size="sm" fw="300">
        Calling Team
      </Text>
      <SegmentedControl
        data={[
          ...bout.teams.map((team: Team) => {
            return {
              value: String(team.num),
              label: team.name,
            };
          }),
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
    </Stack>
  );
}
