import { Bout, BoutContext, Team } from "@/lib/bout";
import TeamView from "./team-view";

export function TeamComponent(
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
      <div className="place-content-around grid grid-flow-col w-full">
        {bout.teams.map((team: Team, index: number) => (
          <div key={index} className="grid grid-flow-row">
            <TeamView team={team} context={context} />
            {FooterComponent && <FooterComponent team={team} />}
          </div>
        ))}
      </div>
    );
  };
  return GenericTeamComponent;
}

export const PlainTeamComponent = TeamComponent();
