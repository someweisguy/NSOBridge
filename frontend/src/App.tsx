import { createContext, Suspense } from "react";
import Sidebar from "./components/Sidebar.tsx";
import MainContainer from "./components/MainContainer.tsx";
import ScoreboardOperator from "./pages/ScoreboardOperator.tsx";

export const BoutContext = createContext<string>("");

export default function App() {
  return (
    <MainContainer>
      <Sidebar>
        <Suspense fallback={<h1>Loading...</h1>}>
          <ScoreboardOperator />
        </Suspense>
      </Sidebar>
    </MainContainer>
  );
}
