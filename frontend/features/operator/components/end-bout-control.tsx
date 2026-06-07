import { Button, Fieldset, FieldsetProps } from "@mantine/core";
import { IconCancel } from "@tabler/icons-react";
import { useFinalizeBout } from "../hooks/use-finalize-bout";

interface EndBoutControlProps extends FieldsetProps {
  boutUuid: string;
}

export default function EndBoutControl({
  boutUuid,
  ...props
}: EndBoutControlProps) {
  const finalizeBout = useFinalizeBout({ boutUuid });

  return (
    <Fieldset legend="End Bout" {...props}>
      <Button
        autoContrast
        size="xs"
        w="100%"
        variant="filled"
        justify="space-between"
        color="red.9"
        onClick={() => finalizeBout.mutate()}
        rightSection={<IconCancel size={16} />}
      >
        Finalize Bout
      </Button>
    </Fieldset>
  );
}
