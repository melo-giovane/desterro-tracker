import { useState } from "react";
import { Route, Routes } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { useSimulation } from "@/store/useSimulation";
import Dashboard from "@/features/dashboard/Dashboard";
import Frota from "@/features/frota/Frota";
import Cargas from "@/features/cargas/Cargas";
import Motoristas from "@/features/motoristas/Motoristas";
import Oportunidades from "@/features/oportunidades/Oportunidades";
import Rastreamento from "@/features/rastreamento/Rastreamento";
import Alertas from "@/features/alertas/Alertas";

export default function App() {
  const [menuAberto, setMenuAberto] = useState(false);
  useSimulation(2000);

  return (
    <div className="min-h-screen lg:pl-64">
      <Sidebar aberto={menuAberto} onFechar={() => setMenuAberto(false)} />
      <Topbar onMenu={() => setMenuAberto(true)} />
      <main className="mx-auto max-w-[1500px] px-4 py-6 lg:px-8">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/frota" element={<Frota />} />
          <Route path="/cargas" element={<Cargas />} />
          <Route path="/motoristas" element={<Motoristas />} />
          <Route path="/oportunidades" element={<Oportunidades />} />
          <Route path="/rastreamento" element={<Rastreamento />} />
          <Route path="/rastreamento/:cargaId" element={<Rastreamento />} />
          <Route path="/alertas" element={<Alertas />} />
        </Routes>
      </main>
    </div>
  );
}
