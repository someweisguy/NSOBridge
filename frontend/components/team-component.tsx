import { Bout, BoutContext, Team } from "@/types/bouts";
import React from "react";
import TeamView from "./team-view";

export default function withTeam(
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
