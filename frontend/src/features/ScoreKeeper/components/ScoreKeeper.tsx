import { ReactElement } from "react";
import PointEditor from "./PointEditor";
import TripCarousel from "./TripCarousel";
import useTripIndex from "../hooks/useTripIndex";
import useInitialPass from "../hooks/useInitialPass";
import { JamIdType } from "../../../types/JamIdType";
import CheckboxButton from "./CheckboxButton";


export default function ScoreKeeper({
  boutId,
  jamId,
  team,
}: {
  boutId: string;
  jamId: JamIdType;
  team: "home" | "away";
}): ReactElement {
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
      <div className="flex flex-row items-center w-full justify-center">
        <CheckboxButton>Lead</CheckboxButton>
        <CheckboxButton>Lost</CheckboxButton>
        <CheckboxButton>Star Pass</CheckboxButton>
      </div>
    </div>
  );
}
