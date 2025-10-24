import * as React from "react"
import { cn } from "@/lib/utils"
import { PanelLeft } from "lucide-react"

const SidebarTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => {
  return (
    <button
      ref={ref}
      data-sidebar="trigger"
      className={cn("h-7 w-7", className)}
      {...props}
    >
      <PanelLeft />
      <span className="sr-only">Toggle Sidebar</span>
    </button>
  )
})
SidebarTrigger.displayName = "SidebarTrigger"

export { SidebarTrigger }