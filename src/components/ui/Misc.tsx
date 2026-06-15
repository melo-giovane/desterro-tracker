import { cn } from "@/lib/utils";
import { iniciais } from "@/lib/format";

export function Progress({
  value,
  className,
  barClassName,
}: {
  value: number; // 0..1
  className?: string;
  barClassName?: string;
}) {
  return (
    <div className={cn("h-1.5 w-full overflow-hidden rounded-full bg-navy-700", className)}>
      <div
        className={cn("h-full rounded-full bg-brand transition-all duration-700", barClassName)}
        style={{ width: `${Math.max(0, Math.min(1, value)) * 100}%` }}
      />
    </div>
  );
}

const avatarCores = [
  "bg-brand/20 text-brand-400",
  "bg-sky-500/20 text-sky-300",
  "bg-emerald-500/20 text-emerald-300",
  "bg-violet-500/20 text-violet-300",
  "bg-amber-500/20 text-amber-300",
  "bg-rose-500/20 text-rose-300",
];

export function Avatar({
  nome,
  seed,
  size = "md",
}: {
  nome: string;
  seed?: string;
  size?: "sm" | "md" | "lg";
}) {
  const idx = Math.abs(
    (seed ?? nome).split("").reduce((a, c) => a + c.charCodeAt(0), 0)
  ) % avatarCores.length;
  const dims =
    size === "sm" ? "h-8 w-8 text-[11px]" : size === "lg" ? "h-12 w-12 text-sm" : "h-9 w-9 text-xs";
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-semibold",
        dims,
        avatarCores[idx]
      )}
    >
      {iniciais(nome)}
    </div>
  );
}

export function PageHeader({
  titulo,
  subtitulo,
  acoes,
}: {
  titulo: string;
  subtitulo?: string;
  acoes?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-ink">{titulo}</h1>
        {subtitulo && <p className="mt-1 text-sm text-ink-muted">{subtitulo}</p>}
      </div>
      {acoes && <div className="flex items-center gap-2">{acoes}</div>}
    </div>
  );
}

export function EmptyState({
  icon,
  titulo,
  descricao,
}: {
  icon?: React.ReactNode;
  titulo: string;
  descricao?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      {icon && <div className="mb-3 text-ink-faint">{icon}</div>}
      <p className="text-sm font-medium text-ink">{titulo}</p>
      {descricao && <p className="mt-1 max-w-sm text-xs text-ink-muted">{descricao}</p>}
    </div>
  );
}

export function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
}) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wide text-ink-faint">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-ink">{value}</p>
      {hint && <p className="text-[11px] text-ink-muted">{hint}</p>}
    </div>
  );
}
