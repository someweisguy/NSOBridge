import BoutControlButtons from "@/components/bout-control-buttons";
import {
  useActiveJamIndex,
  useActiveTimeoutIndex,
  useBout,
  useLatestJamIndex,
  useLatestTimeoutIndex,
  usePrefetchBoutData,
} from "@/hooks/use-bout";
import { useJam } from "@/hooks/use-jam";
import { useSeries } from "@/hooks/use-series";
import { useTimeout } from "@/hooks/use-timeout";
import queryClient from "@/lib/cache";
import { redo, undo } from "@/lib/history";
import { MantineProvider, Stack, Text } from "@mantine/core";
import "@mantine/core/styles.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import "./global.css";

document.addEventListener("keydown", (event) => {
  if (event.ctrlKey) {
    if (event.key === "z") {
      void undo();
    }
    if (event.key === "y") {
      void redo();
    }
  }
});

const root: HTMLElement = document.getElementById("root")!;
createRoot(root).render(<App />);

export default function App() {
  return (
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <MantineProvider>
          <Suspense fallback={"Loading..."}>
            <Test />
          </Suspense>
        </MantineProvider>
      </QueryClientProvider>
    </StrictMode>
  );
}

function Test() {
  const { data: series } = useSeries(0);
  const { data: bout } = useBout(series, 0);
  usePrefetchBoutData(bout);

  // Fetch Jam data
  const latestJamIndex = useLatestJamIndex(bout);
  const activeJamIndex = useActiveJamIndex(bout);
  const [periodNum, jamNum] = activeJamIndex ?? latestJamIndex;
  const { data: jam } = useJam(bout, periodNum, jamNum);

  // Fetch Timeout data
  const latestTimeoutIndex = useLatestTimeoutIndex(bout);
  const activeTimeoutIndex = useActiveTimeoutIndex(bout);
  const { data: timeout } = useTimeout(
    bout,
    activeTimeoutIndex ?? latestTimeoutIndex,
  );

  return (
    <Stack>
      <Text>{JSON.stringify(series)}</Text>
      <Text>{JSON.stringify(bout)}</Text>
      <Text>
        P{periodNum + 1} J{jamNum + 1}
      </Text>
      <Text>{JSON.stringify(jam)}</Text>
      <Text>{JSON.stringify(timeout)}</Text>
      <BoutControlButtons bout={bout} />
    </Stack>
  );

  // const [boutIndex, setBoutIndex] = useState(0);
  // const goToNextBout = useRef(false);

  // const { data: series } = useSeries(1);
  // if (series.boutIds.length == 0) {
  //   // TODO: Go to Bout creation page
  //   throw new Error("This Series does not have any Bouts");
  // }
  // const bout: Bout = useBout(series.boutIds[boutIndex]);

  // useEffect(() => {
  //   if (goToNextBout.current && series.boutIds.length > boutIndex + 1) {
  //     goToNextBout.current = false;
  //     setBoutIndex((i) => i + 1);
  //   }
  // }, [series, boutIndex]);

  // const { data: activeJam } = useActiveJam(bout);
  // const { data: latestTimeout } = useLatestTimeout(bout);
  // const { data: ruleset } = useRuleset(bout.id);

  // return (
  //   <BoutContext value={bout}>
  //     <RulesetContext value={ruleset}>
  //       <Container>
  //         <Stack>
  //           <BoutControlButtons bout={bout} />
  //           <Grid columns={bout.teams.length} align="center">
  //             <JamContext value={activeJam}>
  //               {bout.teams.map((team: Team, i: number) => (
  //                 <Grid.Col key={i} span={1}>
  //                   <Stack>
  //                     <TeamView bout={bout} team={team} />
  //                     <TeamJamView jam={activeJam} team={team} />
  //                   </Stack>
  //                 </Grid.Col>
  //               ))}
  //             </JamContext>
  //           </Grid>
  //           <BoutStateView
  //             bout={bout}
  //             activeJam={activeJam}
  //             latestTimeout={latestTimeout}
  //           />
  //         </Stack>
  //       </Container>
  //     </RulesetContext>
  //   </BoutContext>
  // );
}
