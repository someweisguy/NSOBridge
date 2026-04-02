import { useAllRulesetNames } from "@/hooks/use-all-ruleset-names";
import CreateBoutButton from "./create-bout-button";

/**
 * Queries the server for the supported ruleset and renders a button which allows users
 * to create new Bouts.
 */
export default function CreateBoutButtonContainer() {
  const { data: rulesetNames } = useAllRulesetNames({ initialData: [] });

  return <CreateBoutButton rulesetNames={rulesetNames!} />;
}
