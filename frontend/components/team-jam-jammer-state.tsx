import { TeamJam } from "@/types/game";
import {
  Checkbox,
  createTheme,
  Divider,
  Group,
  MantineProvider,
} from "@mantine/core";

interface JammerStatusButtonsProps {
  teamJam: TeamJam;
}

const checkBoxTheme = createTheme({
  cursorType: "pointer",
});

export default function TeamJamJammerState({
  teamJam,
}: JammerStatusButtonsProps) {
  const lead = teamJam.events.some((tripEvent) => tripEvent.lead);
  const lost = teamJam.events.some((tripEvent) => tripEvent.lost);
  const starPass = teamJam.events.some((tripEvent) => tripEvent.starPass);

  return (
    <Group justify="center" gap="md">
      <MantineProvider theme={checkBoxTheme}>
        <Checkbox label="Lead" checked={lead} variant="outline" />
        <Divider orientation="vertical" />
        <Checkbox label="Lost" checked={lost} variant="outline" />
        <Divider orientation="vertical" />
        <Checkbox label="Star Pass" checked={starPass} variant="outline" />
      </MantineProvider>
    </Group>
  );
}
