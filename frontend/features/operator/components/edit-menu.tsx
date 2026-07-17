import { useDeleteBout } from "@/features/bouts/hooks/use-delete-bout";
import { Team } from "@/types/bout";
import { Clock } from "@/types/time";
import { Button, Menu, Modal, useModalsStack } from "@mantine/core";
import {
  IconCheckupList,
  IconPencil,
  IconRollerSkating,
  IconStopwatch,
  IconTrafficLights,
  IconTrash,
  IconUserExclamation,
  IconUsers,
} from "@tabler/icons-react";
import BoutClockEditor from "./bout-clock-editor";
import TeamEditor from "./team-editor";

interface EditMenuProps {
  uuid: string;
  clock: Clock;
  teams: Team[];
}

export default function EditMenu({ uuid, clock, teams }: EditMenuProps) {
  const modalStack = useModalsStack([
    "bout",
    "clock",
    "officials",
    ...teams.map((team: Team) => "team-" + team.num),
    "jams",
    "timeouts",
    "penalties",
  ]);

  const deleteBout = useDeleteBout({ boutUuid: uuid });

  return (
    <Menu withArrow shadow="md" width={200}>
      <Menu.Target>
        <Button
          size="xs"
          variant="default"
          justify="space-between"
          rightSection={<IconPencil size={16} />}
        >
          Edit
        </Button>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Item
          disabled
          leftSection={<IconCheckupList size={16} />}
          onClick={() => modalStack.open("bout")}
        >
          Bout
        </Menu.Item>
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
            <Menu.Item disabled onClick={() => modalStack.open("officials")}>
              Officials
            </Menu.Item>
            {teams.map((team: Team) => (
              <Menu.Item
                key={team.num}
                onClick={() => modalStack.open("team-" + team.num)}
              >
                {team.name}
              </Menu.Item>
            ))}
          </Menu.Sub.Dropdown>
        </Menu.Sub>
        <Menu.Item
          disabled
          leftSection={<IconRollerSkating size={16} />}
          onClick={() => modalStack.open("jams")}
        >
          Jams
        </Menu.Item>
        <Menu.Item
          disabled
          leftSection={<IconTrafficLights size={16} />}
          onClick={() => modalStack.open("timeouts")}
        >
          Timeouts
        </Menu.Item>
        <Menu.Item
          disabled
          leftSection={<IconUserExclamation size={16} />}
          onClick={() => modalStack.open("penalties")}
        >
          Penalties
        </Menu.Item>
        <Menu.Item
          color="red"
          leftSection={<IconTrash size={16} />}
          onClick={() => deleteBout.mutate()}
        >
          Delete Bout
        </Menu.Item>
      </Menu.Dropdown>

      <Modal.Stack>
        <Modal title="Edit Bout Information" {...modalStack.register("bout")}>
          Edit Bout...
        </Modal>
        {teams.map((team: Team) => (
          <Modal
            key={team.num}
            title={"Edit " + team.name}
            {...modalStack.register("team-" + team.num)}
          >
            <TeamEditor boutUuid={uuid} {...team} />
          </Modal>
        ))}
        <Modal title="Edit Period Clock" {...modalStack.register("clock")}>
          <BoutClockEditor
            boutUuid={uuid}
            isRunning={clock.startTimestamp != null}
          />
        </Modal>
      </Modal.Stack>
    </Menu>
  );
}
