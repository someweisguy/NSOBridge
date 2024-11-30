import { JamIdType } from "../../../types/JamIdType";


export type JamNavigationType = {
  currentJamId: JamIdType
  nextJamExists: boolean;
  goToNextJam: () => void;
  previousJamExists: boolean;
  goToPreviousJam: () => void;
  goToCustomJam: (periodIndex: number, jamIndex: number) => void;
};