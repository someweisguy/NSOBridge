import TripEvent from "@/components/trip-event";
import { jamAddTrip } from "@/lib/game/jams";
import { Jam, Team, TeamJam } from "@/types/game";
import { Button, Flex, SimpleGrid } from "@mantine/core";
import { useMutation } from "@tanstack/react-query";

interface TeamJamViewProps {
  jam: Jam;
  team: Team;
}

export default function TeamJamView({ jam, team }: TeamJamViewProps) {
  const teamJam: TeamJam | undefined = jam.teamJams.find(
    (teamJam: TeamJam) => teamJam.teamId === team.id,
  );
  if (teamJam == undefined) {
    throw new Error("team jam not found");
  }

  const lead = teamJam.events.some((tripEvent) => tripEvent.lead);
  const lost = teamJam.events.some((tripEvent) => tripEvent.lost);
  const starPass = teamJam.events.some((tripEvent) => tripEvent.starPass);

  return (
    <>
      <AddTripButtons jam={jam} team={team} />
      Lead: {String(lead)}, Lost: {String(lost)}, Star Pass: {String(starPass)}
      <Flex>
        {teamJam.events
          .filter((event) => event.passes != null)
          .map((teamJam, i) => (
            <TripEvent key={i} tripNum={i} {...teamJam} />
          ))}
      </Flex>
    </>
  );
}

function AddTripButtons({ jam, team }: TeamJamViewProps) {
  const teamJam: TeamJam | undefined = jam.teamJams.find(
    (teamJam: TeamJam) => teamJam.teamId === team.id,
  );
  if (teamJam == undefined) {
    throw new Error("team jam not found");
  }

  const addTrip = useMutation({
    mutationFn: (passes: number) =>
      jamAddTrip(team.boutId, jam.period, jam.num, team.id, passes),
  });

  if (teamJam.events.length == 0) {
    return (
      <SimpleGrid cols={2} spacing="md">
        <Button variant="light" onClick={() => addTrip.mutate(0)}>
          No Pass
        </Button>
        <Button variant="filled" onClick={() => addTrip.mutate(4)}>
          Initial
        </Button>
      </SimpleGrid>
    );
  }
  return (
    <SimpleGrid cols={5} spacing="md">
      {[0, 1, 2, 3, 4].map((passes: number) => (
        <Button
          variant={passes == 4 ? "filled" : "light"}
          key={passes}
          onClick={() => addTrip.mutate(passes)}
        >
          {passes}
        </Button>
      ))}
    </SimpleGrid>
  );
}
