import * as React from "react"
import { cn } from "@/lib/utils"

const SidebarContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "flex-1 flex-col gap-4 p-4",
        className
      )}
      {...props}
    >
      {/* Content will be rendered here */}
    </div>
  )
})
SidebarContent.displayName = "SidebarContent"

export { SidebarContent }