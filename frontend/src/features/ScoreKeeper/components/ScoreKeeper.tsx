import { ReactElement } from "react";
import TripEditor from "@/features/sbo/trip-editor";
import JammerState from "@/features/sbo/jammer-state";

export default function ScoreKeeper({
  team,
}: {
  team: "home" | "away";
}): ReactElement {
  return (
    <div className="flex flex-col items-center bg-gray-100 rounded-lg">
      <TripEditor team={team} />
      <JammerState team={team} />
    </div>
  );
}
