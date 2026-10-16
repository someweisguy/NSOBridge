import { useGetAllRulesets } from "@/hooks/game/use-ruleset";
import { Bout } from "@/types/bout";
import { Ruleset } from "@/types/ruleset";
import { Series } from "@/types/series";
import { ActionIcon, Modal, px, Tooltip } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconPlus } from "@tabler/icons-react";
import BoutCreatorForm from "./bout-creator-form";

const iconSize = 16;

export interface BoutCreatorProps {
  activeSeries: Series | undefined;
  onSuccess?: (bout: Bout) => void;
}

// TODO: docs
export default function BoutCreator({ activeSeries }: BoutCreatorProps) {
  const [opened, { open, close }] = useDisclosure(false);

  const { data: rulesetNames } = useGetAllRulesets<string[]>({
    select: (rulesets: Ruleset[]) => rulesets.map((ruleset) => ruleset.name),
  });

  return (
    <>
      <Tooltip withArrow fz="xs" label="Create a Bout">
        <ActionIcon variant="light" onClick={open}>
          <IconPlus size={px(iconSize)} />
        </ActionIcon>
      </Tooltip>
      <Modal title="Create New Bout" opened={opened} onClose={close}>
        <BoutCreatorForm
          seriesUuid={activeSeries?.uuid}
          rulesetNames={rulesetNames}
          onSuccess={close}
        />
      </Modal>
    </>
  );
}
