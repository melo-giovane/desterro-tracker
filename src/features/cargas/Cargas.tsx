import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, Package, Radar } from "lucide-react";
import { useStore } from "@/store/useStore";
import { Card, CardContent } from "@/components/ui/Card";
import { PageHeader, EmptyState } from "@/components/ui/Misc";
import { StatusCarga } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Input";
import { NovaCargaModal } from "./NovaCargaModal";
import { fmtMoeda, fmtPeso, fmtKm, fmtData } from "@/lib/format";
import type { CargaStatus } from "@/types";

const STATUS: (CargaStatus | "Todas")[] = [
  "Todas",
  "Disponível",
  "Em coleta",
  "Em trânsito",
  "Entregue",
  "Atrasada",
];

export default function Cargas() {
  const cargas = useStore((s) => s.cargas);
  const motoristas = useStore((s) => s.motoristas);
  const [busca, setBusca] = useState("");
  const [status, setStatus] = useState<CargaStatus | "Todas">("Todas");
  const [tipo, setTipo] = useState("Todos");
  const [modal, setModal] = useState(false);

  const motoristaPorId = useMemo(
    () => new Map(motoristas.map((m) => [m.id, m])),
    [motoristas]
  );

  const tipos = useMemo(
    () => ["Todos", ...Array.from(new Set(cargas.map((c) => c.tipo)))],
    [cargas]
  );

  const filtradas = useMemo(() => {
    return cargas.filter((c) => {
      if (status !== "Todas" && c.status !== status) return false;
      if (tipo !== "Todos" && c.tipo !== tipo) return false;
      if (busca) {
        const q = busca.toLowerCase();
        if (
          !c.codigo.toLowerCase().includes(q) &&
          !c.cliente.toLowerCase().includes(q) &&
          !c.origem.nome.toLowerCase().includes(q) &&
          !c.destino.nome.toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }, [cargas, status, tipo, busca]);

  return (
    <div className="animate-fade-in">
      <PageHeader
        titulo="Gestão de Cargas"
        subtitulo={`${cargas.length} cargas cadastradas · ${
          cargas.filter((c) => c.status === "Disponível").length
        } disponíveis para alocação`}
        acoes={
          <Button onClick={() => setModal(true)}>
            <Plus className="h-4 w-4" /> Nova carga
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
              placeholder="Buscar por código, cliente, cidade…"
              className="h-9 w-full rounded-lg border border-line bg-navy-850 pl-9 pr-3 text-sm text-ink placeholder:text-ink-faint focus:border-brand/50 focus:outline-none focus:ring-2 focus:ring-brand/20"
            />
          </div>
          <div className="flex gap-2">
            <Select
              value={status}
              onChange={(e) => setStatus(e.target.value as CargaStatus)}
              className="sm:w-44"
            >
              {STATUS.map((s) => (
                <option key={s} value={s}>
                  {s === "Todas" ? "Todos status" : s}
                </option>
              ))}
            </Select>
            <Select value={tipo} onChange={(e) => setTipo(e.target.value)} className="sm:w-48">
              {tipos.map((t) => (
                <option key={t} value={t}>
                  {t === "Todos" ? "Todos tipos" : t}
                </option>
              ))}
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="px-0 py-0">
          {filtradas.length === 0 ? (
            <EmptyState
              icon={<Package className="h-8 w-8" />}
              titulo="Nenhuma carga encontrada"
              descricao="Ajuste os filtros ou cadastre uma nova carga."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-line text-left text-[11px] uppercase tracking-wide text-ink-faint">
                    <th className="px-5 py-3 font-medium">Código</th>
                    <th className="px-5 py-3 font-medium">Cliente / Tipo</th>
                    <th className="hidden px-5 py-3 font-medium md:table-cell">Rota</th>
                    <th className="hidden px-5 py-3 font-medium lg:table-cell">Peso</th>
                    <th className="hidden px-5 py-3 font-medium xl:table-cell">Valor</th>
                    <th className="hidden px-5 py-3 font-medium xl:table-cell">Entrega</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {filtradas.map((c) => {
                    const mot = motoristaPorId.get(c.motoristaId ?? "");
                    return (
                      <tr
                        key={c.id}
                        className="border-b border-line/50 transition-colors hover:bg-navy-850"
                      >
                        <td className="px-5 py-3">
                          <span className="font-medium text-brand-400">{c.codigo}</span>
                          {mot && (
                            <p className="text-[11px] text-ink-faint">{mot.nome.split(" ")[0]}</p>
                          )}
                        </td>
                        <td className="px-5 py-3">
                          <p className="font-medium text-ink">{c.cliente}</p>
                          <p className="text-[11px] text-ink-muted">{c.tipo}</p>
                        </td>
                        <td className="hidden px-5 py-3 text-ink-muted md:table-cell">
                          <p className="text-xs">
                            {c.origem.nome}/{c.origem.uf}
                          </p>
                          <p className="text-[11px] text-ink-faint">
                            → {c.destino.nome}/{c.destino.uf} · {fmtKm(c.distanciaKm)}
                          </p>
                        </td>
                        <td className="hidden px-5 py-3 text-ink-muted lg:table-cell">
                          {fmtPeso(c.pesoKg)}
                        </td>
                        <td className="hidden px-5 py-3 font-medium text-ink xl:table-cell">
                          {fmtMoeda(c.valor)}
                        </td>
                        <td className="hidden px-5 py-3 text-ink-muted xl:table-cell">
                          {fmtData(c.entregaPrevista)}
                        </td>
                        <td className="px-5 py-3">
                          <StatusCarga status={c.status} />
                        </td>
                        <td className="px-5 py-3 text-right">
                          {c.veiculoId ? (
                            <Link
                              to={`/rastreamento/${c.id}`}
                              className="inline-flex items-center gap-1 text-xs font-medium text-brand-400 hover:text-brand"
                            >
                              <Radar className="h-3.5 w-3.5" /> Rastrear
                            </Link>
                          ) : c.status === "Disponível" ? (
                            <Link
                              to="/oportunidades"
                              className="text-xs font-medium text-ink-muted hover:text-ink"
                            >
                              Alocar
                            </Link>
                          ) : null}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <NovaCargaModal open={modal} onClose={() => setModal(false)} />
    </div>
  );
}
