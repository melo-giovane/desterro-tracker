import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  BellRing,
  OctagonAlert,
  Route,
  Clock,
  WifiOff,
  Wrench,
  CheckCheck,
  Radar,
} from "lucide-react";
import { useStore } from "@/store/useStore";
import { Card, CardContent } from "@/components/ui/Card";
import { PageHeader, EmptyState } from "@/components/ui/Misc";
import { SeveridadeBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { tempoRelativo } from "@/lib/format";
import type { AlertaTipo } from "@/types";

const tipoInfo: Record<
  AlertaTipo,
  { label: string; icon: React.ComponentType<{ className?: string }>; cor: string }
> = {
  parado: { label: "Caminhão parado", icon: OctagonAlert, cor: "text-amber-300 bg-amber-500/10" },
  desvio: { label: "Desvio de rota", icon: Route, cor: "text-orange-300 bg-orange-500/10" },
  atraso: { label: "Entrega atrasada", icon: Clock, cor: "text-red-300 bg-red-500/10" },
  sem_atualizacao: {
    label: "Sem atualização",
    icon: WifiOff,
    cor: "text-sky-300 bg-sky-500/10",
  },
  manutencao: { label: "Manutenção", icon: Wrench, cor: "text-violet-300 bg-violet-500/10" },
};

const FILTROS: { valor: AlertaTipo | "todos"; label: string }[] = [
  { valor: "todos", label: "Todos" },
  { valor: "atraso", label: "Atrasos" },
  { valor: "parado", label: "Parados" },
  { valor: "desvio", label: "Desvios" },
  { valor: "sem_atualizacao", label: "Sem sinal" },
  { valor: "manutencao", label: "Manutenção" },
];

export default function Alertas() {
  const alertas = useStore((s) => s.alertas);
  const marcarLido = useStore((s) => s.marcarAlertaLido);
  const marcarTodos = useStore((s) => s.marcarTodosLidos);
  const [filtro, setFiltro] = useState<AlertaTipo | "todos">("todos");

  const contagem = useMemo(() => {
    const c: Record<string, number> = { todos: alertas.length };
    alertas.forEach((a) => (c[a.tipo] = (c[a.tipo] ?? 0) + 1));
    return c;
  }, [alertas]);

  const filtrados = useMemo(
    () => (filtro === "todos" ? alertas : alertas.filter((a) => a.tipo === filtro)),
    [alertas, filtro]
  );

  const naoLidos = alertas.filter((a) => !a.lido).length;

  return (
    <div className="animate-fade-in">
      <PageHeader
        titulo="Central de Alertas"
        subtitulo={`${naoLidos} alertas não lidos · monitoramento operacional contínuo`}
        acoes={
          <Button variant="secondary" onClick={marcarTodos} disabled={naoLidos === 0}>
            <CheckCheck className="h-4 w-4" /> Marcar todos como lidos
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {FILTROS.map((f) => (
          <button
            key={f.valor}
            onClick={() => setFiltro(f.valor)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
              filtro === f.valor
                ? "border-brand/40 bg-brand/10 text-brand-400"
                : "border-line bg-navy-850 text-ink-muted hover:text-ink"
            )}
          >
            {f.label}
            <span className="rounded-full bg-navy-700 px-1.5 text-[10px] text-ink-muted">
              {contagem[f.valor] ?? 0}
            </span>
          </button>
        ))}
      </div>

      <Card>
        <CardContent className="p-3">
          {filtrados.length === 0 ? (
            <EmptyState
              icon={<BellRing className="h-8 w-8" />}
              titulo="Nenhum alerta nesta categoria"
              descricao="A operação está sob controle."
            />
          ) : (
            <div className="space-y-2">
              {filtrados.map((a) => {
                const info = tipoInfo[a.tipo];
                const Icon = info.icon;
                return (
                  <div
                    key={a.id}
                    className={cn(
                      "flex items-start gap-3 rounded-xl border p-3.5 transition-colors",
                      a.lido
                        ? "border-line bg-navy-900"
                        : "border-line bg-navy-850 hover:bg-navy-800"
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                        info.cor
                      )}
                    >
                      <Icon className="h-4.5 w-4.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-medium text-ink">{a.titulo}</p>
                        <SeveridadeBadge severidade={a.severidade} />
                        {!a.lido && (
                          <span className="h-1.5 w-1.5 rounded-full bg-brand" />
                        )}
                      </div>
                      <p className="mt-0.5 text-xs text-ink-muted">{a.descricao}</p>
                      <p className="mt-1 text-[11px] text-ink-faint">{tempoRelativo(a.ts)}</p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1.5">
                      {a.cargaId && (
                        <Link
                          to={`/rastreamento/${a.cargaId}`}
                          className="inline-flex items-center gap-1 text-[11px] font-medium text-brand-400 hover:text-brand"
                        >
                          <Radar className="h-3 w-3" /> Rastrear
                        </Link>
                      )}
                      {!a.lido && (
                        <button
                          onClick={() => marcarLido(a.id)}
                          className="text-[11px] text-ink-muted hover:text-ink"
                        >
                          Marcar lido
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
