import { Button, Fieldset, FieldsetProps } from "@mantine/core";
import { IconCancel } from "@tabler/icons-react";

export default function EndBoutControl({ ...props }: FieldsetProps) {
  return (
    <Fieldset legend="End Bout" {...props}>
      <Button
        autoContrast
        size="xs"
        w="100%"
        variant="filled"
        justify="space-between"
        color="red.9"
        rightSection={<IconCancel size={16} />}
      >
        Finalize Bout
      </Button>
    </Fieldset>
  );
}
