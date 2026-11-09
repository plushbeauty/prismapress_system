type ApiRequest = { method?: string; body?: unknown };
type ApiResponse = {
  status: (code: number) => ApiResponse;
  json: (body: unknown) => void;
};

type PreflightInput = {
  imagemBase64OuUrl: string;
  produto: string;
  material?: string;
  gramatura?: string;
  cores?: string;
  formato?: string;
  acabamento?: string;
  maquina?: string;
};

const validStatuses = ["aprovado", "atencao", "critico"] as const;
const validTypes = ["critico", "atencao", "informativo"] as const;
const validCategories = ["sangria_margem", "cores", "resolucao_textos", "maquina_acabamento"] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function validateInput(value: unknown): PreflightInput | null {
  if (!isRecord(value) || typeof value.imagemBase64OuUrl !== "string" ||
      value.imagemBase64OuUrl.length < 1 || value.imagemBase64OuUrl.length > 18_000_000 ||
      typeof value.produto !== "string" || value.produto.length > 200) return null;

  const image = value.imagemBase64OuUrl;
  const isDataImage = /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(image);
  let isHttpsImage = false;
  try {
    const url = new URL(image);
    isHttpsImage = url.protocol === "https:";
  } catch { /* not a URL */ }
  if (!isDataImage && !isHttpsImage) return null;

  const optional = ["material", "gramatura", "cores", "formato", "acabamento", "maquina"] as const;
  for (const key of optional) {
    if (value[key] !== undefined && (typeof value[key] !== "string" || value[key].length > 200)) return null;
  }
  return value as unknown as PreflightInput;
}

function validateResult(value: unknown) {
  if (!isRecord(value) || !validStatuses.includes(value.statusGeral as typeof validStatuses[number]) ||
      typeof value.resumo !== "string" || !Array.isArray(value.alertas) ||
      !Array.isArray(value.checklistOperador)) return null;

  const alertas = value.alertas.filter((item) => isRecord(item) &&
    validTypes.includes(item.tipo as typeof validTypes[number]) &&
    validCategories.includes(item.categoria as typeof validCategories[number]) &&
    typeof item.mensagem === "string").map((item) => ({
      tipo: item.tipo, categoria: item.categoria, mensagem: String(item.mensagem).slice(0, 1000),
    }));
  const checklistOperador = value.checklistOperador
    .filter((item): item is string => typeof item === "string")
    .slice(0, 20).map((item) => item.slice(0, 300));

  return {
    statusGeral: value.statusGeral,
    resumo: value.resumo.slice(0, 1200),
    alertas: alertas.slice(0, 30),
    checklistOperador,
  };
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Método não permitido." });

  const data = validateInput(req.body);
  if (!data) return res.status(400).json({ error: "Dados inválidos ou imagem não suportada." });

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return res.status(503).json({ error: "Serviço de análise ainda não configurado." });

  const prompt = [
    "Você é especialista em pré-impressão gráfica industrial. Faça uma inspeção visual preliminar da arte.",
    "Não invente medidas, sangria, resolução, perfil ICC ou separações que não possam ser confirmadas visualmente.",
    "Quando um requisito não puder ser verificado na imagem, classifique como informativo e peça conferência no PDF/preflight técnico.",
    "Não declare aprovação técnica definitiva apenas pela imagem. Considere o contexto da ordem:",
    `Produto: ${data.produto}`,
    `Máquina: ${data.maquina || "não informada"}`,
    `Material: ${data.material || "não informado"}; gramatura: ${data.gramatura || "não informada"}`,
    `Cores: ${data.cores || "não informadas"}; formato: ${data.formato || "não informado"}`,
    `Acabamento: ${data.acabamento || "não informado"}`,
    "Verifique visualmente textos pequenos, contraste, elementos próximos às bordas, orientação, possíveis riscos de corte/dobra e adequação aparente ao acabamento.",
    "Retorne apenas JSON com: statusGeral (aprovado|atencao|critico), resumo, alertas (tipo, categoria, mensagem), checklistOperador.",
    "Categorias permitidas: sangria_margem, cores, resolucao_textos, maquina_acabamento. Tipos: critico, atencao, informativo.",
    "Se não for possível avaliar um item sem o arquivo original, deixe isso explícito nos alertas e checklist.",
  ].join("\n");

  try {
    const upstream = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: [{
          role: "user",
          content: [
            { type: "input_text", text: prompt },
            { type: "input_image", image_url: data.imagemBase64OuUrl },
          ],
        }],
        text: { format: { type: "json_object" } },
        max_output_tokens: 1400,
      }),
    });
    if (!upstream.ok) {
      const detail = await upstream.text();
      console.error("OpenAI preflight request failed:", upstream.status, detail.slice(0, 500));
      return res.status(502).json({ error: "O serviço de análise não conseguiu processar a arte." });
    }

    const payload = await upstream.json() as { output_text?: string };
    const raw = payload.output_text?.trim();
    if (!raw) return res.status(502).json({ error: "A análise não retornou um resultado legível." });

    const result = validateResult(JSON.parse(raw));
    if (!result) return res.status(502).json({ error: "A análise retornou um formato inválido." });
    return res.status(200).json(result);
  } catch (error) {
    console.error("Preflight analysis error:", error);
    return res.status(502).json({ error: "Não foi possível analisar a arte neste momento." });
  }
}
