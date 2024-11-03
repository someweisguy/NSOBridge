import { PropsWithChildren, ReactNode } from "react";

export default function Sidebar({ children }: PropsWithChildren): ReactNode {
  return (
    <div className="container flex flex-row h-full max-h-full min-h-full">
      <div className="flex flex-row h-full max-h-full min-h-full w-72 bg-slate-200">
        <nav className="fixed flex-col p-4">
          <p>Link 1</p>
          <p>Link 2</p>
          <p>Link 3</p>
          <p>Link 4</p>
        </nav>
      </div>

      <div className="flex-auto p-4 shadow-inner">
        {children}
      </div>
    </div>
  );
}
