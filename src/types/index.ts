export type Regiao =
  | "Sudeste"
  | "Sul"
  | "Centro-Oeste"
  | "Nordeste"
  | "Norte";

export interface Coord {
  lat: number;
  lng: number;
}

export interface Cidade {
  nome: string;
  uf: string;
  regiao: Regiao;
  lat: number;
  lng: number;
}

export type CargaStatus =
  | "Disponível"
  | "Em coleta"
  | "Em trânsito"
  | "Entregue"
  | "Atrasada";

export type TipoCarga =
  | "Chapas de Aço"
  | "Bobinas de Aço"
  | "Chapas de MDF"
  | "Perfis Metálicos"
  | "Bobinas de Alumínio";

export type MotoristaStatus = "Disponível" | "Em viagem" | "Descanso" | "Offline";

export type VeiculoStatus = "Em movimento" | "Parado" | "Ocioso" | "Manutenção";

export interface Motorista {
  id: string;
  nome: string;
  telefone: string;
  cpf: string;
  cnh: string;
  status: MotoristaStatus;
  regiao: Regiao;
  cidadeBase: string;
  pos: Coord;
  ultimaAtualizacao: number;
  avaliacao: number;
  viagensConcluidas: number;
  kmRodados: number;
  veiculoId: string | null;
  fotoSeed: string;
}

export interface Veiculo {
  id: string;
  placa: string;
  modelo: string;
  tipo: string;
  ano: number;
  status: VeiculoStatus;
  motoristaId: string | null;
  pos: Coord;
  velocidade: number;
  rumo: number;
  ultimaAtualizacao: number;
  odometro: number;
  proximaManutencaoKm: number;
  regiao: Regiao;
  cargaId: string | null;
}

export interface EventoRota {
  ts: number;
  titulo: string;
  descricao: string;
  tipo: "info" | "sucesso" | "alerta" | "erro";
}

export interface Carga {
  id: string;
  codigo: string;
  cliente: string;
  tipo: TipoCarga;
  pesoKg: number;
  valor: number;
  status: CargaStatus;
  origem: Cidade;
  destino: Cidade;
  veiculoId: string | null;
  motoristaId: string | null;
  criadaEm: number;
  coletaPrevista: number;
  entregaPrevista: number;
  progresso: number; // 0..1 ao longo da rota
  rota: Coord[];
  posAtual: Coord | null;
  distanciaKm: number;
  eta: number | null;
  eventos: EventoRota[];
}

export type AlertaTipo =
  | "parado"
  | "desvio"
  | "atraso"
  | "sem_atualizacao"
  | "manutencao";

export type AlertaSeveridade = "alta" | "media" | "baixa";

export interface Alerta {
  id: string;
  tipo: AlertaTipo;
  severidade: AlertaSeveridade;
  titulo: string;
  descricao: string;
  ts: number;
  veiculoId: string | null;
  motoristaId: string | null;
  cargaId: string | null;
  lido: boolean;
}
