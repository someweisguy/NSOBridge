import { Button, Modal } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";

export default function CreateBoutButton() {
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      <Modal title="Create Bout" opened={opened} onClose={close} centered>
        {/* // TODO: add Bout creation components */}
      </Modal>
      <Button onClick={open}>Create New Bout</Button>
    </>
  );
}
