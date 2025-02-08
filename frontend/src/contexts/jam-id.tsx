import { createContext } from "react";
import { JamIdType } from "@/types/jam";

export const JamIdContext = createContext<JamIdType>([0, 0]);
