import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import type {
  Alerta,
  Carga,
  CargaStatus,
  Cidade,
  Motorista,
  TipoCarga,
  Veiculo,
} from "@/types";
import { gerarDados } from "@/data/generator";
import { gerarRota, haversine, pointOnPath } from "@/lib/geo";
import { mulberry32 } from "@/lib/geo";

const dados = gerarDados(42);

let alertaSeq = 0;
function novoAlerta(a: Omit<Alerta, "id" | "ts" | "lido">): Alerta {
  return { ...a, id: `alr-${++alertaSeq}`, ts: Date.now(), lido: false };
}

// alertas iniciais derivados do estado
function alertasIniciais(
  veiculos: Veiculo[],
  cargas: Carga[],
  motoristas: Motorista[]
): Alerta[] {
  const lista: Alerta[] = [];
  cargas
    .filter((c) => c.status === "Atrasada")
    .slice(0, 6)
    .forEach((c) => {
      lista.push(
        novoAlerta({
          tipo: "atraso",
          severidade: "alta",
          titulo: `Entrega atrasada — ${c.codigo}`,
          descricao: `Carga de ${c.origem.nome} para ${c.destino.nome} (${c.cliente}) está fora da janela prevista.`,
          veiculoId: c.veiculoId,
          motoristaId: c.motoristaId,
          cargaId: c.id,
        })
      );
    });
  veiculos
    .filter((v) => v.status === "Manutenção")
    .slice(0, 3)
    .forEach((v) => {
      lista.push(
        novoAlerta({
          tipo: "manutencao",
          severidade: "media",
          titulo: `Manutenção em andamento — ${v.placa}`,
          descricao: `${v.modelo} fora de operação para manutenção preventiva.`,
          veiculoId: v.id,
          motoristaId: v.motoristaId,
          cargaId: v.cargaId,
        })
      );
    });
  veiculos
    .filter((v) => v.odometro >= v.proximaManutencaoKm - 3000 && v.status !== "Manutenção")
    .slice(0, 3)
    .forEach((v) => {
      lista.push(
        novoAlerta({
          tipo: "manutencao",
          severidade: "baixa",
          titulo: `Manutenção preventiva próxima — ${v.placa}`,
          descricao: `Faltam ${Math.max(0, v.proximaManutencaoKm - v.odometro)} km para a revisão programada.`,
          veiculoId: v.id,
          motoristaId: v.motoristaId,
          cargaId: null,
        })
      );
    });
  const semAtualizacao = motoristas.filter(
    (m) => Date.now() - m.ultimaAtualizacao > 1000 * 60 * 18 && m.status !== "Offline"
  );
  semAtualizacao.slice(0, 2).forEach((m) => {
    lista.push(
      novoAlerta({
        tipo: "sem_atualizacao",
        severidade: "media",
        titulo: `Sem atualização de posição — ${m.nome}`,
        descricao: `Última posição recebida há mais de 18 minutos.`,
        veiculoId: m.veiculoId,
        motoristaId: m.id,
        cargaId: null,
      })
    );
  });
  return lista.sort((a, b) => b.ts - a.ts);
}

interface State {
  motoristas: Motorista[];
  veiculos: Veiculo[];
  cargas: Carga[];
  alertas: Alerta[];
  rodando: boolean;
  tick: number;
  // ações
  setRodando: (v: boolean) => void;
  avancarSimulacao: () => void;
  marcarAlertaLido: (id: string) => void;
  marcarTodosLidos: () => void;
  adicionarCarga: (input: NovaCargaInput) => void;
  adicionarMotorista: (input: NovoMotoristaInput) => void;
  atribuirCarga: (cargaId: string, motoristaId: string) => void;
}

export interface NovaCargaInput {
  cliente: string;
  tipo: TipoCarga;
  pesoKg: number;
  origem: Cidade;
  destino: Cidade;
}

export interface NovoMotoristaInput {
  nome: string;
  telefone: string;
  cidadeBase: Cidade;
}

const tickRand = mulberry32(1337);

export const useStore = create<State>((set, get) => ({
  motoristas: dados.motoristas,
  veiculos: dados.veiculos,
  cargas: dados.cargas,
  alertas: alertasIniciais(dados.veiculos, dados.cargas, dados.motoristas),
  rodando: true,
  tick: 0,

  setRodando: (v) => set({ rodando: v }),

  marcarAlertaLido: (id) =>
    set((s) => ({
      alertas: s.alertas.map((a) => (a.id === id ? { ...a, lido: true } : a)),
    })),

  marcarTodosLidos: () =>
    set((s) => ({ alertas: s.alertas.map((a) => ({ ...a, lido: true })) })),

  adicionarCarga: (input) =>
    set((s) => {
      const n = s.cargas.length + 1;
      const distanciaKm = haversine(input.origem, input.destino);
      const agora = Date.now();
      const nova: Carga = {
        id: `car-${n}-${agora}`,
        codigo: `CRG-${String(n).padStart(4, "0")}`,
        cliente: input.cliente,
        tipo: input.tipo,
        pesoKg: input.pesoKg,
        valor: Math.round(distanciaKm * 7 + input.pesoKg * 0.35),
        status: "Disponível",
        origem: input.origem,
        destino: input.destino,
        veiculoId: null,
        motoristaId: null,
        criadaEm: agora,
        coletaPrevista: agora + 1000 * 60 * 60 * 4,
        entregaPrevista: agora + (distanciaKm / 65) * 3600 * 1000,
        progresso: 0,
        rota: gerarRota(input.origem, input.destino, tickRand()),
        posAtual: null,
        distanciaKm,
        eta: null,
        eventos: [
          {
            ts: agora,
            titulo: "Carga cadastrada",
            descricao: `Pedido registrado para ${input.cliente}.`,
            tipo: "info",
          },
        ],
      };
      return { cargas: [nova, ...s.cargas] };
    }),

  adicionarMotorista: (input) =>
    set((s) => {
      const n = s.motoristas.length + 1;
      const novo: Motorista = {
        id: `mot-${n}-${Date.now()}`,
        nome: input.nome,
        telefone: input.telefone,
        cpf: "000.000.000-00",
        cnh: "—",
        status: "Disponível",
        regiao: input.cidadeBase.regiao,
        cidadeBase: `${input.cidadeBase.nome}/${input.cidadeBase.uf}`,
        pos: { lat: input.cidadeBase.lat, lng: input.cidadeBase.lng },
        ultimaAtualizacao: Date.now(),
        avaliacao: 5,
        viagensConcluidas: 0,
        kmRodados: 0,
        veiculoId: null,
        fotoSeed: `${n}`,
      };
      return { motoristas: [novo, ...s.motoristas] };
    }),

  atribuirCarga: (cargaId, motoristaId) =>
    set((s) => {
      const carga = s.cargas.find((c) => c.id === cargaId);
      const motorista = s.motoristas.find((m) => m.id === motoristaId);
      if (!carga || !motorista) return {};
      // procura um veículo: o do motorista, ou um ocioso
      let veiculo =
        s.veiculos.find((v) => v.id === motorista.veiculoId && !v.cargaId) ||
        s.veiculos.find((v) => !v.cargaId && v.status !== "Manutenção");
      const agora = Date.now();
      const veiculos = veiculo
        ? s.veiculos.map((v) =>
            v.id === veiculo!.id
              ? {
                  ...v,
                  cargaId,
                  motoristaId,
                  status: "Em movimento" as const,
                  pos: { ...carga.origem },
                  regiao: carga.origem.regiao,
                  velocidade: 72,
                }
              : v
          )
        : s.veiculos;
      const motoristas = s.motoristas.map((m) =>
        m.id === motoristaId
          ? {
              ...m,
              status: "Em viagem" as const,
              veiculoId: veiculo ? veiculo.id : m.veiculoId,
              pos: { ...carga.origem },
              regiao: carga.origem.regiao,
              ultimaAtualizacao: agora,
            }
          : m
      );
      const cargas = s.cargas.map((c) =>
        c.id === cargaId
          ? {
              ...c,
              status: "Em coleta" as const,
              motoristaId,
              veiculoId: veiculo ? veiculo.id : null,
              progresso: 0.01,
              eta: agora + (c.distanciaKm / 65) * 3600 * 1000,
              eventos: [
                ...c.eventos,
                {
                  ts: agora,
                  titulo: "Motorista alocado",
                  descricao: `${motorista.nome} aceitou a carga e segue para coleta.`,
                  tipo: "sucesso" as const,
                },
              ],
            }
          : c
      );
      const alerta = novoAlerta({
        tipo: "parado",
        severidade: "baixa",
        titulo: `Carga alocada — ${carga.codigo}`,
        descricao: `${motorista.nome} foi designado para a carga ${carga.codigo}.`,
        veiculoId: veiculo ? veiculo.id : null,
        motoristaId,
        cargaId,
      });
      return { veiculos, motoristas, cargas, alertas: [alerta, ...s.alertas] };
    }),

  avancarSimulacao: () =>
    set((s) => {
      const agora = Date.now();
      const novosAlertas: Alerta[] = [];

      const cargas = s.cargas.map((c) => {
        if (c.status !== "Em trânsito" && c.status !== "Atrasada" && c.status !== "Em coleta")
          return c;
        // avança progresso proporcional à distância (mais lento em rotas longas)
        const passo = (1.4 / Math.max(c.distanciaKm, 120)) * (0.6 + tickRand() * 0.8);
        let progresso = Math.min(1, c.progresso + passo);
        let status: CargaStatus = c.status;
        let eventos = c.eventos;

        if (c.status === "Em coleta" && progresso > 0.04) {
          status = "Em trânsito";
        }

        if (progresso >= 1) {
          status = "Entregue";
          progresso = 1;
          eventos = [
            ...c.eventos,
            {
              ts: agora,
              titulo: "Entrega concluída",
              descricao: `Carga entregue em ${c.destino.nome}/${c.destino.uf}.`,
              tipo: "sucesso" as const,
            },
          ];
          novosAlertas.push(
            novoAlerta({
              tipo: "parado",
              severidade: "baixa",
              titulo: `Entrega concluída — ${c.codigo}`,
              descricao: `${c.cliente}: carga entregue em ${c.destino.nome}/${c.destino.uf}.`,
              veiculoId: c.veiculoId,
              motoristaId: c.motoristaId,
              cargaId: c.id,
            })
          );
        }

        const restanteKm = c.distanciaKm * (1 - progresso);
        const eta = status === "Entregue" ? null : agora + (restanteKm / 62) * 3600 * 1000;
        const posAtual = progresso < 1 ? pointOnPath(c.rota, progresso).pos : c.destino;

        return { ...c, progresso, status, eta, posAtual, eventos };
      });

      // mapa carga -> nova posição
      const posPorCarga = new Map<string, { pos: { lat: number; lng: number }; rumo: number; entregue: boolean }>();
      cargas.forEach((c) => {
        if (c.veiculoId && (c.status === "Em trânsito" || c.status === "Atrasada" || c.status === "Em coleta")) {
          const p = pointOnPath(c.rota, c.progresso);
          posPorCarga.set(c.veiculoId, { pos: p.pos, rumo: p.rumo, entregue: false });
        } else if (c.veiculoId && c.status === "Entregue") {
          posPorCarga.set(c.veiculoId, { pos: c.destino, rumo: 0, entregue: true });
        }
      });

      const veiculos = s.veiculos.map((v) => {
        const upd = posPorCarga.get(v.cargaId ?? "");
        if (upd) {
          if (upd.entregue) {
            return {
              ...v,
              pos: { lat: upd.pos.lat, lng: upd.pos.lng },
              status: "Ocioso" as const,
              velocidade: 0,
              cargaId: null,
              ultimaAtualizacao: agora,
            };
          }
          const vel = Math.max(0, Math.min(95, v.velocidade + (tickRand() - 0.5) * 10));
          return {
            ...v,
            pos: { lat: upd.pos.lat, lng: upd.pos.lng },
            rumo: upd.rumo,
            velocidade: Math.round(vel),
            status: "Em movimento" as const,
            odometro: v.odometro + Math.round(tickRand() * 3),
            ultimaAtualizacao: agora,
          };
        }
        return v;
      });

      // motoristas acompanham seus veículos
      const veiculoPorId = new Map(veiculos.map((v) => [v.id, v]));
      const motoristas = s.motoristas.map((m) => {
        if (m.veiculoId) {
          const v = veiculoPorId.get(m.veiculoId);
          if (v && v.status === "Em movimento") {
            return { ...m, pos: { ...v.pos }, ultimaAtualizacao: agora };
          }
        }
        return m;
      });

      // alerta esporádico de caminhão parado / desvio
      if (tickRand() > 0.86) {
        const ativos = veiculos.filter((v) => v.status === "Em movimento");
        if (ativos.length) {
          const v = ativos[Math.floor(tickRand() * ativos.length)];
          const desvio = tickRand() > 0.5;
          novosAlertas.push(
            novoAlerta({
              tipo: desvio ? "desvio" : "parado",
              severidade: desvio ? "media" : "media",
              titulo: desvio
                ? `Desvio de rota — ${v.placa}`
                : `Caminhão parado — ${v.placa}`,
              descricao: desvio
                ? `${v.modelo} divergiu do trajeto planejado por mais de 5 km.`
                : `${v.modelo} parado há mais de 25 min fora de ponto de parada previsto.`,
              veiculoId: v.id,
              motoristaId: v.motoristaId,
              cargaId: v.cargaId,
            })
          );
        }
      }

      const alertas =
        novosAlertas.length > 0
          ? [...novosAlertas, ...s.alertas].slice(0, 60)
          : s.alertas;

      return { cargas, veiculos, motoristas, alertas, tick: s.tick + 1 };
    }),
}));

// seletores derivados
export function useMetricas() {
  return useStore(
    useShallow((s) => {
    const emTransito = s.cargas.filter(
      (c) => c.status === "Em trânsito" || c.status === "Em coleta"
    ).length;
    const entregues = s.cargas.filter((c) => c.status === "Entregue").length;
    const atrasadas = s.cargas.filter((c) => c.status === "Atrasada").length;
    const disponiveis = s.cargas.filter((c) => c.status === "Disponível").length;
    const caminhoesAtivos = s.veiculos.filter((v) => v.status === "Em movimento").length;
    const motoristasDisponiveis = s.motoristas.filter(
      (m) => m.status === "Disponível"
    ).length;
    const alertasNaoLidos = s.alertas.filter((a) => !a.lido).length;
    return {
      emTransito,
      entregues,
      atrasadas,
      disponiveis,
      caminhoesAtivos,
      motoristasDisponiveis,
      alertasNaoLidos,
      totalCargas: s.cargas.length,
      totalVeiculos: s.veiculos.length,
      totalMotoristas: s.motoristas.length,
    };
    })
  );
}
