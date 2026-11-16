import { Fieldset, FieldsetProps, Stack } from "@mantine/core";

interface TimeToDerbyEditorProps extends FieldsetProps {
  derbyStartTimestamp: string | null;
}

// TODO: docs
export default function TimeToDerbyEditor({
  ...props
}: TimeToDerbyEditorProps) {
  return (
    <Fieldset legend={"Set Time to Derby"} {...props}>
      <Stack align="flex-state"></Stack>
    </Fieldset>
  );
}
