import { ReactElement, useCallback } from "react";
import { JamIdType } from "../../../types/JamIdType";
import CheckboxButton from "./CheckboxButton";
import { setLead } from "../api/setLead";
import { ScoreType } from "../types/ScoreType";
import useScore from "../hooks/useScore";
import { setLost } from "../api/setLost";
import { setStarPass } from "../api/setStarPass";

export default function JammerState({
  boutId,
  jamId,
  team,
}: {
  boutId: string;
  jamId: JamIdType;
  team: "home" | "away";
}): ReactElement {
  const score: ScoreType = useScore(boutId, jamId, team);
  const otherScore: ScoreType = useScore(
    boutId,
    jamId,
    team == "home" ? "away" : "home"
  );

  const setLeadState = useCallback(() => {
    const newLead: boolean = !score.lead;
    setLead(boutId, jamId, team, newLead);
  }, [boutId, jamId, team, score.lead]);

  const setLostState = useCallback(() => {
    const newLost: boolean = !score.lost;
    setLost(boutId, jamId, team, newLost);
  }, [boutId, jamId, team, score.lost]);

  const setStarPassState = useCallback(() => {
    const newStarPass: number | null =
      score.starPass == null ? score.trips.length : null;
    setStarPass(boutId, jamId, team, newStarPass);
  }, [boutId, jamId, team, score.starPass, score.trips]);

  return (
    <div className="flex flex-row items-center justify-center w-full">
      <CheckboxButton
        disabled={score.lost || otherScore.lead}
        selected={score.lead}
        onClick={setLeadState}
      >
        Lead
      </CheckboxButton>
      <CheckboxButton selected={score.lost} onClick={setLostState}>
        Lost
      </CheckboxButton>
      <CheckboxButton
        selected={score.starPass != null}
        onClick={setStarPassState}
      >
        Star Pass
      </CheckboxButton>
    </div>
  );
}
