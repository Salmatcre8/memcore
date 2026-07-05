"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  BrainCircuit,
  Search,
  History,
  Waypoints,
  FileStack,
  Settings,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/workspace/search", label: "Search", icon: Search },
  { href: "/workspace/timeline", label: "Timeline", icon: History },
  { href: "/workspace/graph", label: "Knowledge Graph", icon: Waypoints },
  { href: "/workspace/decisions", label: "Decisions", icon: BrainCircuit },
  { href: "/workspace/documents", label: "Documents", icon: FileStack },
  { href: "/workspace/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const name = session?.user?.name ?? "Guest";
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-line/70 bg-surface/60 px-4 py-6">
      <Link href="/" className="mb-8 flex items-center gap-2 px-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-dim text-emerald">
          <BrainCircuit size={16} />
        </span>
        <span className="font-display text-[15px] tracking-tight text-warmwhite">
          MemCore
        </span>
      </Link>

      <nav className="flex flex-1 flex-col gap-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] transition-colors",
                active
                  ? "bg-white/[0.06] text-warmwhite"
                  : "text-muted hover:bg-white/[0.04] hover:text-warmwhite"
              )}
            >
              <Icon size={16} className={active ? "text-emerald" : ""} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto flex items-center gap-3 rounded-xl px-3 py-3 hairline bg-card/60">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-dim text-[12px] font-medium text-emerald">
          {initials}
        </span>
        <div className="leading-tight flex-1 min-w-0">
          <p className="truncate text-[13px] text-warmwhite">{name}</p>
          <p className="text-[11.5px] text-muted">MemCore workspace</p>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          title="Sign out"
          className="text-muted hover:text-warmwhite transition-colors"
        >
          <LogOut size={15} />
        </button>
      </div>
    </aside>
  );
}
