import useBout from "@/hooks/use-bout";
import { useSetRetained, useSetTeam, useSetType } from "@/hooks/use-timeout";
import { Team } from "@/lib/game/bouts";
import { Timeout } from "@/lib/game/timeouts";
import { SegmentedControl, Switch, Text } from "@mantine/core";

interface TimeoutButtonsProps {
  timeout: Timeout;
  teams: Team[];
}

export default function TimeoutButtons({ timeout }: TimeoutButtonsProps) {
  const setType = useSetType(timeout);
  const setTeam = useSetTeam(timeout);
  const setRetained = useSetRetained(timeout);

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
          onChange={(type: string) =>
            setType.mutate(type as "timeout" | "review")
          }
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
            setTeam.mutate(teamId == String(NaN) ? null : Number(teamId))
          }
        />
      </div>
      <Switch
        disabled={!timeout.isReview}
        checked={timeout.retained}
        withThumbIndicator={false}
        onClick={() => setRetained.mutate(!timeout.retained)}
        label="Retained"
      />
    </>
  );
}
