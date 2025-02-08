import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar.tsx";
import { ReactNode, Suspense } from "react";
import LoadingSpinner from "./loading-spinner";
import { cn } from "@/lib/utils";

type SidebarProps = {
  className?: string;
  children?: ReactNode;
  spinner?: ReactNode;
};

export default function AppSidebar({
  className,
  children,
  spinner = <LoadingSpinner />,
}: SidebarProps): ReactNode {
  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader>NSO Bridge</SidebarHeader>
        <SidebarContent />
        <SidebarFooter>
          <SidebarTrigger />
        </SidebarFooter>
      </Sidebar>
      <div className={cn("content size-full p-1", className)}>
        <Suspense fallback={spinner}>{children}</Suspense>
      </div>
    </SidebarProvider>
  );
}
