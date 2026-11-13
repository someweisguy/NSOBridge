import useBoutPicker from "@/features/bout-editor/hooks/use-bout-picker";
import useSeriesPicker from "@/features/bout-editor/hooks/use-series-picker";
import BoutClock from "@/features/bout-operator/components/bout-clock";
import { useBoutClock } from "@/features/bout-operator/hooks/use-bout-clock";
import { useRuleset } from "@/hooks/use-ruleset";
import FitScreen from "@fit-screen/react";
import { Group, Loader, Stack } from "@mantine/core";
import "@mantine/core/styles.css";
import { createRoot } from "react-dom/client";
import "./global.css";
import AppProvider from "./provider";

const root: HTMLElement | null = document.getElementById("root");
if (root != null) {
  document.title = "Scoreboard";
  createRoot(root).render(
    <AppProvider>
      <Scoreboard />
    </AppProvider>,
  );
}

/**
 * Display the audience-facing scoreboard. This has at-a-glance information about the
 * state of the bout as concisely and accessibly as possible.
 */
export function Scoreboard() {
  const [activeSeries] = useSeriesPicker();
  const [activeBout] = useBoutPicker(activeSeries);

  // const {
  //   jammerLead,
  //   jammerLost,
  //   jammerStarPass,
  //   jammerInitial,
  //   timeoutType,
  // } = useTeamJamOperator(team);

  const {
    activeJam,
    isInOvertime,
    periodNum,
    jamNum,
    showJamClock,
    jamStartTimestamp,
    lastEventTimestamp,
  } = useBoutClock(activeBout);

  const { data: ruleset } = useRuleset({
    uuid: activeBout?.uuid ?? "",
    enabled: activeBout != null,
  });

  return (
    <FitScreen waitTime={25} mode="fit">
      {activeBout ? (
        <Stack>
          <Group>
            {/* {activeBout.teams.map((team: Team, i: number) => (
              <TeamScore
                key={i}
                name={team.name}
                boutScore={team.boutScore}
                scoreOffset={team.scoreOffset}
                jamScore={team.jamScore}
                timeoutsRemaining={team.timeoutsRemaining}
                reviewsRemaining={team.reviewsRemaining}
                timeout={timeoutType}
                jammerLead={jammerLead}
                jammerLost={jammerLost}
                jammerStarPass={jammerStarPass}
                jammerInitial={jammerInitial}
                numTimeouts={ruleset?.numTimeouts ?? 0}
                numReviews={ruleset?.numReviews ?? 0}
                reverse={!!(i % 2)}
              />
            ))} */}
          </Group>
          <BoutClock
            boutClock={activeBout?.clock}
            isInOvertime={isInOvertime}
            periodNum={periodNum}
            jamNum={jamNum}
            showJamClock={showJamClock}
            jamStartTimestamp={jamStartTimestamp}
            jamStopReason={activeJam?.stopReason}
            jamDuration={ruleset?.jamDuration}
            showBoutEvent={activeBout?.state != "jam"}
            boutEvent={activeBout?.subState}
            boutEventStartTimestamp={lastEventTimestamp}
            fz="10rem"
          />
        </Stack>
      ) : (
        <Loader size="lg" style={{ alignSelf: "center" }} />
      )}
    </FitScreen>
  );
}
