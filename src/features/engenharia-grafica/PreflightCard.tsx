import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ListChecks,
  LoaderCircle,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import "./PreflightCard.css";
import { analisarArtePreflight } from "../../lib/preflight";

export type PreflightStatus = "critico" | "atencao" | "aprovado";

export interface PreflightAlerta {
  tipo: string;
  mensagem: string;
}

export interface PreflightResultado {
  statusGeral: PreflightStatus;
  resumo: string;
  alertas: PreflightAlerta[];
  checklistOperador: string[];
}

export interface PreflightPedido {
  id: string;
  produto: string;
  imagem?: string;
  material?: string;
  gramatura?: string;
  cores?: string;
  formato?: string;
  acabamento?: string;
}

export interface PreflightAnaliseInput {
  imagemBase64OuUrl: string;
  produto: string;
  material?: string;
  gramatura?: string;
  cores?: string;
  formato?: string;
  acabamento?: string;
  maquina: string;
}

interface PreflightCardProps {
  pedido: PreflightPedido;
  maquina: string;
  analisarArte?: (input: PreflightAnaliseInput) => Promise<PreflightResultado>;
}

const statusConfig = {
  critico: { label: "Risco crítico", Icon: ShieldAlert, className: "preflight-status--critical" },
  atencao: { label: "Requer atenção", Icon: AlertTriangle, className: "preflight-status--warning" },
  aprovado: { label: "Arte conforme", Icon: CheckCircle2, className: "preflight-status--approved" },
} satisfies Record<PreflightStatus, { label: string; Icon: typeof CheckCircle2; className: string }>;

export function PreflightCard({ pedido, maquina, analisarArte = analisarArtePreflight }: PreflightCardProps) {
  const [carregando, setCarregando] = useState(false);
  const [resultado, setResultado] = useState<PreflightResultado | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  async function handleAnalisar() {
    if (!pedido.imagem || carregando) return;

    setCarregando(true);
    setErro(null);
    setResultado(null);

    try {
      const res = await analisarArte({
        imagemBase64OuUrl: pedido.imagem,
        produto: pedido.produto,
        material: pedido.material,
        gramatura: pedido.gramatura,
        cores: pedido.cores,
        formato: pedido.formato,
        acabamento: pedido.acabamento,
        maquina,
      });

      if (!res || !["critico", "atencao", "aprovado"].includes(res.statusGeral)) {
        throw new Error("A análise retornou um resultado inválido.");
      }
      setResultado(res);
    } catch (cause) {
      setErro(cause instanceof Error ? cause.message : "Falha ao analisar a arte.");
    } finally {
      setCarregando(false);
    }
  }

  const status = resultado ? statusConfig[resultado.statusGeral] : null;
  const StatusIcon = status?.Icon;

  return (
    <section className="preflight-card" aria-labelledby="preflight-title">
      <header className="preflight-card__header">
        <div className="preflight-card__title">
          <Sparkles size={18} aria-hidden="true" />
          <h3 id="preflight-title">Inspeção pré-impressão</h3>
        </div>
        <button
          className="preflight-card__button"
          type="button"
          disabled={!pedido.imagem || carregando}
          onClick={handleAnalisar}
        >
          {carregando ? (
            <><LoaderCircle size={15} className="preflight-spin" /> Analisando...</>
          ) : (
            "Analisar arte"
          )}
        </button>
      </header>

      {!pedido.imagem && (
        <p className="preflight-card__muted">Anexe a arte ao pedido para iniciar a inspeção.</p>
      )}

      {erro && <p className="preflight-card__error" role="alert">{erro}</p>}

      {resultado && status && StatusIcon && (
        <div className="preflight-card__result" aria-live="polite">
          <div className="preflight-card__summary">
            <span className={`preflight-status ${status.className}`}>
              <StatusIcon size={15} /> {status.label}
            </span>
            <p>{resultado.resumo}</p>
          </div>

          {resultado.alertas.length > 0 && (
            <ul className="preflight-card__alerts">
              {resultado.alertas.map((alerta, index) => (
                <li key={`${alerta.tipo}-${index}`}>
                  <strong>[{alerta.tipo.toUpperCase()}]</strong> {alerta.mensagem}
                </li>
              ))}
            </ul>
          )}

          {resultado.checklistOperador.length > 0 && (
            <div className="preflight-card__checklist">
              <h4><ListChecks size={15} /> Checklist do operador</h4>
              <ul>
                {resultado.checklistOperador.map((item, index) => (
                  <li key={`${index}-${item}`}>{item}</li>
                ))}
              </ul>
            </div>
          )}
          <p className="preflight-card__disclaimer">
            A inspeção automatizada é um apoio. A liberação final deve ser validada pelo responsável de pré-impressão.
          </p>
        </div>
      )}
    </section>
  );
}
