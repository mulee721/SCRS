import { useEffect, useState, type ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Bell, LogOut, Menu, Moon, Sun, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";
import type { Role } from "@/lib/data";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, Confirm, Logo } from "./kit";

export interface NavItem { section: string; label: string; icon: LucideIcon }

export function useTheme() {
  const [dark, setDark] = useState(false);
  useEffect(() => setDark(document.documentElement.classList.contains("dark")), []);
  const toggle = () => {
    const d = !dark; setDark(d);
    document.documentElement.classList.toggle("dark", d);
    localStorage.setItem("scrs-theme", d ? "dark" : "light");
  };
  return { dark, toggle };
}

const base: Record<Role, "/student/$section" | "/lecturer/$section" | "/admin/$section"> = {
  student: "/student/$section", lecturer: "/lecturer/$section", admin: "/admin/$section",
};

export function AppShell({ role, nav, section, children }: { role: Role; nav: NavItem[]; section: string; children: ReactNode }) {
  const { session, ready, logout, notifications, update } = useStore();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [confirmOut, setConfirmOut] = useState(false);
  const { dark, toggle } = useTheme();

  useEffect(() => {
    if (!ready) return;
    if (!session) navigate({ to: "/login", replace: true });
    else if (session.role !== role) navigate({ to: base[session.role], params: { section: "overview" }, replace: true });
  }, [ready, session, role, navigate]);

  if (!ready || !session || session.role !== role) {
    return <div className="flex min-h-screen"><div className="hidden w-64 bg-sidebar lg:block" /><div className="flex-1 space-y-4 p-8"><Skeleton className="h-8 w-64" /><Skeleton className="h-32 w-full" /><Skeleton className="h-64 w-full" /></div></div>;
  }

  const myNotes = notifications.filter((n) => n.userId === session.refId);
  const unread = myNotes.filter((n) => !n.read).length;
  const current = nav.find((n) => n.section === section);

  const doLogout = () => { logout(); navigate({ to: "/login", replace: true }); };

  const sidebar = (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="px-5 py-5"><Link to="/"><Logo light /></Link></div>
      <p className="px-5 pb-2 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/50">{role} portal</p>
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3">
        {nav.map((n) => {
          const active = n.section === section;
          return (
            <Link key={n.section} to={base[role]} params={{ section: n.section }} onClick={() => setOpen(false)}
              className={cn("flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active ? "bg-sidebar-primary text-sidebar-primary-foreground" : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground")}>
              <n.icon className="size-4" />{n.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-sidebar-border p-3">
        <button onClick={() => setConfirmOut(true)} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
          <LogOut className="size-4" />Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen w-full bg-background">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 lg:block">{sidebar}</aside>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-64 border-0 p-0"><SheetTitle className="sr-only">Navigation</SheetTitle>{sidebar}</SheetContent>
      </Sheet>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b bg-background/85 px-4 backdrop-blur sm:px-6">
          <button className="rounded-lg p-2 hover:bg-muted lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu"><Menu className="size-5" /></button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{current?.label ?? "Dashboard"}</p>
            <p className="hidden text-xs text-muted-foreground sm:block">Fall 2026 · Registration open</p>
          </div>
          <button onClick={toggle} className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground" aria-label="Toggle theme">
            {dark ? <Sun className="size-5" /> : <Moon className="size-5" />}
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger className="relative rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground" aria-label="Notifications">
              <Bell className="size-5" />
              {unread > 0 && <span className="absolute right-1 top-1 grid size-4 place-items-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground">{unread}</span>}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel className="flex items-center justify-between">Notifications
                {unread > 0 && <button className="text-xs font-medium text-primary" onClick={() => update((s) => ({ notifications: s.notifications.map((n) => n.userId === session.refId ? { ...n, read: true } : n) }))}>Mark all read</button>}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {myNotes.length === 0 && <p className="px-2 py-6 text-center text-xs text-muted-foreground">You're all caught up.</p>}
              {myNotes.slice(0, 5).map((n) => (
                <DropdownMenuItem key={n.id} className="flex items-start gap-2 py-2">
                  <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", n.read ? "bg-muted" : "bg-primary")} />
                  <span><span className="block text-xs">{n.text}</span><span className="text-[10px] text-muted-foreground">{n.date}</span></span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 rounded-lg p-1 transition-colors hover:bg-muted">
              <Avatar name={session.name} />
              <span className="hidden text-left md:block"><span className="block text-xs font-semibold">{session.name}</span><span className="block text-[10px] capitalize text-muted-foreground">{role}</span></span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">{session.email}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {nav.some((n) => n.section === "profile") && <DropdownMenuItem asChild><Link to={base[role]} params={{ section: "profile" }}>Profile</Link></DropdownMenuItem>}
              <DropdownMenuItem asChild><Link to={base[role]} params={{ section: "settings" }}>Settings</Link></DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setConfirmOut(true)} className="text-destructive">Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main key={section} className="flex-1 animate-in fade-in-0 slide-in-from-bottom-1 p-4 duration-300 sm:p-6 lg:p-8">{children}</main>
      </div>
      <Confirm open={confirmOut} onOpenChange={setConfirmOut} title="Log out?" desc="You will need to sign in again to access your dashboard." confirmLabel="Logout" onConfirm={doLogout} />
    </div>
  );
}
