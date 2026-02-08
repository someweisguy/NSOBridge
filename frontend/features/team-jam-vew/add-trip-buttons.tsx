import { useAddTrip } from "@/hooks/use-jam";
import { useSuspenseRuleset } from "@/hooks/use-ruleset";
import { Team } from "@/lib/game/bouts";
import { Jam, TeamJam } from "@/lib/game/jams";
import { BoutContext } from "@/utils/contexts";
import { Button, Group, Stack } from "@mantine/core";
import { useContext } from "react";

interface AddTripButtonsProps {
  jam: Jam;
  team: Team;
}

export default function AddTripButtons({ jam, team }: AddTripButtonsProps) {
  const teamJam: TeamJam | undefined = jam.teamJams.find(
    (teamJam: TeamJam) => teamJam.teamNum === team.num,
  );
  if (teamJam == undefined) {
    throw new Error("team jam not found");
  }
  const bout = useContext(BoutContext);
  if (bout == null) {
    throw new Error("AddTripButtons must be inside a Bout context");
  }
  const { data: ruleset } = useSuspenseRuleset(bout);
  const addTrip = useAddTrip(jam, teamJam);

  const addTripButtons =
    teamJam.events.length == 0 ? (
      <>
        <Button variant="light" onClick={() => addTrip.mutate(0)}>
          No Pass
        </Button>
        <Button variant="filled" onClick={() => addTrip.mutate(4)}>
          Initial
        </Button>
      </>
    ) : (
      <>
        {Array.from({ length: ruleset.pointsPerTrip + 1 }, (_, i) => (
          <Button
            key={i}
            variant={i == ruleset.pointsPerTrip ? "filled" : "light"}
            onClick={() => addTrip.mutate(i)}
          >
            {i}
          </Button>
        ))}
      </>
    );

  return (
    <Stack justify="center" align="center">
      <Group justify="center" gap="md">
        {addTripButtons}
      </Group>
    </Stack>
  );
}
