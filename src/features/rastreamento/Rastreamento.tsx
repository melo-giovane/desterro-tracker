import { useMemo, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Radar,
  MapPin,
  Clock,
  Truck,
  Package,
  CircleDot,
  CheckCircle2,
  AlertTriangle,
  Info,
  Navigation,
} from "lucide-react";
import { useStore } from "@/store/useStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { PageHeader, Avatar, Progress, EmptyState } from "@/components/ui/Misc";
import { StatusCarga } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Input";
import { FleetMap } from "@/components/map/FleetMap";
import { cn } from "@/lib/utils";
import { fmtEta, fmtKm, fmtDataHora, fmtHora, fmtPeso } from "@/lib/format";
import type { EventoRota } from "@/types";
import type { LatLngBoundsExpression } from "leaflet";

export default function Rastreamento() {
  const { cargaId } = useParams();
  const navigate = useNavigate();
  const cargas = useStore((s) => s.cargas);
  const veiculos = useStore((s) => s.veiculos);
  const motoristas = useStore((s) => s.motoristas);

  const rastreaveis = useMemo(
    () =>
      cargas.filter(
        (c) =>
          c.status === "Em trânsito" ||
          c.status === "Atrasada" ||
          c.status === "Em coleta"
      ),
    [cargas]
  );

  const [sel, setSel] = useState<string | null>(cargaId ?? rastreaveis[0]?.id ?? null);

  useEffect(() => {
    if (cargaId) setSel(cargaId);
  }, [cargaId]);

  const carga = cargas.find((c) => c.id === sel) ?? rastreaveis[0];
  const veiculo = veiculos.find((v) => v.id === carga?.veiculoId);
  const motorista = motoristas.find((m) => m.id === carga?.motoristaId);

  const bounds: LatLngBoundsExpression | undefined = carga
    ? (carga.rota.map((p) => [p.lat, p.lng]) as LatLngBoundsExpression)
    : undefined;

  if (rastreaveis.length === 0 || !carga) {
    return (
      <div className="animate-fade-in">
        <PageHeader titulo="Central de Rastreamento" />
        <Card>
          <EmptyState
            icon={<Radar className="h-8 w-8" />}
            titulo="Nenhuma carga em rastreamento"
            descricao="Aloque cargas na aba Oportunidades para acompanhá-las aqui em tempo real."
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        titulo="Central de Rastreamento"
        subtitulo="Acompanhe a carga selecionada em tempo real"
        acoes={
          <Select
            value={carga.id}
            onChange={(e) => {
              setSel(e.target.value);
              navigate(`/rastreamento/${e.target.value}`);
            }}
            className="w-60"
          >
            {rastreaveis.map((c) => (
              <option key={c.id} value={c.id}>
                {c.codigo} · {c.origem.uf} → {c.destino.uf}
              </option>
            ))}
          </Select>
        }
      />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_400px]">
        <div className="flex flex-col gap-4">
          <Card className="overflow-hidden">
            <CardHeader>
              <div>
                <CardTitle className="flex items-center gap-2">
                  {carga.codigo}
                  <StatusCarga status={carga.status} />
                </CardTitle>
                <p className="text-xs text-ink-muted">
                  {carga.cliente} · {carga.tipo}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[11px] text-ink-faint">Previsão de chegada</p>
                <p className="text-lg font-bold text-brand-400">{fmtEta(carga.eta)}</p>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <FleetMap
                veiculos={veiculo ? [veiculo] : []}
                cargas={[carga]}
                veiculoAtivoId={veiculo?.id}
                mostrarRotas
                bounds={bounds}
                className="h-[380px] w-full"
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="mb-3 flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-sky-300">
                  <CircleDot className="h-3.5 w-3.5" /> {carga.origem.nome}/{carga.origem.uf}
                </span>
                <span className="font-medium text-ink">
                  {Math.round(carga.progresso * 100)}% percorrido
                </span>
                <span className="flex items-center gap-1.5 text-emerald-300">
                  {carga.destino.nome}/{carga.destino.uf} <MapPin className="h-3.5 w-3.5" />
                </span>
              </div>
              <Progress value={carga.progresso} className="h-2" />
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Info2
                  icon={Navigation}
                  label="Velocidade"
                  valor={veiculo ? `${veiculo.velocidade} km/h` : "—"}
                />
                <Info2 icon={MapPin} label="Distância total" valor={fmtKm(carga.distanciaKm)} />
                <Info2
                  icon={MapPin}
                  label="Restante"
                  valor={fmtKm(carga.distanciaKm * (1 - carga.progresso))}
                />
                <Info2 icon={Package} label="Peso" valor={fmtPeso(carga.pesoKg)} />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-brand-400" /> Veículo & motorista
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {veiculo ? (
                <div className="rounded-lg border border-line bg-navy-850 p-3">
                  <p className="text-sm font-semibold text-brand-400">{veiculo.placa}</p>
                  <p className="text-xs text-ink-muted">
                    {veiculo.modelo} · {veiculo.tipo}
                  </p>
                  <p className="mt-1 flex items-center gap-1.5 text-[11px] text-ink-faint">
                    <Clock className="h-3 w-3" /> Atualizado {fmtHora(veiculo.ultimaAtualizacao)}
                  </p>
                </div>
              ) : (
                <p className="text-xs text-ink-muted">Veículo não atribuído.</p>
              )}
              {motorista && (
                <div className="flex items-center gap-3 rounded-lg border border-line bg-navy-850 p-3">
                  <Avatar nome={motorista.nome} seed={motorista.fotoSeed} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">{motorista.nome}</p>
                    <p className="text-[11px] text-ink-muted">{motorista.telefone}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="flex-1">
            <CardHeader>
              <CardTitle>Histórico de eventos</CardTitle>
            </CardHeader>
            <CardContent>
              <Timeline eventos={carga.eventos} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Info2({
  icon: Icon,
  label,
  valor,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  valor: string;
}) {
  return (
    <div className="rounded-lg border border-line bg-navy-850 p-3">
      <p className="flex items-center gap-1.5 text-[11px] text-ink-faint">
        <Icon className="h-3.5 w-3.5" /> {label}
      </p>
      <p className="mt-0.5 text-sm font-semibold text-ink">{valor}</p>
    </div>
  );
}

const eventoEstilo = {
  info: { icon: Info, cor: "text-sky-300 bg-sky-500/10 border-sky-500/30" },
  sucesso: { icon: CheckCircle2, cor: "text-emerald-300 bg-emerald-500/10 border-emerald-500/30" },
  alerta: { icon: AlertTriangle, cor: "text-amber-300 bg-amber-500/10 border-amber-500/30" },
  erro: { icon: AlertTriangle, cor: "text-red-300 bg-red-500/10 border-red-500/30" },
} as const;

function Timeline({ eventos }: { eventos: EventoRota[] }) {
  const ordenados = [...eventos].sort((a, b) => b.ts - a.ts);
  return (
    <div className="relative space-y-4 pl-2">
      {ordenados.map((e, i) => {
        const est = eventoEstilo[e.tipo];
        const Icon = est.icon;
        return (
          <div key={i} className="relative flex gap-3">
            {i < ordenados.length - 1 && (
              <span className="absolute left-[13px] top-7 h-[calc(100%+4px)] w-px bg-line" />
            )}
            <div
              className={cn(
                "z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border",
                est.cor
              )}
            >
              <Icon className="h-3.5 w-3.5" />
            </div>
            <div className="pb-1">
              <p className="text-sm font-medium text-ink">{e.titulo}</p>
              <p className="text-xs text-ink-muted">{e.descricao}</p>
              <p className="mt-0.5 text-[11px] text-ink-faint">{fmtDataHora(e.ts)}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
