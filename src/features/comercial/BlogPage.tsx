import { useMemo, useState } from "react";
import { ArrowRight, Clock3, Search, Sparkles } from "lucide-react";
import "./BlogPage.css";

const categories = ["Todos", "Gestão", "Produção", "Vendas", "Financeiro", "Tecnologia"];
const posts = [
  { title: "Como calcular o preço por m² em comunicação visual", category: "Produção", minutes: 6, excerpt: "Entenda os custos de mídia, tinta, acabamento e instalação para formar um preço sustentável.", accent: "violet" },
  { title: "7 indicadores que toda gráfica deve acompanhar", category: "Gestão", minutes: 5, excerpt: "Acompanhe produtividade, perdas, prazo, margem e conversão para decidir com mais segurança.", accent: "teal" },
  { title: "Web-to-Print: venda 24h sem aumentar a equipe", category: "Vendas", minutes: 7, excerpt: "Como organizar pedidos online, padronizar produtos e reduzir retrabalho comercial.", accent: "pink" },
  { title: "Fluxo de caixa: evite surpresas no fim do mês", category: "Financeiro", minutes: 4, excerpt: "Planeje recebimentos, pagamentos e capital de giro com uma rotina simples.", accent: "orange" },
  { title: "Reduzindo desperdício de mídia e tinta", category: "Produção", minutes: 5, excerpt: "Boas práticas de imposição, calibração e controle de processo para reduzir perdas.", accent: "blue" },
  { title: "NF-e e NFS-e para gráficas: guia de organização", category: "Tecnologia", minutes: 8, excerpt: "Conheça os pontos que merecem atenção na rotina fiscal de uma empresa gráfica.", accent: "green" },
];

export default function BlogPage() {
  const [category, setCategory] = useState("Todos");
  const [search, setSearch] = useState("");
  const filtered = useMemo(() => posts.filter(post =>
    (category === "Todos" || post.category === category) &&
    (post.title + " " + post.excerpt).toLocaleLowerCase("pt-BR").includes(search.toLocaleLowerCase("pt-BR"))
  ), [category, search]);

  return <div className="blog-page blog-page-experiment">
    <section className="blog-hero blog-hero-new">
      <div className="blog-hero-copy">
        <span className="blog-featured"><Sparkles size={13}/> EM DESTAQUE · UNIVERSO DA IMPRESSÃO</span>
        <h2>Blog PrismaPress:<br/><em>gestão e impressão</em><br/>no mesmo lugar.</h2>
        <p>Tendências, tutoriais e estratégias práticas para sua gráfica produzir melhor, vender mais e crescer com controle.</p>
        <a className="blog-featured-link" href="#blog-artigos">Explorar artigos <ArrowRight size={16}/></a>
      </div>
      <div className="blog-hero-art blog-hero-photo" role="img" aria-label="Composição gráfica em cores de impressão">
        <div className="blog-hero-paper"><b>CMYK</b><span>IDEIAS EM<br/>IMPRESSÃO</span><i/><i/><i/></div>
        <small>PRISMAPRESS · CONTEÚDO</small>
      </div>
    </section>
    <div className="blog-toolbar blog-toolbar-new" id="blog-artigos">
      <div className="blog-categories" aria-label="Filtrar por categoria">{categories.map(item =>
        <button type="button" key={item} className={category === item ? "active" : ""} aria-pressed={category === item} onClick={() => setCategory(item)}>{item}</button>
      )}</div>
      <label className="blog-search"><Search size={15}/><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Buscar artigos..." aria-label="Buscar artigos"/></label>
    </div>
    <div className="blog-results">{filtered.length} {filtered.length === 1 ? "artigo encontrado" : "artigos encontrados"}</div>
    <section className="blog-grid blog-grid-new">
      {filtered.map((post, index) => <article className={`blog-card blog-card-new ${post.accent === "orange" ? "blog-card-orange" : ""}`} key={post.title}>
        <div className={`blog-cover cover-${post.accent}`}><span>{String(index + 1).padStart(2, "0")}</span><b>{post.category.toUpperCase()}</b><i/><i/><i/></div>
        <div className="blog-card-body"><span className="blog-tag">{post.category}</span><h3>{post.title}</h3><p>{post.excerpt}</p><div className="blog-card-meta"><span><Clock3 size={13}/> {post.minutes} min de leitura</span><span className="blog-coming">Conteúdo inicial</span></div></div>
      </article>)}
    </section>
    {filtered.length === 0 && <div className="blog-empty">Nenhum artigo encontrado. Tente outra palavra ou categoria.</div>}
    <p className="blog-disclaimer">Biblioteca editorial inicial do PRISMAPRESS. Os textos completos serão publicados em próximas etapas.</p>
  </div>;
}
