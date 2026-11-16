import {
  ActionIcon,
  Fieldset,
  FieldsetProps,
  Group,
  px,
  TextInput,
  Tooltip,
} from "@mantine/core";
import { useMask } from "@mantine/hooks";
import { IconCheck, IconStopwatch } from "@tabler/icons-react";
import { useSetTimeToDerby } from "../hooks/use-set-time-to-derby";

interface TimeToDerbyEditorProps extends FieldsetProps {
  boutUuid: string;
  iconSize?: string | number;
}

// TODO: docs
export default function TimeToDerbyEditor({
  boutUuid,
  iconSize = 16,
  ...props
}: TimeToDerbyEditorProps) {
  const { ref, value, isComplete, reset } = useMask({
    mask: [/\d/, /\d/, ":", /[0-5]/, /\d/],
    slotChar: " ",
  });

  const { mutate: setTimeToDerby } = useSetTimeToDerby({
    uuid: boutUuid,
    onSuccess: reset,
  });

  return (
    <Fieldset legend={"Set Time to Derby"} {...props}>
      <Group justify="space-between" align="center" gap="xs" wrap="nowrap">
        <TextInput
          ref={ref}
          placeholder="mm:ss"
          rightSection={<IconStopwatch size={16} />}
        />
        <Tooltip disabled={isComplete} label="Input a time to derby value.">
          <ActionIcon
            size="md"
            variant="outline"
            onClick={() => {
              const now = new Date();
              const [minutes, seconds] = value
                .replace(/ /g, "0")
                .split(":")
                .map((val: string) => Number(val));
              now.setMinutes(now.getMinutes() + minutes);
              now.setSeconds(now.getSeconds() + seconds);
              // TODO: ensure time is synchronized with server

              setTimeToDerby(now.toISOString());
            }}
            disabled={!isComplete}
          >
            <IconCheck size={px(iconSize)} />
          </ActionIcon>
        </Tooltip>
      </Group>
    </Fieldset>
  );
}
