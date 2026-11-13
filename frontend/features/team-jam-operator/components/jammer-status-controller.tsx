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

interface JammerStatusControllerProps extends GroupProps {
  teamUuid: string;
  jammerLead: boolean;
  jammerLost: boolean;
  jammerStarPass: boolean;
  leadIsDeclared: boolean;
  disabled: boolean;
}

// TODO: docs
export default function JammerStatusController({
  teamUuid,
  jammerLead,
  jammerLost,
  jammerStarPass,
  leadIsDeclared,
  disabled,
  ...props
}: JammerStatusControllerProps) {
  const { mutate: setLead } = useSetLead({ teamUuid });
  const { mutate: setLost } = useSetLost({ teamUuid });
  const { mutate: setStarPass } = useSetStarPass({ teamUuid });

  return (
    <Fieldset variant="unstyled" disabled={disabled}>
      <MantineProvider theme={checkBoxTheme}>
        <Group justify="center" gap="md" {...props}>
          <Checkbox
            label="Lead"
            checked={jammerLead}
            disabled={leadIsDeclared && !jammerLead}
            onClick={() => setLead(!jammerLead)}
            variant="outline"
            icon={({ ...others }) => <IconStarFilled {...others} />}
          />
          <Divider orientation="vertical" />
          <Checkbox
            label="Lost"
            checked={jammerLost}
            onClick={() => setLost(!jammerLost)}
            variant="outline"
          />
          <Divider orientation="vertical" />
          <Checkbox
            label="Star Pass"
            checked={jammerStarPass}
            onClick={() => setStarPass(!jammerStarPass)}
            variant="outline"
          />
        </Group>
      </MantineProvider>
    </Fieldset>
  );
}
