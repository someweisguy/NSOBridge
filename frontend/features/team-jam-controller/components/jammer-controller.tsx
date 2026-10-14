import { Team } from "@/types/bout";
import { Jam } from "@/types/jam";
import {
  Checkbox,
  createTheme,
  Divider,
  Fieldset,
  Group,
  GroupProps,
  MantineProvider,
} from "@mantine/core";
import { IconStarFilled } from "@tabler/icons-react";
import { useSetLead } from "../hooks/use-set-lead";
import { useSetLost } from "../hooks/use-set-lost";
import { useSetStarPass } from "../hooks/use-set-star-pass";

const checkBoxTheme = createTheme({
  cursorType: "pointer", // Hovering over checkbox should change cursor
});

interface JammerControllerProps extends GroupProps {
  jam: Jam;
  team: Team;
}

export default function JammerController({
  jam,
  team,
  ...props
}: JammerControllerProps) {
  const { mutate: setLead } = useSetLead({ team });
  const { mutate: setLost } = useSetLost({ team });
  const { mutate: setStarPass } = useSetStarPass({ team });

  const leadIsDeclared = jam.teamJams.some((teamJam) =>
    teamJam.events.some((event) => event.lead),
  );

  const teamJam = jam.teamJams.find((teamJam) => teamJam.teamUuid == team.uuid);
  const disabled = teamJam == null;
  const lead = teamJam?.events.some((event) => event.lead) ?? false;
  const lost = teamJam?.events.some((event) => event.lost) ?? false;
  const starPass = teamJam?.events.some((event) => event.starPass) ?? false;

  return (
    <MantineProvider theme={checkBoxTheme}>
      <Fieldset variant="unstyled" disabled={disabled}>
        <Group justify="center" gap="md" {...props}>
          <Checkbox
            label="Lead"
            checked={lead}
            disabled={leadIsDeclared && !lead}
            onClick={() => setLead(!lead)}
            variant="outline"
            icon={({ ...others }) => <IconStarFilled {...others} />}
          />
          <Divider orientation="vertical" />
          <Checkbox
            label="Lost"
            checked={lost}
            onClick={() => setLost(!lost)}
            variant="outline"
          />
          <Divider orientation="vertical" />
          <Checkbox
            label="Star Pass"
            checked={starPass}
            onClick={() => setStarPass(!starPass)}
            variant="outline"
          />
        </Group>
      </Fieldset>
    </MantineProvider>
  );
}
