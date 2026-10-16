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
  teamUuid: string;
  jammerState: "lead" | "lost" | "starPass" | null;
  leadIsDeclared: boolean;
  disabled: boolean;
}

export default function JammerController({
  teamUuid,
  jammerState,
  leadIsDeclared,
  disabled,
  ...props
}: JammerControllerProps) {
  const { mutate: setLead } = useSetLead({ teamUuid });
  const { mutate: setLost } = useSetLost({ teamUuid });
  const { mutate: setStarPass } = useSetStarPass({ teamUuid });

  const lead = jammerState == "lead";
  const lost = jammerState == "lost";
  const starPass = jammerState == "starPass";

  return (
    <Fieldset variant="unstyled" disabled={disabled}>
      <MantineProvider theme={checkBoxTheme}>
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
      </MantineProvider>
    </Fieldset>
  );
}
