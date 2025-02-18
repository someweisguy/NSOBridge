import GameChip from "../../features/sbo/game-chip";
import GameController from "../../features/GameController/components/GameController";
import { Card } from "@/components/ui/card";
import TeamScoreCard from "../../features/sbo/team-score-card";
import useActiveJamId from "@/hooks/use-active-jam";
import { BoutIdType } from "@/types/bout";
import { useContext } from "react";
import { BoutIdContext } from "@/contexts/bout-id";
import { JamIdContext } from "@/contexts/jam-id";
import AppSidebar from "@/components/app-sidebar";

export default function ScoreboardOperator() {
  const boutId: BoutIdType = useContext(BoutIdContext);
  const activeJamId = useActiveJamId(boutId);

  return (
    <AppSidebar>
      <div className="grid grid-flow-row grid-cols-1">
        <div className="flex flex-row items-center">
          <GameChip />
          <GameController />
        </div>
        <JamIdContext.Provider value={activeJamId}>
          <div className="flex flex-row justify-center w-full gap-4">
            <Card>
              <TeamScoreCard team="home" />
            </Card>
            <Card>
              <TeamScoreCard team="away" />
            </Card>
          </div>
        </JamIdContext.Provider>
      </div>
    </AppSidebar>
  );
}
