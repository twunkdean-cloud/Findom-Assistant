"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Home,
  Users,
  DollarSign,
  Bot,
  CheckSquare,
  Calendar,
  CreditCard,
  Settings,
  Twitter,
  MessageCircle,
  FileText,
  Image,
  Search,
  PlusCircle,
} from "lucide-react";

type Cmd = {
  label: string;
  icon?: React.ComponentType<any>;
  action: () => void;
  shortcut?: string;
};

const CommandPalette: React.FC = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const isK = e.key.toLowerCase() === "k";
      if ((e.ctrlKey || e.metaKey) && isK) {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const nav = (path: string) => () => {
    setOpen(false);
    navigate(path);
  };

  const commands = useMemo(() => {
    const navigateCmds: Cmd[] = [
      { label: "Dashboard", icon: Home, action: nav("/") },
      { label: "Analytics", icon: Calendar, action: nav("/analytics") },
      { label: "Subs", icon: Users, action: nav("/subs") },
      { label: "Red Flags", icon: MessageCircle, action: nav("/redflags") },
      { label: "Tributes", icon: DollarSign, action: nav("/tributes") },
      { label: "AI Assistant", icon: Bot, action: nav("/chat-assistant") },
      { label: "Checklist", icon: CheckSquare, action: nav("/checklist") },
      { label: "Calendar", icon: Calendar, action: nav("/calendar") },
      { label: "Pricing", icon: CreditCard, action: nav("/pricing") },
      { label: "Settings", icon: Settings, action: nav("/settings") },
      { label: "Twitter", icon: Twitter, action: nav("/twitter") },
      { label: "Reddit", icon: MessageCircle, action: nav("/reddit") },
      { label: "Captions", icon: FileText, action: nav("/caption") },
      { label: "Image Vision", icon: Image, action: nav("/image-vision") },
    ];

    const quickCreateCmds: Cmd[] = [
      { label: "New Sub", icon: PlusCircle, action: nav("/subs?new=1"), shortcut: "N S" },
      { label: "New Tribute", icon: PlusCircle, action: nav("/tributes?new=1"), shortcut: "N T" },
    ];

    const aiCmds: Cmd[] = [
      { label: "Open AI Assistant", icon: Bot, action: nav("/chat-assistant") },
      { label: "Generate Captions", icon: FileText, action: nav("/caption") },
      { label: "Analyze Image", icon: Image, action: nav("/image-vision") },
    ];

    return { navigateCmds, quickCreateCmds, aiCmds };
  }, []);

  return (
    <>
      <button
        aria-label="Open command palette"
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 z-50 rounded-full bg-primary text-primary-foreground p-3 shadow-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ring-offset-background"
      >
        <Search className="h-5 w-5" />
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Navigate">
            {commands.navigateCmds.map((cmd) => (
              <CommandItem
                key={cmd.label}
                onSelect={cmd.action}
                aria-label={`Go to ${cmd.label}`}
              >
                {cmd.icon && <cmd.icon className="mr-2 h-4 w-4" />} {cmd.label}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Quick Create">
            {commands.quickCreateCmds.map((cmd) => (
              <CommandItem
                key={cmd.label}
                onSelect={cmd.action}
                aria-label={cmd.label}
              >
                {cmd.icon && <cmd.icon className="mr-2 h-4 w-4" />} {cmd.label}
                {cmd.shortcut && (
                  <span className="ml-auto text-xs text-muted-foreground">{cmd.shortcut}</span>
                )}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="AI">
            {commands.aiCmds.map((cmd) => (
              <CommandItem
                key={cmd.label}
                onSelect={cmd.action}
                aria-label={cmd.label}
              >
                {cmd.icon && <cmd.icon className="mr-2 h-4 w-4" />} {cmd.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
};

export default CommandPalette;