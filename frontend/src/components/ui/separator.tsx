"use client";

import * as React from "react";
import * as SeparatorPrimitive from "@radix-ui/react-separator";

import { cn } from "@/lib/utils";

function Separator({
  className,
  orientation = "horizontal",
  decorative = true,
  ...props
}: React.ComponentProps<typeof SeparatorPrimitive.Root>) {
  return (
    <SeparatorPrimitive.Root
      data-slot="separator-root"
      decorative={decorative}
      orientation={orientation}
      className={cn(
        "bg-neutral-200 shrink-0 data-[orientation=horizontal]:h-[1px] data-[orientation=horizontal]:min-w-full data-[orientation=vertical]:min-h-full data-[orientation=vertical]:w-[1px] dark:bg-neutral-800",
        className
      )}
      {...props}
    />
  );
}

export { Separator };
