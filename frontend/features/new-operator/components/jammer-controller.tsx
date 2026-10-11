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
import { useUpdateLead } from "../hooks/use-update-lead";
import { useUpdateLost } from "../hooks/use-update-lost";
import { useUpdateStarPass } from "../hooks/use-update-star-pass";

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
  const { mutate: setLead } = useUpdateLead({ team });
  const { mutate: setLost } = useUpdateLost({ team });
  const { mutate: setStarPass } = useUpdateStarPass({ team });

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
