import { useMemo, useState } from "react";
import { Plus, Search, Phone, Star, MapPin, Truck, Route } from "lucide-react";
import { useStore } from "@/store/useStore";
import { Card, CardContent } from "@/components/ui/Card";
import { PageHeader, Avatar, EmptyState } from "@/components/ui/Misc";
import { StatusMotorista } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { NovoMotoristaModal } from "./NovoMotoristaModal";
import { fmtKm, fmtNum, tempoRelativo, fmtData } from "@/lib/format";
import type { Motorista, MotoristaStatus } from "@/types";
import { CIDADES } from "@/data/cidades";

const STATUS: (MotoristaStatus | "Todos")[] = [
  "Todos",
  "Disponível",
  "Em viagem",
  "Descanso",
  "Offline",
];

export default function Motoristas() {
  const motoristas = useStore((s) => s.motoristas);
  const veiculos = useStore((s) => s.veiculos);
  const [busca, setBusca] = useState("");
  const [status, setStatus] = useState<MotoristaStatus | "Todos">("Todos");
  const [novo, setNovo] = useState(false);
  const [detalhe, setDetalhe] = useState<Motorista | null>(null);

  const filtrados = useMemo(() => {
    return motoristas.filter((m) => {
      if (status !== "Todos" && m.status !== status) return false;
      if (busca) {
        const q = busca.toLowerCase();
        if (
          !m.nome.toLowerCase().includes(q) &&
          !m.cidadeBase.toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }, [motoristas, status, busca]);

  const veiculoPorId = useMemo(
    () => new Map(veiculos.map((v) => [v.id, v])),
    [veiculos]
  );

  return (
    <div className="animate-fade-in">
      <PageHeader
        titulo="Gestão de Motoristas"
        subtitulo={`${motoristas.length} motoristas agregados · ${
          motoristas.filter((m) => m.status === "Disponível").length
        } disponíveis`}
        acoes={
          <Button onClick={() => setNovo(true)}>
            <Plus className="h-4 w-4" /> Novo motorista
          </Button>
        }
      />

      <Card className="mb-4">
        <CardContent className="flex flex-col gap-2.5 p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por nome ou cidade…"
              className="h-9 w-full rounded-lg border border-line bg-navy-850 pl-9 pr-3 text-sm text-ink placeholder:text-ink-faint focus:border-brand/50 focus:outline-none focus:ring-2 focus:ring-brand/20"
            />
          </div>
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value as MotoristaStatus)}
            className="sm:w-48"
          >
            {STATUS.map((s) => (
              <option key={s} value={s}>
                {s === "Todos" ? "Todos status" : s}
              </option>
            ))}
          </Select>
        </CardContent>
      </Card>

      {filtrados.length === 0 ? (
        <Card>
          <EmptyState titulo="Nenhum motorista encontrado" descricao="Ajuste os filtros." />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filtrados.map((m) => {
            const veiculo = veiculoPorId.get(m.veiculoId ?? "");
            return (
              <button
                key={m.id}
                onClick={() => setDetalhe(m)}
                className="card p-4 text-left transition-colors hover:border-brand/30 hover:bg-navy-850"
              >
                <div className="flex items-start gap-3">
                  <Avatar nome={m.nome} seed={m.fotoSeed} size="lg" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-ink">{m.nome}</p>
                    <p className="flex items-center gap-1 text-[11px] text-ink-muted">
                      <MapPin className="h-3 w-3" /> {m.cidadeBase}
                    </p>
                    <div className="mt-1.5">
                      <StatusMotorista status={m.status} />
                    </div>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 border-t border-line pt-3 text-center">
                  <div>
                    <p className="flex items-center justify-center gap-1 text-sm font-semibold text-ink">
                      <Star className="h-3.5 w-3.5 text-amber-400" /> {m.avaliacao}
                    </p>
                    <p className="text-[10px] text-ink-faint">avaliação</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-ink">{m.viagensConcluidas}</p>
                    <p className="text-[10px] text-ink-faint">viagens</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-ink">
                      {fmtNum(Math.round(m.kmRodados / 1000))}k
                    </p>
                    <p className="text-[10px] text-ink-faint">km</p>
                  </div>
                </div>
                <p className="mt-3 flex items-center gap-1.5 text-[11px] text-ink-faint">
                  <Truck className="h-3 w-3" />
                  {veiculo ? `${veiculo.placa} · ${veiculo.modelo}` : "Sem veículo alocado"}
                </p>
              </button>
            );
          })}
        </div>
      )}

      <NovoMotoristaModal open={novo} onClose={() => setNovo(false)} />
      <MotoristaDetalhe
        motorista={detalhe}
        veiculo={detalhe ? veiculoPorId.get(detalhe.veiculoId ?? "") : undefined}
        onClose={() => setDetalhe(null)}
      />
    </div>
  );
}

function MotoristaDetalhe({
  motorista,
  veiculo,
  onClose,
}: {
  motorista: Motorista | null;
  veiculo?: { placa: string; modelo: string };
  onClose: () => void;
}) {
  if (!motorista) return null;
  const m = motorista;
  // histórico de viagens sintético, determinístico pelo nome
  const seed = m.nome.length;
  const historico = Array.from({ length: 5 }).map((_, i) => {
    const o = CIDADES[(seed + i * 3) % CIDADES.length];
    const d = CIDADES[(seed + i * 7 + 4) % CIDADES.length];
    return {
      data: Date.now() - (i + 1) * 1000 * 60 * 60 * 24 * (2 + (i % 3)),
      origem: `${o.nome}/${o.uf}`,
      destino: `${d.nome}/${d.uf}`,
      carga: ["Bobinas de Aço", "Chapas de MDF", "Perfis Metálicos", "Chapas de Aço"][
        (seed + i) % 4
      ],
    };
  });

  return (
    <Modal open={!!motorista} onClose={onClose} title="Ficha do motorista" className="max-w-xl">
      <div className="flex items-start gap-4">
        <Avatar nome={m.nome} seed={m.fotoSeed} size="lg" />
        <div className="flex-1">
          <p className="text-lg font-semibold text-ink">{m.nome}</p>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-ink-muted">
            <StatusMotorista status={m.status} />
            <span className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 text-amber-400" /> {m.avaliacao}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
        <Campo icon={Phone} label="Telefone" valor={m.telefone} />
        <Campo icon={MapPin} label="Região atual" valor={m.regiao} />
        <Campo icon={MapPin} label="Cidade base" valor={m.cidadeBase} />
        <Campo
          icon={Truck}
          label="Veículo"
          valor={veiculo ? veiculo.placa : "—"}
        />
        <Campo
          icon={Route}
          label="Última posição"
          valor={`${m.pos.lat.toFixed(3)}, ${m.pos.lng.toFixed(3)}`}
        />
        <Campo
          icon={Route}
          label="Atualizado"
          valor={tempoRelativo(m.ultimaAtualizacao)}
        />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <Resumo label="Viagens" valor={fmtNum(m.viagensConcluidas)} />
        <Resumo label="Km rodados" valor={fmtKm(m.kmRodados)} />
        <Resumo label="CNH" valor={m.cnh.slice(0, 6) + "…"} />
      </div>

      <div className="mt-5">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-faint">
          Histórico de viagens
        </p>
        <div className="space-y-1.5">
          {historico.map((h, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-lg border border-line bg-navy-850 px-3 py-2 text-xs"
            >
              <div>
                <p className="text-ink">
                  {h.origem} → {h.destino}
                </p>
                <p className="text-[11px] text-ink-faint">{h.carga}</p>
              </div>
              <span className="text-ink-muted">{fmtData(h.data)}</span>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}

function Campo({
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
      <p className="mt-0.5 font-medium text-ink">{valor}</p>
    </div>
  );
}

function Resumo({ label, valor }: { label: string; valor: string }) {
  return (
    <div className="rounded-lg border border-line bg-navy-900 p-3 text-center">
      <p className="text-base font-bold text-brand-400">{valor}</p>
      <p className="text-[11px] text-ink-faint">{label}</p>
    </div>
  );
}
