import { Menu, Pause, Play, Search, Radio } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useStore } from "@/store/useStore";
import { useEffect, useState } from "react";
import { fmtHora } from "@/lib/format";

export function Topbar({ onMenu }: { onMenu: () => void }) {
  const rodando = useStore((s) => s.rodando);
  const setRodando = useStore((s) => s.setRodando);
  const tick = useStore((s) => s.tick);
  const [agora, setAgora] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => setAgora(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-navy-900/80 px-4 backdrop-blur-md lg:px-6">
      <button
        onClick={onMenu}
        className="rounded-lg p-2 text-ink-muted hover:bg-navy-700 lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="relative hidden max-w-md flex-1 sm:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
        <input
          placeholder="Buscar cargas, motoristas, placas…"
          className="h-9 w-full rounded-lg border border-line bg-navy-850 pl-9 pr-3 text-sm text-ink placeholder:text-ink-faint focus:border-brand/50 focus:outline-none focus:ring-2 focus:ring-brand/20"
        />
      </div>

      <div className="flex flex-1 items-center justify-end gap-2 sm:flex-none">
        <div className="hidden items-center gap-2 rounded-lg border border-line bg-navy-850 px-3 py-1.5 md:flex">
          <span className="relative flex h-2 w-2">
            {rodando && (
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            )}
            <span
              className={`relative inline-flex h-2 w-2 rounded-full ${
                rodando ? "bg-emerald-400" : "bg-ink-faint"
              }`}
            />
          </span>
          <span className="text-xs font-medium text-ink-muted">
            {rodando ? "Tempo real ativo" : "Pausado"}
          </span>
          <span className="text-xs text-ink-faint">· {fmtHora(agora)}</span>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => setRodando(!rodando)}
          title={rodando ? "Pausar simulação" : "Retomar simulação"}
        >
          {rodando ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          <span className="hidden sm:inline">{rodando ? "Pausar" : "Retomar"}</span>
        </Button>

        <div className="hidden items-center gap-1.5 rounded-lg bg-brand/10 px-2.5 py-1.5 text-brand-400 lg:flex">
          <Radio className="h-3.5 w-3.5" />
          <span className="text-[11px] font-semibold tabular-nums">{tick}</span>
        </div>
      </div>
    </header>
  );
}
