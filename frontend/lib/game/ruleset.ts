import { Ruleset } from "@/types/ruleset";
import { localAPI } from "../requests";

/**
 * Get the roller derby ruleset associated with the desired Bout.
 *
 * @param boutUuid the UUID of the Bout whose Ruleset should be fetched.
 * @returns a Ruleset associated with the desired Bout.
 */
export async function getRuleset(boutUuid: string): Promise<Ruleset> {
  return localAPI.get<Ruleset>("bout/ruleset", {
    query: { boutUuid },
  });
}
