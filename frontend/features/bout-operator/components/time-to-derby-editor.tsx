import {
  ActionIcon,
  Fieldset,
  FieldsetProps,
  Group,
  TextInput,
} from "@mantine/core";
import { useMask } from "@mantine/hooks";
import { IconCheck, IconStopwatch } from "@tabler/icons-react";
import { useSetTimeToDerby } from "../hooks/use-set-time-to-derby";

interface TimeToDerbyEditorProps extends FieldsetProps {
  boutUuid: string;
}

// TODO: docs
export default function TimeToDerbyEditor({
  boutUuid,
  ...props
}: TimeToDerbyEditorProps) {
  const { ref, value } = useMask({
    mask: [/\d/, /\d/, ":", /[0-5]/, /\d/],
    slotChar: " ",
  });

  const { mutate: setTimeToDerby } = useSetTimeToDerby({ uuid: boutUuid });

  return (
    <Fieldset legend={"Set Time to Derby"} {...props}>
      <Group justify="space-between" align="center" gap="xs" wrap="nowrap">
        <TextInput
          ref={ref}
          placeholder="mm:ss"
          rightSection={<IconStopwatch size={16} />}
        />
        <ActionIcon
          size="md"
          variant="outline"
          onClick={() => setTimeToDerby(value)}
        >
          <IconCheck size={16} />
        </ActionIcon>
      </Group>
    </Fieldset>
  );
}
