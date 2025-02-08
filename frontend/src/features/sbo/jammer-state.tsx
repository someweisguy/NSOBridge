import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { BoutIdContext } from "@/contexts/BoutIdContext";
import { BoutIdType } from "@/types/bout";
import { ReactElement, useContext } from "react";
import { JamIdType } from "@/types/jam";
import useScore from "@/hooks/use-score";
import { setLead } from "../../api/setLead";
import { setLost } from "../../api/setLost";
import { setStarPass } from "../../api/setStarPass";
import { JamIdContext } from "@/contexts/jam-id";

export default function JammerState({
  team,
}: {
  team: "home" | "away";
}): ReactElement {
  const boutId: BoutIdType = useContext(BoutIdContext);
  const jamId: JamIdType = useContext(JamIdContext);

  const { lead, lost, starPass } = useScore(boutId, jamId, team);
  const isLeadEligible =
    !useScore<boolean>(
      boutId,
      jamId,
      team === "home" ? "away" : "home",
      (score) => score.lead
    ) && !lost;

  return (
    <div className="grid grid-cols-3 gap-4 m-2">
      <Button
        variant="ghost"
        onClick={() => setLead(boutId, jamId, team, !lead)}
        disabled={!isLeadEligible}
      >
        <Checkbox checked={lead} disabled={!isLeadEligible} /> Lead
      </Button>
      <Button
        variant="ghost"
        onClick={() => setLost(boutId, jamId, team, !lost)}
      >
        <Checkbox checked={lost} /> Lost
      </Button>
      <Button
        variant="ghost"
        onClick={() => setStarPass(boutId, jamId, team, starPass == null)}
      >
        <Checkbox checked={starPass != null} /> Star Pass
      </Button>
    </div>
  );
}
