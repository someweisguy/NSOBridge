import useSuspenseActiveJam from "@/hooks/game/use-active-jam";
import { useBout } from "@/hooks/game/use-bout";
import useLatestTimeout from "@/hooks/game/use-latest-timeout";
import { useSuspenseGetRuleset } from "@/hooks/game/use-ruleset";
import { Bout, Team } from "@/types/bout";
import {
  Collapse,
  ComboboxData,
  Divider,
  Stack,
  StackProps,
} from "@mantine/core";
import BoutClock from "./bout-clock";
import BoutPhaseController from "./bout-phase-controller";
import JamStopReasonEditor from "./stop-reason-editor";
import TimeoutEditor from "./timeout-editor";

export interface BoutOperatorProps extends StackProps {
  bout: Bout;
}

export default function BoutOperator({ bout, ...props }: BoutOperatorProps) {
  // TODO: get ruleset by Bout UUID, add ruleset as Table in database
  const { data: ruleset } = useSuspenseGetRuleset({
    rulesetName: bout.rulesetName,
  });

  const { data: activeJam } = useSuspenseActiveJam(bout);
  const { data: latestTimeout } = useLatestTimeout(bout);
  const { data: teams } = useBout<ComboboxData<string>>({
    uuid: bout.uuid,
    select: (bout: Bout) =>
      bout.teams.map((team: Team) => ({
        value: team.uuid,
        label: team.name,
      })),
  });

  const showJamStopReasonEditor = activeJam.stopTimestamp != null;
  const showTimeoutEditor = bout.state == "timeout" && latestTimeout != null;

  return (
    <Stack mb="lg" w={225} {...props}>
      <Stack gap="0" w="100%">
        <BoutClock
          bout={bout}
          boutClock={bout.clock}
          boutState={bout.state}
          boutSubState={bout.subState}
          jamDuration={ruleset.jamDuration}
        />
        <Divider />
      </Stack>
      <Stack justify="start" align="stretch" px="xs">
        <BoutPhaseController
          boutUuid={bout.uuid}
          boutState={bout.state}
          showFinalizeBout={false} // TODO: figure out business logic for this
          p="xs"
        />
        <Collapse expanded={showJamStopReasonEditor}>
          <JamStopReasonEditor
            uuid={activeJam.uuid}
            stopReason={activeJam.stopReason}
            p="xs"
          />
        </Collapse>
        <Collapse expanded={showTimeoutEditor}>
          <TimeoutEditor
            timeoutUuid={latestTimeout?.uuid}
            isReview={latestTimeout?.isReview}
            teamIsOfficials={latestTimeout?.teamIsOfficials}
            teamUuid={latestTimeout?.teamUuid}
            retained={latestTimeout?.retained}
            teams={teams}
            p="xs"
          />
        </Collapse>
      </Stack>
    </Stack>
  );
}
