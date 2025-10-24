import * as React from "react"
import { cn } from "@/lib/utils"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { useSidebar } from "../sidebar"

const Sidebar = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, children, ...props }, ref) => {
  const { state, open, setOpen, openMobile, setOpenMobile, isMobile } = useSidebar()

  if (isMobile) {
    return (
      <Sheet open={openMobile} onOpenChange={setOpenMobile}>
        <SheetContent
          side="left"
          className={cn("w-[--sidebar-width] bg-sidebar p-0 text-sidebar-foreground", className)}
          style={
            {
              "--sidebar-width": "16rem",
            } as React.CSSProperties
          }
        >
          {children}
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <div
      ref={ref}
      className={cn(
        "peer hidden md:flex h-full w-[--sidebar-width] flex-col bg-sidebar text-sidebar-foreground",
        className
      )}
      style={
        {
          "--sidebar-width": "16rem",
        } as React.CSSProperties
      }
      {...props}
    >
      {children}
    </div>
  )
})
Sidebar.displayName = "Sidebar"

export { Sidebar }