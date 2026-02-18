import { Bout, Team } from "@/lib/game/bouts";
import { Timeout } from "@/lib/game/timeouts";
import { BoutContext, TimeoutContext } from "@/utils/contexts";
import {
  SegmentedControl,
  SegmentedControlProps,
  Stack,
  Text,
} from "@mantine/core";
import { useContext, useDeferredValue } from "react";
import { useSetTeam } from "../hooks/set-team";

export default function TimeoutCallingTeamEditor({
  ...props
}: Omit<SegmentedControlProps, "data" | "value" | "onChange">) {
  const bout: Bout | null = useContext(BoutContext);
  const timeout: Timeout | null = useContext(TimeoutContext);
  if (bout == null || timeout == null) {
    throw new Error(
      "TimeoutCallingTeamEditor must be used within a TimeoutProvider",
    );
  }

  // Used to solve a minor UI glitch that occurs when selecting the initial value of a
  // SegmentedControl component
  const isInitialSelection = useDeferredValue(
    timeout.teamNum == null && !timeout.teamIsOfficials,
  );

  const setTeam = useSetTeam(timeout);

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
