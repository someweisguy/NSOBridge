import { Team } from "@/types/bout";
import { Clock } from "@/types/time";
import { Button, Menu, Modal, useModalsStack } from "@mantine/core";
import {
  IconCheckupList,
  IconPencil,
  IconRollerSkating,
  IconScoreboard,
  IconStopwatch,
  IconTrafficLights,
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
    "series",
    "ruleset",
    ...teams.map((team: Team) => "team-" + team.num),
    "bout-clock",
    "edit-jams",
    "edit-timeouts",
    "create-bout",
  ]);

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
          leftSection={<IconScoreboard size={16} />}
          onClick={() => modalStack.open("series")}
        >
          Series
        </Menu.Item>
        <Menu.Item
          disabled
          leftSection={<IconCheckupList size={16} />}
          onClick={() => modalStack.open("ruleset")}
        >
          Ruleset
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
          leftSection={<IconStopwatch size={16} />}
          onClick={() => modalStack.open("bout-clock")}
        >
          Bout Clock
        </Menu.Item>
        <Menu.Item
          disabled
          leftSection={<IconRollerSkating size={16} />}
          onClick={() => modalStack.open("edit-jams")}
        >
          Jams
        </Menu.Item>
        <Menu.Item
          disabled
          leftSection={<IconTrafficLights size={16} />}
          onClick={() => modalStack.open("edit-timeouts")}
        >
          Timeouts
        </Menu.Item>
        <Menu.Item
          disabled
          leftSection={<IconUserExclamation size={16} />}
          onClick={() => modalStack.open("edit-penalties")}
        >
          Penalties
        </Menu.Item>
      </Menu.Dropdown>

      <Modal.Stack>
        <Modal title="Select Ruleset" {...modalStack.register("ruleset")}>
          Edit ruleset...
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
        <Modal title="Edit Bout Clock" {...modalStack.register("bout-clock")}>
          <BoutClockEditor
            boutUuid={uuid}
            isRunning={clock.startTimestamp != null}
          />
        </Modal>
      </Modal.Stack>
    </Menu>
  );
}
