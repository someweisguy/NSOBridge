import { Suspense, PropsWithChildren, ReactNode } from "react";

export default function Sidebar({ children }: PropsWithChildren): ReactNode {
  return (
    <div className="flex flex-row">
      <div className="flex flex-row w-72 h-full bg-slate-200">
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
