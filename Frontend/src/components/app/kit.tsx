import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, Inbox, Search, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("rounded-2xl border bg-card text-card-foreground shadow-card", className)}>{children}</div>;
}

export function CardHead({ title, desc, action }: { title: string; desc?: string; action?: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b px-5 py-4">
      <div>
        <h3 className="text-sm font-semibold">{title}</h3>
        {desc && <p className="mt-0.5 text-xs text-muted-foreground">{desc}</p>}
      </div>
      {action}
    </div>
  );
}

export function PageHeader({ title, desc, actions }: { title: string; desc?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-xl font-bold tracking-tight sm:text-2xl">{title}</h1>
        {desc && <p className="mt-1 text-sm text-muted-foreground">{desc}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

const tones = {
  primary: "bg-primary/10 text-primary",
  success: "bg-success/12 text-success",
  warning: "bg-warning/15 text-warning",
  danger: "bg-destructive/10 text-destructive",
  navy: "bg-navy/10 text-navy dark:bg-primary/15 dark:text-primary",
};
export type Tone = keyof typeof tones;

export function StatCard({ label, value, icon: Icon, tone = "primary", hint }: { label: string; value: ReactNode; icon: LucideIcon; tone?: Tone; hint?: string }) {
  return (
    <Card className="p-5 transition-transform duration-200 hover:-translate-y-0.5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight">{value}</p>
          {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
        </div>
        <span className={cn("grid size-10 place-items-center rounded-xl", tones[tone])}><Icon className="size-5" /></span>
      </div>
    </Card>
  );
}

const statusTone: Record<string, Tone> = {
  approved: "success", active: "success", registered: "success", pass: "success",
  pending: "warning", upcoming: "primary", draft: "warning",
  rejected: "danger", closed: "navy", inactive: "danger", full: "danger", fail: "danger",
};
export function Badge({ children, tone }: { children: ReactNode; tone?: Tone }) {
  const t = tone ?? statusTone[String(children).toLowerCase()] ?? "primary";
  return <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize", tones[t])}>{children}</span>;
}

export function EmptyState({ icon: Icon = Inbox, title, desc, action }: { icon?: LucideIcon; title: string; desc?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <span className="grid size-12 place-items-center rounded-2xl bg-muted text-muted-foreground"><Icon className="size-6" /></span>
      <p className="mt-4 text-sm font-semibold">{title}</p>
      {desc && <p className="mt-1 max-w-sm text-xs text-muted-foreground">{desc}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function SearchInput({ value, onChange, placeholder = "Search…", className }: { value: string; onChange: (v: string) => void; placeholder?: string; className?: string }) {
  return (
    <div className={cn("relative", className)}>
      <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="h-9 pl-9" />
    </div>
  );
}

export function Avatar({ name, className }: { name: string; className?: string }) {
  const init = name.replace(/^(Dr\.|Mr\.|Ms\.)\s*/, "").split(" ").map((p) => p[0]).slice(0, 2).join("");
  return <span className={cn("grid size-9 shrink-0 place-items-center rounded-full bg-primary/12 text-xs font-bold text-primary", className)}>{init}</span>;
}

export interface Column<T> { key: string; header: string; cell: (row: T) => ReactNode; className?: string }

export function DataTable<T extends { id: string }>({ rows, columns, pageSize = 8, empty, toolbar }: {
  rows: T[]; columns: Column<T>[]; pageSize?: number; empty?: ReactNode; toolbar?: ReactNode;
}) {
  const [page, setPage] = useState(1);
  const pages = Math.max(1, Math.ceil(rows.length / pageSize));
  useEffect(() => { if (page > pages) setPage(1); }, [pages, page]);
  const slice = useMemo(() => rows.slice((page - 1) * pageSize, page * pageSize), [rows, page, pageSize]);
  const loading = useFakeLoading();

  return (
    <Card className="overflow-hidden">
      {toolbar && <div className="flex flex-col gap-2 border-b p-4 sm:flex-row sm:items-center">{toolbar}</div>}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {columns.map((c) => <th key={c.key} className={cn("whitespace-nowrap px-4 py-3", c.className)}>{c.header}</th>)}
            </tr>
          </thead>
          <tbody>
            {loading ? Array.from({ length: 4 }).map((_, i) => (
              <tr key={i} className="border-b last:border-0">{columns.map((c) => <td key={c.key} className="px-4 py-3.5"><Skeleton className="h-4 w-full max-w-32" /></td>)}</tr>
            )) : slice.map((r) => (
              <tr key={r.id} className="border-b transition-colors last:border-0 hover:bg-muted/40">
                {columns.map((c) => <td key={c.key} className={cn("whitespace-nowrap px-4 py-3", c.className)}>{c.cell(r)}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!loading && rows.length === 0 && (empty ?? <EmptyState title="No records found" desc="Try adjusting your search or filters." />)}
      {rows.length > pageSize && (
        <div className="flex items-center justify-between border-t px-4 py-3 text-xs text-muted-foreground">
          <span>Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, rows.length)} of {rows.length}</span>
          <div className="flex items-center gap-1">
            <Button size="icon" variant="outline" className="size-8" disabled={page === 1} onClick={() => setPage(page - 1)} aria-label="Previous page"><ChevronLeft className="size-4" /></Button>
            <span className="px-2">{page} / {pages}</span>
            <Button size="icon" variant="outline" className="size-8" disabled={page === pages} onClick={() => setPage(page + 1)} aria-label="Next page"><ChevronRight className="size-4" /></Button>
          </div>
        </div>
      )}
    </Card>
  );
}

export function useFakeLoading(ms = 350) {
  const [l, setL] = useState(true);
  useEffect(() => { const t = setTimeout(() => setL(false), ms); return () => clearTimeout(t); }, [ms]);
  return l;
}

export function Confirm({ open, onOpenChange, title, desc, confirmLabel = "Confirm", destructive, onConfirm }: {
  open: boolean; onOpenChange: (o: boolean) => void; title: string; desc: ReactNode; confirmLabel?: string; destructive?: boolean; onConfirm: () => void;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{desc}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction className={destructive ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""} onClick={onConfirm}>{confirmLabel}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-semibold text-foreground">{label}</span>
      {children}
      {error && <span className="block text-xs text-destructive">{error}</span>}
    </label>
  );
}

export function NativeSelect({ value, onChange, children, className }: { value: string; onChange: (v: string) => void; children: ReactNode; className?: string }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}
      className={cn("h-9 rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring/40", className)}>
      {children}
    </select>
  );
}

export function Logo({ light }: { light?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground">
        <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10 12 5 2 10l10 5 10-5Z" /><path d="M6 12v5c3 2 9 2 12 0v-5" /></svg>
      </span>
      <span className="leading-tight">
        <span className={cn("block text-base font-extrabold tracking-tight", light ? "text-sidebar-accent-foreground" : "text-foreground")}>SCRS</span>
        <span className={cn("block text-[10px] font-medium", light ? "text-sidebar-foreground/70" : "text-muted-foreground")}>Addis Valley University</span>
      </span>
    </span>
  );
}
