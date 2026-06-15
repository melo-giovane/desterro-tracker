import { useEffect } from "react";
import { useStore } from "./useStore";

/** Liga o "motor de tempo real": avança a simulação a cada intervalo. */
export function useSimulation(intervaloMs = 2000) {
  const rodando = useStore((s) => s.rodando);
  const avancar = useStore((s) => s.avancarSimulacao);

  useEffect(() => {
    if (!rodando) return;
    const id = window.setInterval(() => avancar(), intervaloMs);
    return () => window.clearInterval(id);
  }, [rodando, avancar, intervaloMs]);
}
