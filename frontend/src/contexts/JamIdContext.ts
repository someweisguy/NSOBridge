import { createContext } from "react";
import { JamIdType } from "../types/JamIdType";


export const JamIdContext = createContext<JamIdType>([0, 0]);