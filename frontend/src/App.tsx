import Topbar from "./components/Topbar.tsx";
import Sidebar from "./components/Sidebar.tsx";
import { Suspense } from "react";

export default function App() {
  return (
    <div className="container flex flex-col w-full h-svh max-h-svh">
      <Topbar />

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
    </div>
  );
}
