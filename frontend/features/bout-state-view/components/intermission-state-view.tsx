import Clock from "@/components/clock";
import { Bout } from "@/types/game";
import useActiveJam from "../hooks/use-active-jam";

export default function IntermissionStateView({ bout }: { bout: Bout }) {
  const jam = useActiveJam(bout.id);

  let copy = "Starting Soon";
  if (bout.isFinal) {
    copy = "Final Score";
  } else if (jam.period > 1) {
    copy = "Unofficial Score";
  } else if (jam.period == 1) {
    copy = "Halftime";
  }

  return (
    <div className="items-center grid m-2 h-full text-8xl text-center">
      {copy}{" "}
      {bout.startCountdown && <Clock startTimestamp={bout.startCountdown} />}
    </div>
  );
}
