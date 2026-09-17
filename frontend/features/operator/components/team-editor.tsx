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

  const useTeamName = useSetTeamName({ boutUuid, teamNum: num, onSuccess });

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
        <NumberInput
          label="Timeouts Remaining"
          value={timeoutsRemaining}
          onChange={(num) => setTeamTimeoutsRemaining.mutate(Number(num))}
        />
        <NumberInput
          label="Reviews Remaining"
          value={reviewsRemaining}
          onChange={(num) => setTeamReviewsRemaining.mutate(Number(num))}
        />
      </Group>

      <Group justify="flex-end">
        <Button onClick={() => useTeamName.mutate(teamName)}>Apply</Button>
      </Group>
    </Stack>
  );
}
