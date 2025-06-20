import { BoutIdContext } from "@/app/provider";
import useJam from "@/hooks/use-jam";
import { setLead, setLost, setStarPass } from "@/lib/client/api/jam";
import { TeamJam } from "@/lib/client/api/types";
import { useContext } from "react";
import CheckboxButton from "../checkbox-button";

interface JammerStateProps {
  boutId?: string;
  periodNum: number;
  jamNum: number;
  team: number;
  tripNum: number;
}

export default function JammerState({
  boutId,
  periodNum,
  jamNum,
  team,
}: JammerStateProps) {
  const [boutIdContext] = useContext(BoutIdContext);
  boutId ??= boutIdContext;

  const teamJam: TeamJam = useJam(boutId, periodNum, jamNum).teamJams[team];

  return (
    <div className="my-2">
      <CheckboxButton
        key={team + "Lead"}
        checked={teamJam.lead}
        disabled={teamJam.lost}
        onClick={() =>
          void setLead(boutId, periodNum, jamNum, team, !teamJam.lead)
        }
      >
        Lead
      </CheckboxButton>
      <CheckboxButton
        key={team + "Lost"}
        checked={teamJam.lost}
        onClick={() =>
          void setLost(boutId, periodNum, jamNum, team, !teamJam.lost)
        }
      >
        Lost
      </CheckboxButton>
      <CheckboxButton
        key={team + "StarPass"}
        checked={teamJam.starPass !== null}
        onClick={() =>
          void setStarPass(
            boutId,
            periodNum,
            jamNum,
            team,
            teamJam.starPass === null
          )
        }
      >
        Star Pass
      </CheckboxButton>
    </div>
  );
}
