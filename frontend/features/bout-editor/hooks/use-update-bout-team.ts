import { localAPI } from "@/lib/requests";
import { Team } from "@/types/bout";
import { AppMutationOptions } from "@/types/query";
import { useMutation } from "@tanstack/react-query";

type EditableTeam = Partial<
  Omit<Team, "uuid" | "boutScore" | "jamScore" | "skaters">
>;

/**
 * Update the Team.
 *
 * @returns A Tanstack Mutation object which can fire the updateBoutTeam
 * mutator.
 */
export const useUpdateBoutTeam = (
  uuid: string,
  options?: AppMutationOptions<void, Error, EditableTeam>,
) =>
  useMutation({
    mutationFn: (team: EditableTeam) =>
      localAPI.put<void>("bout/team", {
        query: { uuid },
        body: team,
      }),
    ...options,
  });
