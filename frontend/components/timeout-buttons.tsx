import useBout from "@/hooks/use-bout";
import {
  timeoutSetRetained,
  timeoutSetTeam,
  timeoutSetType,
} from "@/lib/game/timeouts";
import { Team, Timeout } from "@/types/game";
import { SegmentedControl, Switch, Text } from "@mantine/core";
import { useMutation } from "@tanstack/react-query";

interface TimeoutButtonsProps {
  timeout: Timeout;
  teams: Team[];
}

export default function TimeoutButtons({ timeout }: TimeoutButtonsProps) {
  const useSetType = useMutation({
    mutationFn: (type: string) =>
      timeoutSetType(timeout.id, type as "timeout" | "review"),
  });

  const useSetTeam = useMutation({
    mutationFn: (teamId: number | null) => timeoutSetTeam(timeout.id, teamId),
  });

  const useSetRetained = useMutation({
    mutationFn: (isRetained: boolean) =>
      timeoutSetRetained(timeout.id, isRetained),
  });

  const bout = useBout(timeout.boutId);

  // TODO: cleanup segmented control for team selection

  return (
    <>
      <div>
        <Text size="sm" fw={500} mb={3}>
          Timeout Type
        </Text>
        <SegmentedControl
          data={[
            { value: "timeout", label: "Timeout" },
            { value: "review", label: "Official Review" },
          ]}
          value={timeout.isReview ? "review" : "timeout"}
          onChange={(type) => useSetType.mutate(type)}
        />
      </div>
      <div>
        <Text size="sm" fw={500} mb={3}>
          Calling Team
        </Text>
        <SegmentedControl
          data={[
            { value: String(bout.teams[0].id), label: "Home" },
            { value: String(bout.teams[1].id), label: "Away" },
            {
              value: String(NaN),
              label: "Official",
              disabled: timeout.isReview,
            },
          ]}
          value={timeout.teamId == null ? "" : String(timeout.teamId)}
          onChange={(teamId) =>
            useSetTeam.mutate(teamId == String(NaN) ? null : Number(teamId))
          }
        />
      </div>
      <Switch
        disabled={!timeout.isReview}
        checked={timeout.retained}
        withThumbIndicator={false}
        onClick={() => useSetRetained.mutate(!timeout.retained)}
        label="Retained"
      />
    </>
  );
}
