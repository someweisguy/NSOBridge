import ClockEditor from "@/features/bout-editor/components/clock-editor";
import TeamEditor from "@/features/bout-editor/components/team-editor";
import { useDeleteBout } from "@/features/bout-editor/hooks/use-delete-bout";
import { useGetRuleset } from "@/hooks/game/use-ruleset";
import { Bout, Team } from "@/types/bout";
import { Button, Menu, Modal, useModalsStack } from "@mantine/core";
import {
  IconPencil,
  IconStopwatch,
  IconTrash,
  IconUsers,
} from "@tabler/icons-react";

interface EditMenuProps {
  bout: Bout | undefined;
}

export default function BoutEditor({ bout }: EditMenuProps) {
  // TODO: get ruleset by Bout UUID, add ruleset as Table in database
  const { data: ruleset } = useGetRuleset({
    rulesetName: bout?.rulesetName ?? "",
    enabled: bout?.rulesetName != null,
  });

  const modalStack = useModalsStack([
    "bout",
    "clock",
    "officials",
    "jams",
    "timeouts",
    "penalties",
    ...(bout?.teams.map((team: Team) => `team-${team.uuid}`) ?? []),
  ]);

  const deleteBout = useDeleteBout({ boutUuid: bout?.uuid ?? "" });

  return (
    <Menu
      withArrow
      shadow="md"
      width={200}
      disabled={bout == null || ruleset == null}
    >
      <Menu.Target>
        <Button
          disabled={bout == null}
          size="xs"
          variant="default"
          justify="space-between"
          rightSection={<IconPencil size={16} />}
        >
          Edit
        </Button>
      </Menu.Target>

      <Menu.Dropdown>
        {/*  // TODO: Implement editing Bouts 
        <Menu.Item
          disabled
          leftSection={<IconCheckupList size={16} />}
          onClick={() => modalStack.open("bout")}
        >
          Bout
        </Menu.Item> */}
        <Menu.Item
          leftSection={<IconStopwatch size={16} />}
          onClick={() => modalStack.open("clock")}
        >
          Period Clock
        </Menu.Item>
        <Menu.Sub openDelay={120} closeDelay={150}>
          <Menu.Sub.Target>
            <Menu.Sub.Item leftSection={<IconUsers size={16} />}>
              Teams
            </Menu.Sub.Item>
          </Menu.Sub.Target>
          <Menu.Sub.Dropdown>
            {/*  // TODO: Implement editing Officials
            <Menu.Item disabled onClick={() => modalStack.open("officials")}>
              Officials
            </Menu.Item> */}
            {bout?.teams.map((team: Team) => (
              <Menu.Item
                key={team.uuid}
                onClick={() => modalStack.open("team-" + team.uuid)}
              >
                {team.name}
              </Menu.Item>
            ))}
          </Menu.Sub.Dropdown>
        </Menu.Sub>
        {/* // TODO: Implement editing Jams
        <Menu.Item
          disabled
          leftSection={<IconRollerSkating size={16} />}
          onClick={() => modalStack.open("jams")}
        >
          Jams
        </Menu.Item> */}
        {/* // TODO: Implement editing Timeouts
        <Menu.Item
          disabled
          leftSection={<IconTrafficLights size={16} />}
          onClick={() => modalStack.open("timeouts")}
        >
          Timeouts
        </Menu.Item> */}
        {/* // TODO: Implement editing Penalties
        <Menu.Item
          disabled
          leftSection={<IconUserExclamation size={16} />}
          onClick={() => modalStack.open("penalties")}
        >
          Penalties
        </Menu.Item> */}
        <Menu.Item
          color="red"
          leftSection={<IconTrash size={16} />}
          onClick={() => deleteBout.mutate()}
        >
          Delete Bout
        </Menu.Item>
      </Menu.Dropdown>

      <Modal.Stack>
        {bout?.teams.map((team: Team) => (
          <Modal
            key={team.uuid}
            title={"Edit " + team.name}
            {...modalStack.register(`team-${team.uuid}`)}
          >
            <TeamEditor
              uuid={team.uuid}
              name={team.name}
              timeoutsRemaining={team.timeoutsRemaining}
              reviewsRemaining={team.reviewsRemaining}
              numTimeouts={ruleset?.numTimeouts ?? 0}
              numReviews={ruleset?.numTimeouts ?? 0}
            />
          </Modal>
        ))}
        {bout && (
          <Modal title="Edit Period Clock" {...modalStack.register("clock")}>
            <ClockEditor uuid={bout.uuid} clock={bout.clock} />
          </Modal>
        )}
      </Modal.Stack>
    </Menu>
  );
}
