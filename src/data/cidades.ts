import type { Cidade } from "@/types";

/** Polos logísticos relevantes para metais e MDF no Brasil. */
export const CIDADES: Cidade[] = [
  // Sudeste
  { nome: "São Paulo", uf: "SP", regiao: "Sudeste", lat: -23.5505, lng: -46.6333 },
  { nome: "Campinas", uf: "SP", regiao: "Sudeste", lat: -22.9099, lng: -47.0626 },
  { nome: "Guarulhos", uf: "SP", regiao: "Sudeste", lat: -23.4543, lng: -46.5337 },
  { nome: "Santos", uf: "SP", regiao: "Sudeste", lat: -23.9608, lng: -46.3336 },
  { nome: "São José dos Campos", uf: "SP", regiao: "Sudeste", lat: -23.1896, lng: -45.8841 },
  { nome: "Ribeirão Preto", uf: "SP", regiao: "Sudeste", lat: -21.1775, lng: -47.8103 },
  { nome: "Sorocaba", uf: "SP", regiao: "Sudeste", lat: -23.5015, lng: -47.4526 },
  { nome: "Rio de Janeiro", uf: "RJ", regiao: "Sudeste", lat: -22.9068, lng: -43.1729 },
  { nome: "Volta Redonda", uf: "RJ", regiao: "Sudeste", lat: -22.5231, lng: -44.1041 },
  { nome: "Belo Horizonte", uf: "MG", regiao: "Sudeste", lat: -19.9167, lng: -43.9345 },
  { nome: "Betim", uf: "MG", regiao: "Sudeste", lat: -19.9678, lng: -44.1986 },
  { nome: "Ipatinga", uf: "MG", regiao: "Sudeste", lat: -19.4683, lng: -42.5369 },
  { nome: "Uberlândia", uf: "MG", regiao: "Sudeste", lat: -18.9186, lng: -48.2772 },
  { nome: "Vitória", uf: "ES", regiao: "Sudeste", lat: -20.3155, lng: -40.3128 },
  { nome: "Serra", uf: "ES", regiao: "Sudeste", lat: -20.1211, lng: -40.3075 },

  // Sul
  { nome: "Curitiba", uf: "PR", regiao: "Sul", lat: -25.4284, lng: -49.2733 },
  { nome: "São José dos Pinhais", uf: "PR", regiao: "Sul", lat: -25.5302, lng: -49.2065 },
  { nome: "Londrina", uf: "PR", regiao: "Sul", lat: -23.3045, lng: -51.1696 },
  { nome: "Maringá", uf: "PR", regiao: "Sul", lat: -23.4205, lng: -51.9333 },
  { nome: "Joinville", uf: "SC", regiao: "Sul", lat: -26.3044, lng: -48.8456 },
  { nome: "Florianópolis", uf: "SC", regiao: "Sul", lat: -27.5954, lng: -48.548 },
  { nome: "Caxias do Sul", uf: "RS", regiao: "Sul", lat: -29.1685, lng: -51.1796 },
  { nome: "Porto Alegre", uf: "RS", regiao: "Sul", lat: -30.0346, lng: -51.2177 },
  { nome: "Gravataí", uf: "RS", regiao: "Sul", lat: -29.9444, lng: -50.9919 },

  // Centro-Oeste
  { nome: "Goiânia", uf: "GO", regiao: "Centro-Oeste", lat: -16.6869, lng: -49.2648 },
  { nome: "Anápolis", uf: "GO", regiao: "Centro-Oeste", lat: -16.3267, lng: -48.9526 },
  { nome: "Brasília", uf: "DF", regiao: "Centro-Oeste", lat: -15.7939, lng: -47.8828 },
  { nome: "Campo Grande", uf: "MS", regiao: "Centro-Oeste", lat: -20.4697, lng: -54.6201 },
  { nome: "Cuiabá", uf: "MT", regiao: "Centro-Oeste", lat: -15.6014, lng: -56.0979 },

  // Nordeste
  { nome: "Salvador", uf: "BA", regiao: "Nordeste", lat: -12.9777, lng: -38.5016 },
  { nome: "Feira de Santana", uf: "BA", regiao: "Nordeste", lat: -12.2664, lng: -38.9663 },
  { nome: "Recife", uf: "PE", regiao: "Nordeste", lat: -8.0476, lng: -34.877 },
  { nome: "Fortaleza", uf: "CE", regiao: "Nordeste", lat: -3.7319, lng: -38.5267 },
  { nome: "São Luís", uf: "MA", regiao: "Nordeste", lat: -2.5307, lng: -44.3068 },
  { nome: "Natal", uf: "RN", regiao: "Nordeste", lat: -5.7945, lng: -35.211 },
  { nome: "João Pessoa", uf: "PB", regiao: "Nordeste", lat: -7.1195, lng: -34.845 },
  { nome: "Aracaju", uf: "SE", regiao: "Nordeste", lat: -10.9472, lng: -37.0731 },

  // Norte
  { nome: "Manaus", uf: "AM", regiao: "Norte", lat: -3.119, lng: -60.0217 },
  { nome: "Belém", uf: "PA", regiao: "Norte", lat: -1.4558, lng: -48.5039 },
  { nome: "Marabá", uf: "PA", regiao: "Norte", lat: -5.3686, lng: -49.1178 },
  { nome: "Palmas", uf: "TO", regiao: "Norte", lat: -10.1846, lng: -48.3336 },
  { nome: "Porto Velho", uf: "RO", regiao: "Norte", lat: -8.7619, lng: -63.9039 },
];

export const CENTRO_BRASIL = { lat: -15.78, lng: -52.0 };
