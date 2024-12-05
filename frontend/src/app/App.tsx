import Sidebar from "../components/Sidebar.tsx";
import MainContainer from "../components/MainContainer.tsx";
import ScoreboardOperator from "./pages/ScoreboardOperator.tsx";

export default function App() {
  return (
    <MainContainer>
      <Sidebar>
        <ScoreboardOperator />
      </Sidebar>
    </MainContainer>
  );
}
