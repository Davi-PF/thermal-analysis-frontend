// src/lib/api.ts

// Types for API responses
export interface CurvaPoint {
  tempo: number;
  valor: number;
}

export interface LigaData {
  liga: string;
  curva: CurvaPoint[];
  media: number;
}

export interface LigaResumo {
  liga: string;
  max: number;
  min: number;
  media: number;
  taxaResfriamento: number;
}

export interface CurvaPoint {
  tempo: number;
  valor: number;
}

interface Derivadas {
  primeira: number[];
  segunda: number[];
  tempLiquidus: number;
  tempFinal: number;
  tempMaxResfriamento: number;
  tempMinResfriamento: number;
  deltaT: number;
  contracaoPrimaria: number;
  contracaoSecundaria: number;
  expansaoEutetica: number;
}


export interface LigaCompleta {
  liga: string;
  pontos: number;
  max: number;
  min: number;
  media: number;
  inicial: number;
  final: number;
  tempoTotal: number;
  taxaResfriamento: number;
  curva: CurvaPoint[];

  derivadas: Derivadas; // ← apenas arrays de derivadas

  // Pontos característicos (no mesmo nível da liga, não dentro de derivadas)
  tempLiquidus: number;
  tempFinal: number;
  tempMaxResfriamento: number;
  tempMinResfriamento: number;
  deltaT: number;

  // Segunda derivada
  contracaoPrimaria: number;
  contracaoSecundaria: number;
  expansaoEutetica: number;
}

export interface AnaliseData {
  aba: string;
  ligas: Record<string, LigaCompleta>;
}

export interface ComparacaoResponse {
  liga1: LigaResumo;
  liga2: LigaResumo;
  diferencaMedia: number;
  analiseCompleta: {
    liga1: LigaCompleta;
    liga2: LigaCompleta;
  };
  diferencas: {
    media: number;
    max: number;
    min: number;
    taxaResfriamento: number;
    tempoTotal: number;
  };
  comparacao: {
    melhorMedia: string;
    maiorPico: string;
    menorFinal: string;
    maiorResfriamento: string;
    maisEstavel: string;
  };
  dadosGrafico: {
    tempos: number[];
    liga1: number[];
    liga2: number[];
  };
  resumo: {
    totalPontos: { liga1: number; liga2: number };
    tempoTotal: { liga1: number; liga2: number; diferenca: number };
    valoresIniciais: { liga1: number; liga2: number; diferenca: number };
    valoresFinais: { liga1: number; liga2: number; diferenca: number };
  };
  metadados: {
    arquivo: string;
    timestamp: string;
    versao: string;
  };
}

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
// Troque 3001 pela porta real do seu backend Node

// Função genérica para requests
async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
    // garante que SSR não quebre (Next 13 App Router)
    cache: "no-store",
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Erro na API: ${res.status} - ${error}`);
  }

  return res.json();
}

// ---- ENDPOINTS DO BACKEND ---- //

// Carregar todas as curvas
export async function getCurvas() {
  return apiFetch<{ aba: string; ligas: Record<string, LigaCompleta> }>(
    "/curvas"
  );
}

// Analisar uma liga específica
export async function getLiga(liga: string): Promise<LigaData> {
  return apiFetch<LigaData>(`/curvas/${liga}`);
}

// Comparar duas ligas
export async function compararLigas(
  liga1: string,
  liga2: string
): Promise<ComparacaoResponse> {
  return apiFetch<ComparacaoResponse>(`/curvas/comparar/${liga1}/${liga2}`);
}

// Caso queira upload de arquivo no futuro
export async function uploadArquivo(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE_URL}/upload`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    throw new Error("Erro no upload");
  }

  return res.json();
}
