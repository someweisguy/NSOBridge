import { Modal, Text, TextProps } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";

interface TeamNameProps extends TextProps {
  teamName: string;
  setTeamName?: (name: string) => void;
  editable?: boolean;
}

export default function TeamName({
  teamName,
  editable = true,
  ...props
}: TeamNameProps) {
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      {editable && (
        <Modal
          title="Edit Team Name"
          opened={opened}
          onClose={close}
          centered
        ></Modal>
      )}
      <Text {...props} onClick={open}>
        {teamName}
      </Text>
    </>
  );
}
