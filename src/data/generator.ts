import type {
  Carga,
  CargaStatus,
  Cidade,
  EventoRota,
  Motorista,
  MotoristaStatus,
  TipoCarga,
  Veiculo,
  VeiculoStatus,
} from "@/types";
import { CIDADES } from "./cidades";
import { gerarRota, haversine, mulberry32, pointOnPath } from "@/lib/geo";

const NOMES = [
  "Carlos Eduardo Silva", "Marcos Antônio Pereira", "José Roberto Souza",
  "Antônio Carlos Lima", "Paulo Sérgio Oliveira", "Francisco das Chagas",
  "João Batista Santos", "Luiz Fernando Costa", "Sebastião Ferreira",
  "Rafael Augusto Gomes", "Anderson Ribeiro", "Cláudio Henrique Alves",
  "Geraldo Magela Rocha", "Valdir Aparecido Dias", "Rogério Nunes",
  "Edson Luiz Cardoso", "Wellington Barbosa", "Adriano Martins",
  "Fábio Henrique Moura", "Gilberto Camargo", "Robson de Jesus",
  "Maurício Teixeira", "Reginaldo Pinto", "Cleber Andrade",
  "Douglas Vieira", "Sandro Mendes", "Vagner Cunha",
  "Émerson Tavares", "Nelson Bonfim", "Ivan Carvalho",
  "Juliana Prado", "Patrícia Fonseca",
];

const MODELOS = [
  { modelo: "Scania R450", tipo: "Cavalo + Carreta", peso: 30000 },
  { modelo: "Volvo FH 540", tipo: "Cavalo + Carreta", peso: 32000 },
  { modelo: "Mercedes-Benz Actros 2651", tipo: "Cavalo + Carreta", peso: 31000 },
  { modelo: "DAF XF 480", tipo: "Cavalo + Carreta", peso: 30000 },
  { modelo: "Iveco S-Way 540", tipo: "Cavalo + Carreta", peso: 30000 },
  { modelo: "Volkswagen Constellation 25.460", tipo: "Truck", peso: 23000 },
  { modelo: "Ford Cargo 2429", tipo: "Truck", peso: 23000 },
  { modelo: "Scania P310", tipo: "Bitruck", peso: 26000 },
];

const CLIENTES = [
  "Gerdau S.A.", "ArcelorMittal Brasil", "CSN — Cia Siderúrgica",
  "Usiminas", "Aperam South America", "Duratex / Dexco",
  "Eucatex", "Berneck Painéis", "Guararapes / Florestal",
  "Votorantim Siderurgia", "Aço Verde do Brasil", "Belgo Bekaert",
  "Tuper Tubos", "Marcopolo S.A.", "Randon Implementos",
  "Tramontina", "Whirlpool / Brastemp", "Metalúrgica Riosulense",
  "Coteminas", "Klabin S.A.",
];

const TIPOS_CARGA: TipoCarga[] = [
  "Chapas de Aço", "Bobinas de Aço", "Chapas de MDF",
  "Perfis Metálicos", "Bobinas de Alumínio",
];

const UF_PLACA = ["SP", "PR", "SC", "RS", "MG", "GO", "BA", "PE"];

function escolha<T>(rand: () => number, arr: T[]): T {
  return arr[Math.floor(rand() * arr.length)];
}

function gerarPlaca(rand: () => number): string {
  const L = () => String.fromCharCode(65 + Math.floor(rand() * 26));
  const D = () => Math.floor(rand() * 10);
  // padrão Mercosul LLLNLNN
  return `${L()}${L()}${L()}${D()}${L()}${D()}${D()}`;
}

function gerarTelefone(rand: () => number): string {
  const ddd = escolha(rand, ["11", "41", "47", "51", "31", "62", "71", "81"]);
  const n = () => Math.floor(rand() * 10);
  return `(${ddd}) 9${n()}${n()}${n()}${n()}-${n()}${n()}${n()}${n()}`;
}

function gerarCPF(rand: () => number): string {
  const d = () => Math.floor(rand() * 10);
  return `${d()}${d()}${d()}.${d()}${d()}${d()}.${d()}${d()}${d()}-${d()}${d()}`;
}

export interface DadosDemo {
  motoristas: Motorista[];
  veiculos: Veiculo[];
  cargas: Carga[];
}

const STATUS_VEICULO: VeiculoStatus[] = [
  "Em movimento", "Parado", "Ocioso", "Manutenção",
];

export function gerarDados(seed = 42): DadosDemo {
  const rand = mulberry32(seed);
  const agora = Date.now();

  // ---- Motoristas ----
  const motoristas: Motorista[] = [];
  for (let i = 0; i < 30; i++) {
    const cidade = escolha(rand, CIDADES);
    // todos começam disponíveis; a alocação de cargas define quem viaja
    const status: MotoristaStatus = "Disponível";
    motoristas.push({
      id: `mot-${i + 1}`,
      nome: NOMES[i % NOMES.length],
      telefone: gerarTelefone(rand),
      cpf: gerarCPF(rand),
      cnh: `${Math.floor(rand() * 90000000000 + 10000000000)}`,
      status,
      regiao: cidade.regiao,
      cidadeBase: `${cidade.nome}/${cidade.uf}`,
      pos: { lat: cidade.lat + (rand() - 0.5) * 0.4, lng: cidade.lng + (rand() - 0.5) * 0.4 },
      ultimaAtualizacao: agora - Math.floor(rand() * 1000 * 60 * 30),
      avaliacao: Math.round((3.8 + rand() * 1.2) * 10) / 10,
      viagensConcluidas: Math.floor(rand() * 280 + 20),
      kmRodados: Math.floor(rand() * 480000 + 20000),
      veiculoId: null,
      fotoSeed: `${i + 1}`,
    });
  }

  // ---- Veículos (50) ----
  const veiculos: Veiculo[] = [];
  for (let i = 0; i < 50; i++) {
    const cidade = escolha(rand, CIDADES);
    const m = escolha(rand, MODELOS);
    const status = escolha(rand, STATUS_VEICULO);
    const odometro = Math.floor(rand() * 600000 + 40000);
    veiculos.push({
      id: `vei-${i + 1}`,
      placa: gerarPlaca(rand),
      modelo: m.modelo,
      tipo: m.tipo,
      ano: 2015 + Math.floor(rand() * 10),
      status,
      motoristaId: null,
      pos: { lat: cidade.lat + (rand() - 0.5) * 0.5, lng: cidade.lng + (rand() - 0.5) * 0.5 },
      velocidade: status === "Em movimento" ? Math.floor(rand() * 50 + 55) : 0,
      rumo: Math.floor(rand() * 360),
      ultimaAtualizacao: agora - Math.floor(rand() * 1000 * 60 * 20),
      odometro,
      proximaManutencaoKm: odometro + Math.floor(rand() * 15000 + 500),
      regiao: cidade.regiao,
      cargaId: null,
    });
  }

  // ---- Cargas (100) ----
  const cargas: Carga[] = [];
  const distribuicaoStatus: CargaStatus[] = [];
  // Cargas ativas (que consomem motorista): coleta + trânsito + atrasada = 21,
  // mantendo ~9 motoristas livres para o módulo de Oportunidades.
  const pushN = (n: number, s: CargaStatus) => {
    for (let k = 0; k < n; k++) distribuicaoStatus.push(s);
  };
  pushN(31, "Disponível");
  pushN(3, "Em coleta");
  pushN(15, "Em trânsito");
  pushN(48, "Entregue");
  pushN(3, "Atrasada");

  let veiculoCursor = 0;

  for (let i = 0; i < 100; i++) {
    let origem: Cidade = escolha(rand, CIDADES);
    let destino: Cidade = escolha(rand, CIDADES);
    let guard = 0;
    while (
      (destino.nome === origem.nome ||
        haversine(origem, destino) < 250) &&
      guard++ < 20
    ) {
      destino = escolha(rand, CIDADES);
    }

    const status = distribuicaoStatus[i] ?? "Disponível";
    const rota = gerarRota(origem, destino, rand());
    const distanciaKm = haversine(origem, destino);
    const tipo = escolha(rand, TIPOS_CARGA);
    const pesoKg = Math.floor((rand() * 22 + 6)) * 1000;
    const valorBase = distanciaKm * (rand() * 4 + 5) + pesoKg * 0.35;

    const criadaEm = agora - Math.floor(rand() * 1000 * 60 * 60 * 72);
    const duracaoMs = (distanciaKm / 65) * 3600 * 1000; // ~65 km/h médio
    const coletaPrevista = criadaEm + 1000 * 60 * 60 * (rand() * 8 + 2);
    const entregaPrevista = coletaPrevista + duracaoMs;

    let progresso = 0;
    if (status === "Em coleta") progresso = 0.02 + rand() * 0.05;
    else if (status === "Em trânsito") progresso = 0.12 + rand() * 0.7;
    else if (status === "Atrasada") progresso = 0.4 + rand() * 0.45;
    else if (status === "Entregue") progresso = 1;

    let veiculoId: string | null = null;
    let motoristaId: string | null = null;
    const precisaVeiculo =
      status === "Em trânsito" || status === "Atrasada" || status === "Em coleta";
    if (precisaVeiculo) {
      // pega o próximo veículo livre, atribui motorista
      while (veiculoCursor < veiculos.length && veiculos[veiculoCursor].cargaId) {
        veiculoCursor++;
      }
      const v = veiculos[veiculoCursor % veiculos.length];
      if (v && !v.cargaId) {
        veiculoId = v.id;
        v.cargaId = `car-${i + 1}`;
        v.status = status === "Em coleta" ? "Parado" : "Em movimento";
        v.regiao = origem.regiao;
        if (!v.motoristaId) {
          const livre = motoristas.find(
            (mm) => !mm.veiculoId && mm.status !== "Offline"
          );
          if (livre) {
            v.motoristaId = livre.id;
            livre.veiculoId = v.id;
            livre.status = "Em viagem";
          }
        }
        motoristaId = v.motoristaId;
        const ponto = pointOnPath(rota, progresso);
        v.pos = ponto.pos;
        v.rumo = ponto.rumo;
        v.velocidade = status === "Em coleta" ? 0 : Math.floor(rand() * 35 + 60);
        v.regiao = origem.regiao;
        // sincroniza posição do motorista
        const mot = motoristas.find((mm) => mm.id === motoristaId);
        if (mot) {
          mot.pos = ponto.pos;
          mot.regiao = origem.regiao;
        }
      }
    }

    const posAtual =
      progresso > 0 && progresso < 1 ? pointOnPath(rota, progresso).pos : null;
    const restanteKm = distanciaKm * (1 - progresso);
    const eta =
      status === "Em trânsito" || status === "Em coleta"
        ? agora + (restanteKm / 65) * 3600 * 1000
        : status === "Atrasada"
        ? agora + (restanteKm / 55) * 3600 * 1000
        : null;

    const eventos: EventoRota[] = [
      {
        ts: criadaEm,
        titulo: "Carga cadastrada",
        descricao: `Pedido ${`CRG-${String(i + 1).padStart(4, "0")}`} registrado no sistema.`,
        tipo: "info",
      },
    ];
    if (status !== "Disponível") {
      eventos.push({
        ts: coletaPrevista,
        titulo: "Coleta realizada",
        descricao: `Carga coletada em ${origem.nome}/${origem.uf}.`,
        tipo: "sucesso",
      });
    }
    if (status === "Em trânsito" || status === "Atrasada" || status === "Entregue") {
      eventos.push({
        ts: coletaPrevista + duracaoMs * 0.4,
        titulo: "Em rota",
        descricao: `Veículo seguindo rumo a ${destino.nome}/${destino.uf}.`,
        tipo: "info",
      });
    }
    if (status === "Atrasada") {
      eventos.push({
        ts: agora - 1000 * 60 * 90,
        titulo: "Atraso detectado",
        descricao: "ETA ultrapassou a janela de entrega prevista.",
        tipo: "alerta",
      });
    }
    if (status === "Entregue") {
      eventos.push({
        ts: entregaPrevista,
        titulo: "Entrega concluída",
        descricao: `Carga entregue em ${destino.nome}/${destino.uf}.`,
        tipo: "sucesso",
      });
    }

    cargas.push({
      id: `car-${i + 1}`,
      codigo: `CRG-${String(i + 1).padStart(4, "0")}`,
      cliente: escolha(rand, CLIENTES),
      tipo,
      pesoKg,
      valor: Math.round(valorBase),
      status,
      origem,
      destino,
      veiculoId,
      motoristaId,
      criadaEm,
      coletaPrevista,
      entregaPrevista,
      progresso,
      rota,
      posAtual,
      distanciaKm,
      eta,
      eventos: eventos.sort((a, b) => a.ts - b.ts),
    });
  }

  // ajusta status de motoristas/veículos não atribuídos
  veiculos.forEach((v) => {
    if (!v.cargaId && v.status === "Em movimento") {
      v.status = escolha(rand, ["Ocioso", "Parado"]);
      v.velocidade = 0;
    }
  });

  // diversifica os motoristas livres: maioria disponível, alguns em descanso/offline
  const livres = motoristas.filter((m) => !m.veiculoId);
  livres.forEach((m, idx) => {
    if (idx % 5 === 4) m.status = "Offline";
    else if (idx % 5 === 3) m.status = "Descanso";
    else m.status = "Disponível";
  });

  return { motoristas, veiculos, cargas };
}
