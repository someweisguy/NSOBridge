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
import { IconCheck, IconStopwatch, IconTrash } from "@tabler/icons-react";
import { useUpdateBout } from "../hooks/use-update-bout";

interface TimeToDerbyEditorProps extends FieldsetProps {
  boutUuid: string;
  showClearButton: boolean;
  defaultValue?: string;
  iconSize?: string | number;
}

// TODO: docs
export default function TimeToDerbyEditor({
  boutUuid,
  showClearButton,
  defaultValue = "",
  iconSize = 16,
  ...props
}: TimeToDerbyEditorProps) {
  const { ref, value, isComplete, reset } = useMask({
    mask: [/\d/, /\d/, ":", /[0-5]/, /\d/],
    slotChar: " ",
  });

  const { mutate: updateBout } = useUpdateBout({
    uuid: boutUuid,
    onSuccess: reset,
  });

  return (
    <Fieldset legend={"Set Time to Derby"} {...props}>
      <form onSubmit={(event) => event.preventDefault()}>
        <Group justify="space-between" align="center" gap="xs" wrap="nowrap">
          <TextInput
            ref={ref}
            placeholder="mm:ss"
            defaultValue={defaultValue}
            rightSection={<IconStopwatch size={px(iconSize)} />}
          />
          <Tooltip
            label={
              showClearButton
                ? "Reset the time to derby."
                : "Input a time to derby value."
            }
          >
            <ActionIcon
              size="md"
              variant="outline"
              type="submit"
              onClick={() => {
                let timeToDerbyTimestamp: string | null = null;
                if (isComplete || !showClearButton) {
                  const now = new Date();
                  const [minutes, seconds] = value
                    .replace(/ /g, "0")
                    .split(":")
                    .map((val: string) => Number(val));
                  now.setMinutes(now.getMinutes() + minutes);
                  now.setSeconds(now.getSeconds() + seconds);
                  timeToDerbyTimestamp = now.toISOString();
                  // TODO: ensure time is synchronized with server
                }
                updateBout({ timeToDerbyTimestamp });
              }}
              disabled={!isComplete && !showClearButton}
            >
              {isComplete || !showClearButton ? (
                <IconCheck size={px(iconSize)} />
              ) : (
                <IconTrash size={px(iconSize)} />
              )}
            </ActionIcon>
          </Tooltip>
        </Group>
      </form>
    </Fieldset>
  );
}
