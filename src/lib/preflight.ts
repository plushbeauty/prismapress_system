export type PreflightStatus = "critico" | "atencao" | "aprovado";
export interface PreflightAlerta {
  tipo: "critico" | "atencao" | "informativo";
  categoria: "sangria_margem" | "cores" | "resolucao_textos" | "maquina_acabamento";
  mensagem: string;
}
export interface PreflightResultado {
  statusGeral: PreflightStatus;
  resumo: string;
  alertas: PreflightAlerta[];
  checklistOperador: string[];
}
export interface PreflightInput {
  imagemBase64OuUrl: string;
  produto: string;
  material?: string;
  gramatura?: string;
  cores?: string;
  formato?: string;
  acabamento?: string;
  maquina?: string;
}

export async function analisarArtePreflight(data: PreflightInput): Promise<PreflightResultado> {
  const response = await fetch("/api/preflight", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const payload = await response.json().catch(() => null) as PreflightResultado | { error?: string } | null;
  if (!response.ok) {
    throw new Error(payload && "error" in payload && payload.error
      ? payload.error
      : "Não foi possível analisar a arte.");
  }
  if (!payload || !("statusGeral" in payload) || !Array.isArray(payload.alertas) ||
      !Array.isArray(payload.checklistOperador)) {
    throw new Error("O serviço retornou um resultado inválido.");
  }
  return payload as PreflightResultado;
}
