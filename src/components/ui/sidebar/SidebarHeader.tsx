import * as React from "react"
import { cn } from "@/lib/utils"

const SidebarHeader = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "flex h-16 shrink-0 items-center gap-6 border-b",
        className
      )}
      {...props}
    >
      {/* Header content will be rendered here */}
    </div>
  )
})
SidebarHeader.displayName = "SidebarHeader"

export { SidebarHeader }