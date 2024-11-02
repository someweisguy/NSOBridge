import Sidebar from "./components/Sidebar.tsx";
import { createContext, Suspense } from "react";
import MainContainer from "./components/MainContainer.tsx";

export const SeriesContext = createContext(new Map<string, object>());

export default function App() {
  return (
    <Suspense fallback={<h1>Loading...</h1>}>
      <MainContainer>
        <Sidebar>
          <Suspense>
            First <br /> hello <br /> hello <br /> hello <br />
            Hello <br /> hello <br /> hello <br /> hello <br />
            Hello <br /> hello <br /> hello <br /> hello <br />
            Hello <br /> hello <br /> hello <br /> hello <br />
            Hello <br /> hello <br /> hello <br /> hello <br />
            Hello <br /> hello <br /> hello <br /> hello <br />
            Hello <br /> hello <br /> hello <br /> hello <br />
            Hello <br /> hello <br /> hello <br /> hello <br />
            Hello <br /> hello <br /> hello <br /> hello <br />
            Hello <br /> hello <br /> hello <br /> hello <br />
            Hello <br /> hello <br /> hello <br /> hello <br />
            Hello <br /> hello <br /> hello <br /> hello <br />
          </Suspense>
        </Sidebar>
      </MainContainer>
    </Suspense>
  );
}
