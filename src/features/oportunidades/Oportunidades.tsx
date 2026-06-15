import { useMemo, useState } from "react";
import { Sparkles, MapPin, Star, Trophy, Package, ArrowRight, Check } from "lucide-react";
import { useStore } from "@/store/useStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { PageHeader, Avatar, EmptyState } from "@/components/ui/Misc";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { haversine } from "@/lib/geo";
import { fmtKm, fmtPeso, fmtMoeda } from "@/lib/format";
import type { Carga, Motorista } from "@/types";

interface Candidato {
  motorista: Motorista;
  distancia: number;
  score: number;
}

/** Ranking: combina proximidade (peso maior), avaliação e disponibilidade. */
function ranquear(carga: Carga, motoristas: Motorista[]): Candidato[] {
  const disponiveis = motoristas.filter(
    (m) => m.status === "Disponível" || m.status === "Descanso"
  );
  const candidatos = disponiveis.map((m) => {
    const distancia = haversine(m.pos, carga.origem);
    // score 0..100: 70% proximidade, 20% avaliação, 10% experiência
    const proxScore = Math.max(0, 100 - distancia / 12);
    const avalScore = (m.avaliacao / 5) * 100;
    const expScore = Math.min(100, m.viagensConcluidas / 3);
    const score = proxScore * 0.7 + avalScore * 0.2 + expScore * 0.1;
    return { motorista: m, distancia, score };
  });
  return candidatos.sort((a, b) => b.score - a.score).slice(0, 5);
}

export default function Oportunidades() {
  const cargas = useStore((s) => s.cargas);
  const motoristas = useStore((s) => s.motoristas);
  const atribuir = useStore((s) => s.atribuirCarga);

  const disponiveis = useMemo(
    () =>
      cargas
        .filter((c) => c.status === "Disponível")
        .sort((a, b) => b.valor - a.valor),
    [cargas]
  );

  const [selecionada, setSelecionada] = useState<string | null>(
    disponiveis[0]?.id ?? null
  );
  const cargaSel = disponiveis.find((c) => c.id === selecionada) ?? disponiveis[0];

  const ranking = useMemo(
    () => (cargaSel ? ranquear(cargaSel, motoristas) : []),
    [cargaSel, motoristas]
  );

  if (disponiveis.length === 0) {
    return (
      <div className="animate-fade-in">
        <PageHeader titulo="Módulo de Oportunidades" />
        <Card>
          <EmptyState
            icon={<Sparkles className="h-8 w-8" />}
            titulo="Nenhuma carga disponível no momento"
            descricao="Todas as cargas já foram alocadas. Cadastre novas cargas na aba Cargas."
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        titulo="Módulo de Oportunidades"
        subtitulo={`${disponiveis.length} cargas disponíveis · sugestão automática dos motoristas mais próximos`}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[400px_1fr]">
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Cargas disponíveis</CardTitle>
            <span className="rounded-full bg-sky-500/10 px-2 py-0.5 text-[11px] font-semibold text-sky-300">
              {disponiveis.length}
            </span>
          </CardHeader>
          <CardContent className="max-h-[640px] space-y-2 overflow-y-auto px-3 pb-3">
            {disponiveis.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelecionada(c.id)}
                className={cn(
                  "w-full rounded-xl border p-3 text-left transition-colors",
                  cargaSel?.id === c.id
                    ? "border-brand/40 bg-brand/5"
                    : "border-line bg-navy-850 hover:bg-navy-800"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-brand-400">{c.codigo}</span>
                  <span className="text-xs font-medium text-ink">{fmtMoeda(c.valor)}</span>
                </div>
                <p className="mt-1 truncate text-xs text-ink">{c.cliente}</p>
                <p className="mt-1 flex items-center gap-1.5 text-[11px] text-ink-muted">
                  <MapPin className="h-3 w-3" />
                  {c.origem.nome}/{c.origem.uf} → {c.destino.nome}/{c.destino.uf}
                </p>
                <div className="mt-1.5 flex items-center gap-2 text-[11px] text-ink-faint">
                  <span>{c.tipo}</span>
                  <span>·</span>
                  <span>{fmtPeso(c.pesoKg)}</span>
                  <span>·</span>
                  <span>{fmtKm(c.distanciaKm)}</span>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4">
          {cargaSel && (
            <Card>
              <CardContent className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs text-ink-muted">Carga selecionada</p>
                    <p className="text-lg font-bold text-ink">
                      {cargaSel.codigo} ·{" "}
                      <span className="text-brand-400">{cargaSel.cliente}</span>
                    </p>
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-muted">
                      <MapPin className="h-4 w-4" />
                      {cargaSel.origem.nome}/{cargaSel.origem.uf}
                      <ArrowRight className="h-3.5 w-3.5" />
                      {cargaSel.destino.nome}/{cargaSel.destino.uf}
                    </p>
                  </div>
                  <div className="flex gap-4 text-right">
                    <div>
                      <p className="text-[11px] text-ink-faint">Distância</p>
                      <p className="font-semibold text-ink">{fmtKm(cargaSel.distanciaKm)}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-ink-faint">Peso</p>
                      <p className="font-semibold text-ink">{fmtPeso(cargaSel.pesoKg)}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-ink-faint">Valor</p>
                      <p className="font-semibold text-emerald-400">{fmtMoeda(cargaSel.valor)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-brand-400" /> Ranking de motoristas sugeridos
              </CardTitle>
              <span className="text-xs text-ink-muted">por proximidade e desempenho</span>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {ranking.length === 0 ? (
                <EmptyState
                  icon={<Package className="h-7 w-7" />}
                  titulo="Sem motoristas disponíveis"
                  descricao="Nenhum motorista livre para esta carga no momento."
                />
              ) : (
                ranking.map((cand, i) => (
                  <div
                    key={cand.motorista.id}
                    className={cn(
                      "flex flex-wrap items-center gap-3 rounded-xl border p-3.5",
                      i === 0
                        ? "border-brand/40 bg-brand/[0.06]"
                        : "border-line bg-navy-850"
                    )}
                  >
                    <div className="relative">
                      <Avatar nome={cand.motorista.nome} seed={cand.motorista.fotoSeed} size="lg" />
                      <span
                        className={cn(
                          "absolute -left-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold",
                          i === 0
                            ? "bg-brand text-white"
                            : "bg-navy-600 text-ink"
                        )}
                      >
                        {i + 1}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-ink">{cand.motorista.nome}</p>
                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-ink-muted">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> {cand.motorista.cidadeBase}
                        </span>
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-amber-400" /> {cand.motorista.avaliacao}
                        </span>
                        <span>{cand.motorista.viagensConcluidas} viagens</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-ink">{fmtKm(cand.distancia)}</p>
                      <p className="text-[11px] text-ink-faint">até a coleta</p>
                    </div>
                    <div className="w-24">
                      <div className="mb-1 flex items-center justify-between text-[10px] text-ink-faint">
                        <span>match</span>
                        <span className="font-semibold text-ink">
                          {Math.round(cand.score)}%
                        </span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-navy-700">
                        <div
                          className={cn(
                            "h-full rounded-full",
                            i === 0 ? "bg-brand" : "bg-sky-400"
                          )}
                          style={{ width: `${Math.min(100, cand.score)}%` }}
                        />
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant={i === 0 ? "default" : "secondary"}
                      onClick={() => cargaSel && atribuir(cargaSel.id, cand.motorista.id)}
                    >
                      <Check className="h-3.5 w-3.5" /> Alocar
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
