"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Settings, User, BookOpenText } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function UserMenu() {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Button variant="ghost" size="icon" aria-label="Personal Profile">
          <User className="size-5" />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className="z-50 min-w-56 rounded-md border border-border bg-surface-raised p-1 shadow-lg"
        >
          <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
            Personal Workspace
          </div>
          <DropdownMenu.Separator className="my-1 h-px bg-border" />
          <DropdownMenu.Item asChild>
            <Link
              href="/vocabulary"
              className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-muted"
            >
              <BookOpenText className="size-4" /> Vocabulary Vault
            </Link>
          </DropdownMenu.Item>
          <DropdownMenu.Item asChild>
            <Link
              href="/settings"
              className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-muted"
            >
              <Settings className="size-4" /> Settings
            </Link>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
