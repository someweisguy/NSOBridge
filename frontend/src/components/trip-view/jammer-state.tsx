import { BoutIdContext } from "@/app/provider";
import useJam from "@/hooks/use-jam";
import {
  setLead,
  setLost,
  setStarPass,
  TeamJam,
  TeamString,
} from "@/lib/client/api/jam";
import { useContext } from "react";
import CheckboxButton from "../checkbox-button";

interface JammerStateProps {
  boutId?: string;
  periodNum: number;
  jamNum: number;
  team: TeamString;
  tripNum: number;
}

export default function JammerState({
  boutId,
  periodNum,
  jamNum,
  team,
  tripNum,
}: JammerStateProps) {
  const [boutIdContext] = useContext(BoutIdContext);
  boutId = boutId ?? boutIdContext;

  const teamJam: TeamJam = useJam(boutId, periodNum, jamNum)[team];
  console.log(teamJam.score);

  return (
    <div>
      <CheckboxButton
        key={team + "Lead"}
        checked={teamJam.score.lead}
        disabled={teamJam.score.lost}
        onClick={() =>
          void setLead(boutId, periodNum, jamNum, team, !teamJam.score.lead)
        }
      >
        Lead
      </CheckboxButton>
      <CheckboxButton
        key={team + "Lost"}
        checked={teamJam.score.lost}
        onClick={() =>
          void setLost(boutId, periodNum, jamNum, team, !teamJam.score.lost)
        }
      >
        Lost
      </CheckboxButton>
      <CheckboxButton
        key={team + "StarPass"}
        checked={teamJam.score.starPass !== null}
        onClick={() =>
          void setStarPass(
            boutId,
            periodNum,
            jamNum,
            team,
            teamJam.score.starPass === null ? tripNum : null
          )
        }
      >
        Star Pass
      </CheckboxButton>
    </div>
  );
}
