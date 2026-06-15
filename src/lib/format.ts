export function fmtMoeda(v: number): string {
  return v.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });
}

export function fmtPeso(kg: number): string {
  if (kg >= 1000) return `${(kg / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} t`;
  return `${kg.toLocaleString("pt-BR")} kg`;
}

export function fmtKm(km: number): string {
  return `${Math.round(km).toLocaleString("pt-BR")} km`;
}

export function fmtNum(n: number): string {
  return n.toLocaleString("pt-BR");
}

export function fmtHora(ts: number): string {
  return new Date(ts).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function fmtData(ts: number): string {
  return new Date(ts).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function fmtDataHora(ts: number): string {
  return `${fmtData(ts)} ${fmtHora(ts)}`;
}

/** "há 3 min", "há 2 h", etc. */
export function tempoRelativo(ts: number, agora = Date.now()): string {
  const diff = Math.max(0, agora - ts);
  const s = Math.floor(diff / 1000);
  if (s < 60) return `há ${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `há ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `há ${h} h`;
  const d = Math.floor(h / 24);
  return `há ${d} d`;
}

/** ETA formatado a partir de um timestamp futuro. */
export function fmtEta(ts: number | null, agora = Date.now()): string {
  if (!ts) return "—";
  const diff = ts - agora;
  if (diff <= 0) return "Chegando";
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const rm = m % 60;
  if (h < 24) return `${h}h ${rm}min`;
  const d = Math.floor(h / 24);
  return `${d}d ${h % 24}h`;
}

export function primeiroNome(nome: string): string {
  return nome.split(" ")[0];
}

export function iniciais(nome: string): string {
  const partes = nome.trim().split(" ");
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
}
