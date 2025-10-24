import * as React from "react"
import { cn } from "@/lib/utils"

const SidebarInset = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "flex flex-1 flex-col",
        className
      )}
      {...props}
    >
      {/* Inset content will be rendered here */}
    </div>
  )
})
SidebarInset.displayName = "SidebarInset"

export { SidebarInset }