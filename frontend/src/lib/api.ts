// src/lib/api.ts
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"; 
// Troque 3001 pela porta real do seu backend Node

// Função genérica para requests
async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
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
  return apiFetch<{ ligas: string[]; dados: any[] }>("/curvas");
}

// Analisar uma liga específica
export async function getLiga(liga: string) {
  return apiFetch(`/curvas/${liga}`);
}

// Comparar duas ligas
export async function compararLigas(liga1: string, liga2: string) {
  return apiFetch(`/curvas/comparar/${liga1}/${liga2}`);
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
