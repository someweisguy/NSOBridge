import { useSuspenseBout } from "@/features/bouts/hooks/use-bout";
import { useSuspenseGetRuleset } from "@/hooks/use-ruleset";
import { Button, Group, NumberInput, Stack, TextInput } from "@mantine/core";
import { useState } from "react";
import { useSetTeamReviewsRemaining } from "../hooks/use-set-num-reviews";
import { useSetTeamTimeoutsRemaining } from "../hooks/use-set-num-timeouts";
import { useSetTeamName } from "../hooks/use-set-team-name";

interface TeamEditorProps {
  boutUuid: string;
  num: number;
  name: string;
  timeoutsRemaining: number;
  reviewsRemaining: number;
  onSuccess?: (data: unknown, newTeamName: string) => void;
}

export default function TeamEditor({
  boutUuid,
  num,
  name,
  timeoutsRemaining,
  reviewsRemaining,
  onSuccess,
}: TeamEditorProps) {
  const [teamName, setTeamName] = useState(name);
  const setTeamNameHook = useSetTeamName({ boutUuid, teamNum: num, onSuccess });

  const { data: bout } = useSuspenseBout({ boutUuid });
  const { data: ruleset } = useSuspenseGetRuleset({
    rulesetName: bout.rulesetName,
  });

  const setTeamTimeoutsRemaining = useSetTeamTimeoutsRemaining({
    boutUuid,
    teamNum: num,
  });
  const setTeamReviewsRemaining = useSetTeamReviewsRemaining({
    boutUuid,
    teamNum: num,
  });

  return (
    <Stack gap="md">
      <TextInput
        label="Team Name"
        value={teamName}
        onChange={(event) => setTeamName(event.currentTarget.value)}
      />
      <Group>
        {/* TODO: Prevent network requests when the min/max is reached */}
        <NumberInput
          label="Timeouts Remaining"
          value={timeoutsRemaining}
          onChange={(num) => setTeamTimeoutsRemaining.mutate(Number(num))}
          min={0}
          max={ruleset.numTimeouts}
        />
        <NumberInput
          label="Reviews Remaining"
          value={reviewsRemaining}
          onChange={(num) => setTeamReviewsRemaining.mutate(Number(num))}
          min={0}
          max={ruleset.numReviews}
        />
      </Group>

      <Group justify="flex-end">
        <Button onClick={() => setTeamNameHook.mutate(teamName)}>Apply</Button>
      </Group>
    </Stack>
  );
}
