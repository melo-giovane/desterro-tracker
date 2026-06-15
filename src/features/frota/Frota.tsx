import { useMemo, useState } from "react";
import { Gauge, MapPin, Search, Clock, Navigation } from "lucide-react";
import { useStore } from "@/store/useStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { PageHeader, Avatar } from "@/components/ui/Misc";
import { StatusVeiculo } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Input";
import { FleetMap } from "@/components/map/FleetMap";
import { cn } from "@/lib/utils";
import { fmtKm, tempoRelativo } from "@/lib/format";
import type { Regiao } from "@/types";

const REGIOES: (Regiao | "Todas")[] = [
  "Todas",
  "Sudeste",
  "Sul",
  "Centro-Oeste",
  "Nordeste",
  "Norte",
];

export default function Frota() {
  const veiculos = useStore((s) => s.veiculos);
  const motoristas = useStore((s) => s.motoristas);
  const cargas = useStore((s) => s.cargas);
  const [regiao, setRegiao] = useState<Regiao | "Todas">("Todas");
  const [status, setStatus] = useState<string>("Todos");
  const [busca, setBusca] = useState("");
  const [selecionado, setSelecionado] = useState<string | null>(null);

  const filtrados = useMemo(() => {
    return veiculos.filter((v) => {
      if (regiao !== "Todas" && v.regiao !== regiao) return false;
      if (status !== "Todos" && v.status !== status) return false;
      if (busca) {
        const q = busca.toLowerCase();
        if (
          !v.placa.toLowerCase().includes(q) &&
          !v.modelo.toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }, [veiculos, regiao, status, busca]);

  const motoristaPorId = useMemo(
    () => new Map(motoristas.map((m) => [m.id, m])),
    [motoristas]
  );
  const cargaPorVeiculo = useMemo(
    () => new Map(cargas.filter((c) => c.veiculoId).map((c) => [c.veiculoId!, c])),
    [cargas]
  );

  const veiculoSel = veiculos.find((v) => v.id === selecionado);

  return (
    <div className="animate-fade-in">
      <PageHeader
        titulo="Monitoramento de Frota"
        subtitulo={`${filtrados.length} veículos exibidos · ${
          veiculos.filter((v) => v.status === "Em movimento").length
        } em movimento`}
      />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_380px]">
        <Card className="order-2 overflow-hidden xl:order-1">
          <CardContent className="p-0">
            <FleetMap
              veiculos={filtrados}
              cargas={cargas.filter(
                (c) =>
                  c.veiculoId &&
                  filtrados.some((v) => v.id === c.veiculoId) &&
                  (c.status === "Em trânsito" || c.status === "Atrasada")
              )}
              veiculoAtivoId={selecionado}
              onSelecionar={setSelecionado}
              mostrarRotas
              className="h-[300px] w-full sm:h-[620px]"
              zoom={4}
            />
          </CardContent>
        </Card>

        <div className="order-1 flex flex-col gap-3 xl:order-2">
          <Card>
            <CardContent className="space-y-2.5 p-4">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
                <input
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  placeholder="Buscar placa ou modelo…"
                  className="h-9 w-full rounded-lg border border-line bg-navy-850 pl-9 pr-3 text-sm text-ink placeholder:text-ink-faint focus:border-brand/50 focus:outline-none focus:ring-2 focus:ring-brand/20"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Select value={regiao} onChange={(e) => setRegiao(e.target.value as Regiao)}>
                  {REGIOES.map((r) => (
                    <option key={r} value={r}>
                      {r === "Todas" ? "Todas regiões" : r}
                    </option>
                  ))}
                </Select>
                <Select value={status} onChange={(e) => setStatus(e.target.value)}>
                  {["Todos", "Em movimento", "Parado", "Ocioso", "Manutenção"].map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </Select>
              </div>
            </CardContent>
          </Card>

          {veiculoSel && (
            <Card className="border-brand/30">
              <CardHeader>
                <CardTitle className="text-brand-400">{veiculoSel.placa}</CardTitle>
                <StatusVeiculo status={veiculoSel.status} />
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-ink-muted">{veiculoSel.modelo} · {veiculoSel.tipo}</p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <Metric icon={Gauge} label="Velocidade" value={`${veiculoSel.velocidade} km/h`} />
                  <Metric icon={Navigation} label="Rumo" value={`${Math.round(veiculoSel.rumo)}°`} />
                  <Metric icon={MapPin} label="Região" value={veiculoSel.regiao} />
                  <Metric
                    icon={Clock}
                    label="Atualizado"
                    value={tempoRelativo(veiculoSel.ultimaAtualizacao)}
                  />
                </div>
                {(() => {
                  const mot = motoristaPorId.get(veiculoSel.motoristaId ?? "");
                  const carga = cargaPorVeiculo.get(veiculoSel.id);
                  return (
                    <div className="space-y-2 border-t border-line pt-3">
                      {mot && (
                        <div className="flex items-center gap-2">
                          <Avatar nome={mot.nome} seed={mot.fotoSeed} size="sm" />
                          <div>
                            <p className="text-xs font-medium text-ink">{mot.nome}</p>
                            <p className="text-[11px] text-ink-muted">{mot.telefone}</p>
                          </div>
                        </div>
                      )}
                      {carga && (
                        <p className="text-xs text-ink-muted">
                          Transportando <span className="text-ink">{carga.codigo}</span> →{" "}
                          {carga.destino.nome}/{carga.destino.uf}
                        </p>
                      )}
                      <p className="text-[11px] text-ink-faint">
                        Odômetro: {fmtKm(veiculoSel.odometro)} · Próx. manutenção em{" "}
                        {fmtKm(Math.max(0, veiculoSel.proximaManutencaoKm - veiculoSel.odometro))}
                      </p>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          )}

          <Card className="flex min-h-0 flex-1 flex-col">
            <CardHeader>
              <CardTitle>Veículos ({filtrados.length})</CardTitle>
            </CardHeader>
            <CardContent className="max-h-[420px] space-y-1.5 overflow-y-auto px-3 pb-3">
              {filtrados.map((v) => {
                const mot = motoristaPorId.get(v.motoristaId ?? "");
                return (
                  <button
                    key={v.id}
                    onClick={() => setSelecionado(v.id)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg border p-2.5 text-left transition-colors",
                      selecionado === v.id
                        ? "border-brand/40 bg-brand/5"
                        : "border-line bg-navy-850 hover:bg-navy-800"
                    )}
                  >
                    <span
                      className={cn(
                        "h-2 w-2 shrink-0 rounded-full",
                        v.status === "Em movimento"
                          ? "bg-emerald-400"
                          : v.status === "Parado"
                          ? "bg-amber-400"
                          : v.status === "Manutenção"
                          ? "bg-red-400"
                          : "bg-ink-faint"
                      )}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-ink">
                        {v.placa}{" "}
                        <span className="font-normal text-ink-faint">· {v.modelo}</span>
                      </p>
                      <p className="truncate text-[11px] text-ink-muted">
                        {mot ? mot.nome : "Sem motorista"} · {v.regiao}
                      </p>
                    </div>
                    <span className="shrink-0 text-right text-[11px] tabular-nums text-ink-muted">
                      {v.velocidade > 0 ? `${v.velocidade} km/h` : "—"}
                    </span>
                  </button>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-line bg-navy-850 p-2.5">
      <p className="flex items-center gap-1.5 text-[11px] text-ink-faint">
        <Icon className="h-3.5 w-3.5" /> {label}
      </p>
      <p className="mt-0.5 text-sm font-semibold text-ink">{value}</p>
    </div>
  );
}
