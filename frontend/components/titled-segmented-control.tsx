import {
  SegmentedControl,
  SegmentedControlProps,
  Stack,
  Text,
} from "@mantine/core";

interface JamStopReasonControlProps extends SegmentedControlProps {
  /**
   * The title to associate with this SegmentedControl.
   */
  label?: string;
  description?: string;
}

/**
 * Display a Mantine SegmentedControl with a title.
 */
export default function TitledSegmentedControl({
  label,
  description,
  w,
  ...props
}: JamStopReasonControlProps) {
  return (
    <Stack w={w} gap="1">
      {label && (
        <Text span lh="1.4" py="2" size="sm" fw="500" w="fit-content">
          {label}
        </Text>
      )}
      {description && (
        <Text p="0" mt="0" mb="4" lh="1" size="xs" c="dimmed">
          {description}
        </Text>
      )}
      <SegmentedControl {...props} />
    </Stack>
  );
}
