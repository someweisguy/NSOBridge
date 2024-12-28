import { ReactElement, useContext } from "react";
import PointEditor from "./PointEditor";
import TripCarousel from "./TripCarousel";
import useTripIndex from "../hooks/useTripIndex";
import useInitialPass from "../hooks/useInitialPass";
import { JamIdType } from "../../../types/JamIdType";
import { BoutIdType } from "../../../types/BoutIdType";
import { BoutIdContext } from "../../../contexts/BoutIdContext";
import { JamIdContext } from "../../JamPaginator/components/JamPaginator";
import Button from "../../../components/Button";
import { setLead } from "../api/setLead";
import useScore from "../../../hooks/useScore";
import { setLost } from "../api/setLost";

export default function ScoreKeeper({
  team,
}: {
  team: "home" | "away";
}): ReactElement {
  const boutId: BoutIdType = useContext(BoutIdContext);
  const jamId: JamIdType = useContext(JamIdContext);

  const [selectedTrip, setSelectedTrip] = useTripIndex(boutId, jamId, team);
  const showInitial = useInitialPass(boutId, jamId, selectedTrip);

  // Get the Jammer state variables
  const { lead, lost, starPass } = useScore(boutId, jamId, team);
  const isLeadEligible =
    !useScore<boolean>(
      boutId,
      jamId,
      team === "home" ? "away" : "home",
      (score) => score.lead
    ) && !lost;

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
      <div className="flex flex-row gap-2">
        <Button
          disabled={!isLeadEligible}
          isSelected={lead}
          onClick={() => setLead(boutId, jamId, team, !lead)}
        >
          Lead
        </Button>
        <Button
          isSelected={lost}
          onClick={() => setLost(boutId, jamId, team, !lost)}
        >
          Lost
        </Button>
        <Button isSelected={starPass != null}>Star Pass</Button>
      </div>
    </div>
  );
}
