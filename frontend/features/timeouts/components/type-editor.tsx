import {
  SegmentedControl,
  SegmentedControlProps,
  Stack,
  Text,
} from "@mantine/core";

export default function TimeoutTypeEditor({
  ...props
}: Omit<SegmentedControlProps, "data" | "value" | "onChange">) {
  return (
    <Stack gap="0">
      <Text size="sm" fw="300">
        Timeout Type
      </Text>
      <SegmentedControl
        data={[
          { value: "timeout", label: "Timeout" },
          { value: "review", label: "Official Review" },
        ]}
        // value={timeout.isReview ? "review" : "timeout"} // TODO
        onChange={
          (type: string) => console.log(type) // FIXME
        }
        {...props}
      />
    </Stack>
  );
}
