import { createContext, Suspense } from "react";
import Sidebar from "./components/Sidebar.tsx";
import MainContainer from "./components/MainContainer.tsx";
import TestPage from "./pages/TestPage.tsx";

export const BoutContext = createContext<string>("");

export default function App() {
  return (
    <MainContainer>
      <Sidebar>
        <Suspense fallback={<h1>Loading...</h1>}>
          <TestPage />
        </Suspense>
      </Sidebar>
    </MainContainer>
  );
}
