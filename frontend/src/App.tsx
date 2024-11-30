import { createContext } from "react";
import Sidebar from "./components/Sidebar.tsx";
import MainContainer from "./components/MainContainer.tsx";
import ScoreboardOperator from "./app/pages/ScoreboardOperator.tsx";

export const BoutContext = createContext<string>("");

export default function App() {
  return (
    <MainContainer>
      <Sidebar>
        <ScoreboardOperator />
      </Sidebar>
    </MainContainer>
  );
}
