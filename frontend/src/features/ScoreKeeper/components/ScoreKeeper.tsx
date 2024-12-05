import { ReactElement, useContext } from "react";
import PointEditor from "./PointEditor";
import TripCarousel from "./TripCarousel";
import useTripIndex from "../hooks/useTripIndex";
import useInitialPass from "../hooks/useInitialPass";
import { JamIdType } from "../../../types/JamIdType";
import JammerState from "./JammerState";
import { BoutIdType } from "../../../types/BoutIdType";
import { BoutIdContext } from "../../../contexts/BoutIdContext";
import { JamIdContext } from "../../../contexts/JamIdContext";

export default function ScoreKeeper({
  team,
}: {
  team: "home" | "away";
}): ReactElement {
  const boutId: BoutIdType = useContext(BoutIdContext);
  const jamId: JamIdType = useContext(JamIdContext);

  const [selectedTrip, setSelectedTrip] = useTripIndex(boutId, jamId, team);
  const showInitial = useInitialPass(boutId, jamId, selectedTrip);

  return (
    <div className="flex flex-col items-center bg-gray-100 rounded-lg">
      <PointEditor
        boutId={boutId}
        jamId={jamId}
        team={team}
        selectedTrip={selectedTrip}
        showInitial={showInitial}
      />
      <TripCarousel
        boutId={boutId}
        jamId={jamId}
        team={team}
        tripState={[selectedTrip, setSelectedTrip]}
      />
      <JammerState boutId={boutId} jamId={jamId} team={team} />
    </div>
  );
}
