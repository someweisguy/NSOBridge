import { Team } from "@/lib/game/bouts";
import { Timeout } from "@/lib/game/timeouts";
import { SegmentedControl, Switch, Text } from "@mantine/core";
import { useSetRetained } from "../timeouts/hooks/set-retained";
import { useSetTeam } from "../timeouts/hooks/set-team";
import { useSetType } from "../timeouts/hooks/set-type";

interface TimeoutButtonsProps {
  timeout: Timeout;
  teams: Team[];
}

export default function TimeoutButtons({
  timeout,
  teams,
}: TimeoutButtonsProps) {
  const setType = useSetType(timeout);
  const setTeam = useSetTeam(timeout);
  const setRetained = useSetRetained(timeout);

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
            // TODO: labels should display Roster name/mnemonic
            { value: String(teams[0].num), label: "Home" },
            { value: String(teams[1].num), label: "Away" },
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
                : ""
              : String(timeout.teamNum)
          }
          onChange={(teamNum) =>
            setTeam.mutate(teamNum == String(NaN) ? null : Number(teamNum))
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
