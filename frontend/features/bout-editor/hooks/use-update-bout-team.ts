import { localAPI } from "@/lib/requests";
import { Bout, Team } from "@/types/bout";
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
  options?: AppMutationOptions<Bout, Error, EditableTeam>,
) =>
  useMutation({
    mutationFn: (team: EditableTeam) =>
      localAPI.put<Bout>("bout/team", {
        query: { uuid },
        body: team,
      }),
    ...options,
  });
