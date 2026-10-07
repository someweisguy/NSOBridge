import { Button, Group, NumberInput, Stack, TextInput } from "@mantine/core";
import { useState } from "react";

interface TeamEditorProps {
  boutUuid: string;
  uuid: string;
  name: string;
  timeoutsRemaining: number;
  reviewsRemaining: number;
  onSuccess?: (data: unknown, newTeamName: string) => void;
}

export default function TeamEditor({
  name,
  timeoutsRemaining,
  reviewsRemaining,
  // onSuccess,
}: TeamEditorProps) {
  const [teamName, setTeamName] = useState(name);
  // const setTeamNameHook = useSetTeamName({ boutUuid, teamNum: num, onSuccess });

  // const setTeamTimeoutsRemaining = useSetTeamTimeoutsRemaining({
  //   boutUuid,
  //   teamNum: num,
  // });
  // const setTeamReviewsRemaining = useSetTeamReviewsRemaining({
  //   boutUuid,
  //   teamNum: num,
  // });

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
          // onChange={(num) => setTeamTimeoutsRemaining.mutate(Number(num))}  // FIXME
          min={0}
          // max={ruleset.numTimeouts}  // FIXME
        />
        <NumberInput
          label="Reviews Remaining"
          value={reviewsRemaining}
          // onChange={(num) => setTeamReviewsRemaining.mutate(Number(num))}  // FIXME
          min={0}
          // max={ruleset.numReviews}  // FIXME
        />
      </Group>

      <Group justify="flex-end">
        <Button
        // onClick={() => setTeamNameHook.mutate(teamName)}  // FIXME
        >
          Apply
        </Button>
      </Group>
    </Stack>
  );
}
