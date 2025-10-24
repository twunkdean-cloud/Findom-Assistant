import * as React from "react"
import { cn } from "@/lib/utils"

const SidebarFooter = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "flex flex-col gap-2 p-4 mt-auto",
        className
      )}
      {...props}
    >
      {/* Footer content will be rendered here */}
    </div>
  )
})
SidebarFooter.displayName = "SidebarFooter"

export { SidebarFooter }