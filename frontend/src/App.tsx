import { Suspense, PropsWithChildren } from "react";

function NavBar() {
  return <div className="sticky top-0 p-4 bg-slate-400">NavBar!</div>;
}

function SideBar({ children }: PropsWithChildren) {
  return (
    <div className="flex flex-row">
      <div className="flex flex-row w-1/6 h-full bg-green-500">
        <nav className="container fixed flex-col p-4">
          <p>Link 1</p>
          <p>Link 2</p>
          <p>Link 3</p>
          <p>Link 4</p>
        </nav>
      </div>

      <div className="flex-auto p-4 bg-white">
        <Suspense>{children}</Suspense>
      </div>
    </div>
  );
}

function App() {
  return (
    <div className="container flex flex-col w-full h-svh max-h-svh">
      <NavBar />

      <SideBar>
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
      </SideBar>
    </div>
  );
}

export default App;
