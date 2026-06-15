import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Area,
  AreaChart,
} from "recharts";
import { Package, Truck, Users, CheckCircle2, ArrowRight, MapPin } from "lucide-react";
import { useMetricas, useStore } from "@/store/useStore";
import { StatCard } from "./StatCard";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { PageHeader, Avatar } from "@/components/ui/Misc";
import { StatusCarga, SeveridadeBadge } from "@/components/ui/Badge";
import { FleetMap } from "@/components/map/FleetMap";
import { fmtNum, fmtPeso, tempoRelativo, primeiroNome } from "@/lib/format";
import type { Regiao } from "@/types";

const CHART_TOOLTIP = {
  contentStyle: {
    background: "#0F1B2D",
    border: "1px solid #1E2D49",
    borderRadius: 10,
    fontSize: 12,
    color: "#E6EDF6",
  },
  labelStyle: { color: "#8A9BB4" },
  itemStyle: { color: "#E6EDF6" },
};

const REGIOES: Regiao[] = ["Sudeste", "Sul", "Centro-Oeste", "Nordeste", "Norte"];

export default function Dashboard() {
  const m = useMetricas();
  const cargas = useStore((s) => s.cargas);
  const veiculos = useStore((s) => s.veiculos);
  const motoristas = useStore((s) => s.motoristas);
  const alertas = useStore((s) => s.alertas);

  const entreguesPorDia = useMemo(() => {
    const dias = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
    return dias.map((d, i) => ({
      dia: d,
      entregas: 6 + ((i * 7 + 11) % 14) + (i === 4 ? 8 : 0),
      coletas: 4 + ((i * 5 + 3) % 11),
    }));
  }, []);

  const statusData = useMemo(() => {
    const cont = {
      "Em trânsito": 0,
      Disponível: 0,
      Entregue: 0,
      Atrasada: 0,
      "Em coleta": 0,
    } as Record<string, number>;
    cargas.forEach((c) => (cont[c.status] = (cont[c.status] ?? 0) + 1));
    return [
      { nome: "Em trânsito", valor: cont["Em trânsito"], cor: "#F97316" },
      { nome: "Disponível", valor: cont["Disponível"], cor: "#38BDF8" },
      { nome: "Em coleta", valor: cont["Em coleta"], cor: "#FBBF24" },
      { nome: "Entregue", valor: cont["Entregue"], cor: "#34D399" },
      { nome: "Atrasada", valor: cont["Atrasada"], cor: "#F87171" },
    ];
  }, [cargas]);

  const porRegiao = useMemo(() => {
    return REGIOES.map((r) => ({
      regiao: r.replace("Centro-Oeste", "C-Oeste"),
      veiculos: veiculos.filter((v) => v.regiao === r).length,
      cargas: cargas.filter((c) => c.origem.regiao === r).length,
    }));
  }, [veiculos, cargas]);

  const ultimasCargas = useMemo(
    () =>
      [...cargas]
        .sort((a, b) => b.criadaEm - a.criadaEm)
        .slice(0, 6),
    [cargas]
  );

  const taxaEntrega = Math.round(
    (m.entregues / Math.max(1, m.entregues + m.atrasadas)) * 100
  );

  return (
    <div className="animate-fade-in">
      <PageHeader
        titulo="Dashboard Executivo"
        subtitulo="Visão geral da operação logística em tempo real"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Cargas em trânsito"
          value={fmtNum(m.emTransito)}
          icon={Package}
          iconClass="bg-brand/15 text-brand-400"
          delta={8}
          hint="vs. semana anterior"
        />
        <StatCard
          label="Cargas entregues"
          value={fmtNum(m.entregues)}
          icon={CheckCircle2}
          iconClass="bg-emerald-500/15 text-emerald-300"
          delta={12}
          hint="no período"
        />
        <StatCard
          label="Caminhões ativos"
          value={fmtNum(m.caminhoesAtivos)}
          icon={Truck}
          iconClass="bg-sky-500/15 text-sky-300"
          hint={`de ${m.totalVeiculos} na frota`}
        />
        <StatCard
          label="Motoristas disponíveis"
          value={fmtNum(m.motoristasDisponiveis)}
          icon={Users}
          iconClass="bg-violet-500/15 text-violet-300"
          hint={`de ${m.totalMotoristas} cadastrados`}
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="overflow-hidden xl:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>Mapa em tempo real</CardTitle>
              <p className="text-xs text-ink-muted">
                {m.totalVeiculos} veículos · {m.caminhoesAtivos} em movimento no território nacional
              </p>
            </div>
            <Link
              to="/frota"
              className="inline-flex items-center gap-1 text-xs font-medium text-brand-400 hover:text-brand"
            >
              Ver frota <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <FleetMap
              veiculos={veiculos}
              cargas={cargas.filter(
                (c) => c.status === "Em trânsito" || c.status === "Atrasada"
              )}
              className="h-[420px] w-full overflow-hidden"
              zoom={4}
            />
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance de entregas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-3xl font-bold text-ink tabular-nums">
                    {taxaEntrega}%
                  </p>
                  <p className="text-xs text-ink-muted">no prazo</p>
                </div>
                <div className="text-right text-xs text-ink-muted">
                  <p>
                    <span className="font-semibold text-emerald-400">
                      {m.entregues}
                    </span>{" "}
                    no prazo
                  </p>
                  <p>
                    <span className="font-semibold text-red-400">{m.atrasadas}</span>{" "}
                    atrasadas
                  </p>
                </div>
              </div>
              <div className="mt-4 h-[120px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={entreguesPorDia}>
                    <defs>
                      <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#F97316" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="#F97316" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="dia"
                      tick={{ fill: "#5B6B85", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip {...CHART_TOOLTIP} />
                    <Area
                      type="monotone"
                      dataKey="entregas"
                      stroke="#F97316"
                      strokeWidth={2}
                      fill="url(#grad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="flex-1">
            <CardHeader>
              <CardTitle>Distribuição de cargas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="h-[130px] w-[130px] shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData}
                        dataKey="valor"
                        nameKey="nome"
                        innerRadius={42}
                        outerRadius={62}
                        paddingAngle={2}
                        stroke="none"
                      >
                        {statusData.map((d) => (
                          <Cell key={d.nome} fill={d.cor} />
                        ))}
                      </Pie>
                      <Tooltip {...CHART_TOOLTIP} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 space-y-2">
                  {statusData.map((d) => (
                    <div key={d.nome} className="flex items-center gap-2 text-xs">
                      <span
                        className="h-2.5 w-2.5 rounded-sm"
                        style={{ background: d.cor }}
                      />
                      <span className="flex-1 text-ink-muted">{d.nome}</span>
                      <span className="font-semibold text-ink tabular-nums">
                        {d.valor}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Volume operacional por região</CardTitle>
            <p className="text-xs text-ink-muted">Veículos e cargas distribuídos</p>
          </CardHeader>
          <CardContent>
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={porRegiao} barGap={6}>
                  <XAxis
                    dataKey="regiao"
                    tick={{ fill: "#8A9BB4", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "#5B6B85", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip {...CHART_TOOLTIP} cursor={{ fill: "#152138" }} />
                  <Bar dataKey="veiculos" fill="#38BDF8" radius={[4, 4, 0, 0]} name="Veículos" />
                  <Bar dataKey="cargas" fill="#F97316" radius={[4, 4, 0, 0]} name="Cargas" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alertas recentes</CardTitle>
            <Link
              to="/alertas"
              className="text-xs font-medium text-brand-400 hover:text-brand"
            >
              Ver todos
            </Link>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {alertas.slice(0, 5).map((a) => (
              <div
                key={a.id}
                className="flex items-start gap-3 rounded-lg border border-line bg-navy-850 p-3"
              >
                <div className="mt-0.5">
                  <SeveridadeBadge severidade={a.severidade} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-ink">{a.titulo}</p>
                  <p className="mt-0.5 text-[11px] text-ink-muted">
                    {tempoRelativo(a.ts)}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Últimas cargas</CardTitle>
          <Link
            to="/cargas"
            className="text-xs font-medium text-brand-400 hover:text-brand"
          >
            Ver todas
          </Link>
        </CardHeader>
        <CardContent className="px-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-y border-line text-left text-[11px] uppercase tracking-wide text-ink-faint">
                  <th className="px-5 py-2.5 font-medium">Código</th>
                  <th className="px-5 py-2.5 font-medium">Cliente</th>
                  <th className="hidden px-5 py-2.5 font-medium md:table-cell">Rota</th>
                  <th className="hidden px-5 py-2.5 font-medium lg:table-cell">Peso</th>
                  <th className="hidden px-5 py-2.5 font-medium lg:table-cell">Motorista</th>
                  <th className="px-5 py-2.5 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {ultimasCargas.map((c) => {
                  const mot = motoristas.find((mm) => mm.id === c.motoristaId);
                  return (
                    <tr
                      key={c.id}
                      className="border-b border-line/60 transition-colors hover:bg-navy-850"
                    >
                      <td className="px-5 py-3 font-medium text-brand-400">{c.codigo}</td>
                      <td className="px-5 py-3 text-ink">{c.cliente}</td>
                      <td className="hidden px-5 py-3 text-ink-muted md:table-cell">
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-ink-faint" />
                          {c.origem.uf} → {c.destino.uf}
                        </span>
                      </td>
                      <td className="hidden px-5 py-3 text-ink-muted lg:table-cell">
                        {fmtPeso(c.pesoKg)}
                      </td>
                      <td className="hidden px-5 py-3 lg:table-cell">
                        {mot ? (
                          <span className="inline-flex items-center gap-2">
                            <Avatar nome={mot.nome} seed={mot.fotoSeed} size="sm" />
                            <span className="text-ink-muted">
                              {primeiroNome(mot.nome)}
                            </span>
                          </span>
                        ) : (
                          <span className="text-ink-faint">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <StatusCarga status={c.status} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
