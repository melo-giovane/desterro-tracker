import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";
import type {
  AlertaSeveridade,
  CargaStatus,
  MotoristaStatus,
  VeiculoStatus,
} from "@/types";

export function Badge({
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium",
        className
      )}
      {...props}
    />
  );
}

const cargaCores: Record<CargaStatus, string> = {
  Disponível: "border-sky-500/30 bg-sky-500/10 text-sky-300",
  "Em coleta": "border-amber-500/30 bg-amber-500/10 text-amber-300",
  "Em trânsito": "border-brand/30 bg-brand/10 text-brand-400",
  Entregue: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  Atrasada: "border-red-500/30 bg-red-500/10 text-red-300",
};

export function StatusCarga({ status }: { status: CargaStatus }) {
  return (
    <Badge className={cargaCores[status]}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </Badge>
  );
}

const motoristaCores: Record<MotoristaStatus, string> = {
  Disponível: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  "Em viagem": "border-brand/30 bg-brand/10 text-brand-400",
  Descanso: "border-sky-500/30 bg-sky-500/10 text-sky-300",
  Offline: "border-line bg-navy-700 text-ink-faint",
};

export function StatusMotorista({ status }: { status: MotoristaStatus }) {
  return (
    <Badge className={motoristaCores[status]}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </Badge>
  );
}

const veiculoCores: Record<VeiculoStatus, string> = {
  "Em movimento": "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  Parado: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  Ocioso: "border-line bg-navy-700 text-ink-muted",
  Manutenção: "border-red-500/30 bg-red-500/10 text-red-300",
};

export function StatusVeiculo({ status }: { status: VeiculoStatus }) {
  return <Badge className={veiculoCores[status]}>{status}</Badge>;
}

const sevCores: Record<AlertaSeveridade, string> = {
  alta: "border-red-500/30 bg-red-500/10 text-red-300",
  media: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  baixa: "border-sky-500/30 bg-sky-500/10 text-sky-300",
};

export function SeveridadeBadge({ severidade }: { severidade: AlertaSeveridade }) {
  const label = severidade === "alta" ? "Alta" : severidade === "media" ? "Média" : "Baixa";
  return <Badge className={sevCores[severidade]}>{label}</Badge>;
}
