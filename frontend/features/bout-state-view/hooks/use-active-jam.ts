import useBout from "@/hooks/use-bout";
import useJam from "@/hooks/use-jam";
import { Jam } from "@/types/game";

export default function useActiveJam(boutId: number): Jam {
  const bout = useBout(boutId);

  let currentPeriodNum = bout.jamCounts.indexOf(0);
  if (currentPeriodNum < 0) {
    currentPeriodNum = bout.jamCounts.length;
  }
  currentPeriodNum--;
  let currentJamNum = bout.jamCounts[currentPeriodNum] - 1;
  if (["lineup", "timeout"].includes(bout.state) && currentJamNum > 0) {
    currentJamNum--;
  }

  return useJam(bout, currentPeriodNum, currentJamNum);
}
