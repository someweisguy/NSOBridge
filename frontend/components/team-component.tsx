import { Bout, BoutContext, Team } from "@/lib/game/bouts";
import TeamView from "./team-view";
import React from "react";

export function withTeam(
  FooterComponent?: ({ team }: { team: Team }) => React.ReactNode,
) {
  const GenericTeamComponent = ({
    bout,
    context,
  }: {
    bout: Bout;
    context: BoutContext;
  }) => {
    return (
      <div className="flex flex-row h-full size-full">
        {bout.teams.map((team: Team, index: number) => (
          <div key={index} className="grid grid-flow-row size-full">
            <TeamView team={team} context={context} />
            {FooterComponent && <FooterComponent team={team} />}
          </div>
        ))}
      </div>
    );
  };
  return React.memo(GenericTeamComponent);
}

export const TeamComponent = withTeam();
