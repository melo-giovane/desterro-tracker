import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Truck,
  Package,
  Users,
  Sparkles,
  Radar,
  BellRing,
  X,
} from "lucide-react";
import { useMetricas } from "@/store/useStore";

const itens = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/frota", label: "Frota", icon: Truck },
  { to: "/cargas", label: "Cargas", icon: Package },
  { to: "/motoristas", label: "Motoristas", icon: Users },
  { to: "/oportunidades", label: "Oportunidades", icon: Sparkles },
  { to: "/rastreamento", label: "Rastreamento", icon: Radar },
  { to: "/alertas", label: "Alertas", icon: BellRing },
];

export function Sidebar({
  aberto,
  onFechar,
}: {
  aberto: boolean;
  onFechar: () => void;
}) {
  const { alertasNaoLidos } = useMetricas();

  return (
    <>
      {aberto && (
        <div
          className="fixed inset-0 z-40 bg-navy-950/70 backdrop-blur-sm lg:hidden"
          onClick={onFechar}
        />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-line bg-navy-900 transition-transform lg:translate-x-0",
          aberto ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between gap-2 px-5 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand shadow-glow">
              <Truck className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold leading-tight text-ink">
                Desterro<span className="text-brand"> Tracker</span>
              </p>
              <p className="text-[11px] text-ink-faint">Logística em tempo real</p>
            </div>
          </div>
          <button
            onClick={onFechar}
            className="rounded-lg p-1 text-ink-muted hover:bg-navy-700 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-2">
          {itens.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={onFechar}
                className={({ isActive }) =>
                  cn(
                    "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-navy-700 text-ink"
                      : "text-ink-muted hover:bg-navy-800 hover:text-ink"
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={cn(
                        "h-[18px] w-[18px] shrink-0",
                        isActive ? "text-brand" : "text-ink-faint group-hover:text-ink-muted"
                      )}
                    />
                    <span className="flex-1">{item.label}</span>
                    {item.to === "/alertas" && alertasNaoLidos > 0 && (
                      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1.5 text-[10px] font-bold text-white">
                        {alertasNaoLidos}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="m-3 rounded-xl border border-line bg-navy-850 p-4">
          <p className="text-xs font-semibold text-ink">Desterro Transportes</p>
          <p className="mt-1 text-[11px] leading-relaxed text-ink-muted">
            Transporte rodoviário de metais e MDF. 16 colaboradores · frota agregada.
          </p>
        </div>
      </aside>
    </>
  );
}
