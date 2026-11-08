import { useDefaultRulesets } from "@/hooks/use-default-rulesets";
import { Bout } from "@/types/bout";
import { Ruleset } from "@/types/ruleset";
import { ActionIcon, Modal, px, Tooltip } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconPlus } from "@tabler/icons-react";
import BoutCreatorForm from "./bout-creator-form";

const iconSize = 16;

export interface BoutCreatorButtonProps {
  activeSeriesUuid: string | undefined;
  onSuccess?: (boutUuid: string) => void;
}

// TODO: docs
export default function BoutCreatorButton({
  activeSeriesUuid,
  onSuccess,
}: BoutCreatorButtonProps) {
  const [opened, { open, close }] = useDisclosure(false);

  const { data: defaultRulesets } =
    useDefaultRulesets<Record<string, Ruleset>[]>();

  return (
    <>
      <Tooltip withArrow fz="xs" label="Create a Bout">
        <ActionIcon variant="light" onClick={open}>
          <IconPlus size={px(iconSize)} />
        </ActionIcon>
      </Tooltip>
      <Modal title="Create New Bout" opened={opened} onClose={close}>
        <BoutCreatorForm
          seriesUuid={activeSeriesUuid}
          rulesetNames={Object.keys(defaultRulesets ?? {})}
          onSuccess={(bout: Bout) => {
            close();
            onSuccess?.(bout.uuid);
          }}
        />
      </Modal>
    </>
  );
}
