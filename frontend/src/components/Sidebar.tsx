import { ReactNode, Suspense } from "react";
import LoadingSpinner from "./LoadingSpinner";

type SidebarProps = {
  children?: ReactNode;
  spinner?: ReactNode;
};

export default function Sidebar({
  children,
  spinner = <LoadingSpinner />,
}: SidebarProps): ReactNode {
  return (
    <div className="flex flex-row w-full h-full max-h-full min-h-full">
      <div className="sticky left-0 flex flex-row flex-none w-3/12 h-full max-h-full min-h-full min-w-20 bg-slate-200">
        <nav className="fixed flex-col p-4">
          <p>Link 1</p>
          <p>Link 2</p>
          <p>Link 3</p>
          <p>Link 4</p>
        </nav>
      </div>

      <div className="flex-1 w-full p-4 shadow-inner">
        <Suspense fallback={spinner}>{children}</Suspense>
      </div>
    </div>
  );
}
