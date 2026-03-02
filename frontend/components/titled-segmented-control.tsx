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
  title: string;
}

/**
 * Display a Mantine SegmentedControl with a title.
 */
export default function TitledSegmentedControl({
  title,
  ...props
}: JamStopReasonControlProps) {
  return (
    <Stack gap="0">
      <Text size="sm" fw="300">
        {title}
      </Text>
      <SegmentedControl {...props} />
    </Stack>
  );
}
