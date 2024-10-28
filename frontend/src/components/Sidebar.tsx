import { Suspense, PropsWithChildren } from "react";

export default function Sidebar({ children }: PropsWithChildren) {
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
