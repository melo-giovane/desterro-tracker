import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import type { LucideIcon } from "lucide-react";
import { TrendingDown, TrendingUp } from "lucide-react";

interface StatCardProps {
  label: string;
  value: React.ReactNode;
  icon: LucideIcon;
  iconClass?: string;
  delta?: number;
  hint?: string;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  iconClass = "bg-brand/15 text-brand-400",
  delta,
  hint,
}: StatCardProps) {
  return (
    <Card className="stat-grid-bg overflow-hidden p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">
            {label}
          </p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-ink tabular-nums">
            {value}
          </p>
        </div>
        <div
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-xl",
            iconClass
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2 text-xs">
        {delta !== undefined && (
          <span
            className={cn(
              "inline-flex items-center gap-1 font-medium",
              delta >= 0 ? "text-emerald-400" : "text-red-400"
            )}
          >
            {delta >= 0 ? (
              <TrendingUp className="h-3.5 w-3.5" />
            ) : (
              <TrendingDown className="h-3.5 w-3.5" />
            )}
            {delta >= 0 ? "+" : ""}
            {delta}%
          </span>
        )}
        {hint && <span className="text-ink-faint">{hint}</span>}
      </div>
    </Card>
  );
}
