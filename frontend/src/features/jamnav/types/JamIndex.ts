import { JamId } from "../../../hooks/jam";

export type JamIndex = {
  currentJamId: JamId
  nextJamExists: boolean;
  goToNextJam: () => void;
  previousJamExists: boolean;
  goToPreviousJam: () => void;
  goToCustomJam: (periodIndex: number, jamIndex: number) => void;
};