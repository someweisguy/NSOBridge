import { ReactElement, useContext } from "react";
// import TripCarousel from "./TripCarousel";
// import useTripIndex from "../hooks/useTripIndex";
// import useInitialPass from "../hooks/useInitialPass";
import { BoutIdContext } from "../../../contexts/BoutIdContext";
import { JamIdContext } from "../../JamPaginator/components/JamPaginator";
import { setLead } from "../api/setLead";
import useScore from "../../../hooks/useScore";
import { setLost } from "../api/setLost";
import { BoutIdType } from "../../../types/bout";
import { JamIdType } from "../../../types/jam";
import { Checkbox } from "@/components/ui/checkbox";
import TripEditor from "@/features/sbo/trip-editor";

export default function ScoreKeeper({
  team,
}: {
  team: "home" | "away";
}): ReactElement {
  const boutId: BoutIdType = useContext(BoutIdContext);
  const jamId: JamIdType = useContext(JamIdContext);

  // const [selectedTrip, setSelectedTrip] = useTripIndex(boutId, jamId, team);
  // const showInitial = useInitialPass(boutId, jamId, selectedTrip);

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
      <TripEditor team={team} />
      <div className="flex flex-row gap-2">
        <Checkbox
          disabled={!isLeadEligible}
          checked={lead}
          onCheckedChange={(checked) =>
            setLead(boutId, jamId, team, Boolean(checked))
          }
        >
          Lead
        </Checkbox>
        <Checkbox
          checked={lost}
          onCheckedChange={(checked) =>
            setLost(boutId, jamId, team, Boolean(checked))
          }
        >
          Lost
        </Checkbox>
        <Checkbox checked={starPass != null}>Star Pass</Checkbox>
      </div>
    </div>
  );
}
