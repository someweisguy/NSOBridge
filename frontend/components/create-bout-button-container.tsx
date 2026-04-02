import { useAllRulesetNames } from "@/hooks/use-all-ruleset-names";
import CreateBoutButton from "./create-bout-button";

export default function CreateBoutButtonContainer() {
  const { data: rulesetNames } = useAllRulesetNames({ placeholderData: [] });

  return <CreateBoutButton rulesetNames={rulesetNames!} />;
}
