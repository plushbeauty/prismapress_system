import { useState } from "react";
import { Check, Sparkles, Rocket, Crown, Building2 } from "lucide-react";

const plans = [
  { name: "Start", Icon: Rocket, monthly: 89, description: "Para gráficas rápidas começando.", users: "2 usuários", features: ["Orçamentos e pedidos", "Cadastro de clientes", "Financeiro básico", "Suporte por chat"] },
  { name: "Pro", Icon: Sparkles, monthly: 189, description: "Para gráficas em crescimento.", users: "5 usuários", popular: true, features: ["Tudo do Start", "Controle de produção (Kanban)", "Estoque de insumos", "Gestão fiscal", "Portal do cliente"] },
  { name: "Premium", Icon: Crown, monthly: 349, description: "Para comunicação visual e offset.", users: "15 usuários", features: ["Tudo do Pro", "Cálculo por m² e chapa", "Loja online / Web-to-Print", "Relatórios avançados", "Integração WhatsApp"] },
  { name: "Enterprise", Icon: Building2, monthly: null, description: "Para redes e grandes indústrias gráficas.", users: "Ilimitado", features: ["Tudo do Premium", "Multiempresa", "API e integrações", "Gerente de conta dedicado", "SLA contratado"] },
];

export default function PlanosPage() {
  const [anual, setAnual] = useState(true);
  return (
    <div className="plans-page">
      <section className="plans-hero">
        <small>PRISMAPRES · PLANOS</small>
        <h1>Planos que crescem<br />com sua gráfica.</h1>
        <p>Do orçamento à entrega, organize sua operação em um só lugar. Experimente por 14 dias.</p>
        <div className="plans-toggle" role="group" aria-label="Periodicidade de cobrança">
          <button className={!anual ? "active" : ""} onClick={() => setAnual(false)}>Mensal</button>
          <button className={anual ? "active" : ""} onClick={() => setAnual(true)}>Anual <b>−20%</b></button>
        </div>
      </section>
      <div className="plans-grid">
        {plans.map(({ name, Icon, monthly, description, users, popular, features }) => {
          const price = monthly === null ? null : anual ? Math.round(monthly * .8) : monthly;
          return (
            <article className={`plan-card ${popular ? "plan-card--popular" : ""}`} key={name}>
              {popular && <span className="plan-popular">MAIS ESCOLHIDO</span>}
              <div className="plan-icon"><Icon size={22} /></div>
              <h2>{name}</h2>
              <p className="plan-description">{description}</p>
              <div className="plan-price">
                {price === null ? <strong>Sob consulta</strong> : <><strong>R$ {price}</strong><span>/mês</span></>}
              </div>
              {monthly !== null && anual && <small className="plan-billing">Cobrança anual · economia de 20%</small>}
              <div className="plan-users">{users}</div>
              <ul>{features.map(feature => <li key={feature}><Check size={15} />{feature}</li>)}</ul>
              <button className="plan-cta" onClick={() => window.location.href = "mailto:comercial@prismapres.com.br?subject=" + encodeURIComponent("Interesse no plano " + name)}>
                {monthly === null ? "Falar com vendas" : "Começar teste grátis"}
              </button>
            </article>
          );
        })}
      </div>
      <p className="plans-note">Valores e recursos sujeitos à confirmação comercial. Os módulos demonstrativos não representam funcionalidades já liberadas em produção.</p>
    </div>
  );
}
