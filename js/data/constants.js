/**
 * MONTE SUA EQUIPE — Constantes, Dicionários e Conhecimento do Sistema
 * Idealizado por Edvania Freitas (@ampliaperformance)
 */

export const SKILLS_DICTIONARY = [
  "Excel", "Excel avançado", "Power BI", "SQL", "Python", "SAP", "Oracle", "TOTVS", 
  "Protheus", "Mega ERP", "Contas a receber", "Contas a pagar", "Tesouraria", 
  "Fluxo de caixa", "Conciliação bancária", "Análise de crédito", "Crédito", "Cobrança", 
  "Recuperação de crédito", "Negociação", "Faturamento", "Controladoria", "Contabilidade", 
  "Fiscal", "DRE", "Análise de balanço", "Orçamento", "FP&A", "Auditoria", "Compliance", 
  "Imposto de Renda", "Folha de pagamento", "Departamento pessoal", "Recrutamento e seleção", 
  "Treinamento e desenvolvimento", "Gestão de pessoas", "Liderança de equipes", 
  "Atendimento ao cliente", "Vendas", "CRM", "Marketing digital", "Mídias sociais", 
  "Logística", "Compras", "Estoque", "Gestão de projetos", "Scrum", "Power Automate", 
  "Automação de processos", "Inteligência Artificial", "JavaScript", "React", "Java", 
  "C#", "Inglês", "Espanhol", "Libras", "Comunicação", "Pacote Office", "Google Sheets", 
  "Contratos", "Jurídico", "Imobiliário", "Combustíveis", "Energia", "Call center", 
  "Telemarketing", "Recepção", "Administrativo", "Secretariado", "CNH B", "CNH D", 
  "Segurança do trabalho", "Manutenção", "Elétrica", "Mecânica", "Produção", "Qualidade", 
  "ISO 9001", "Enfermagem", "Primeiros socorros", "Cozinha", "Design", "Canva", 
  "Photoshop", "Redação", "PNL", "DISC", "Coaching", "Oratória"
];

export const BEHAVIORAL_TRAITS = [
  { key: "calmo", label: "Tranquilo(a)", triggers: ["tranquil", "calm", "seren", "pacien", "equilibr"] },
  { key: "logico", label: "Lógico(a) e analítico(a)", triggers: ["logic", "analitic", "raciocin", "racional"] },
  { key: "discreto", label: "Discreto(a) e ético(a)", triggers: ["discre", "fofoc", "etic", "sigil", "confidenc", "reservad"] },
  { key: "lider", label: "Liderança", triggers: ["lider", "gestao de equipe", "gestor de equipe", "coordenei", "coordenacao de equipe"] },
  { key: "comunicativo", label: "Comunicativo(a)", triggers: ["comunicativ", "comunicacao", "extrovert", "oratori"] },
  { key: "organizado", label: "Organizado(a)", triggers: ["organizad", "metodic", "disciplin"] },
  { key: "proativo", label: "Proativo(a)", triggers: ["proativ", "iniciativa", "dono do problema"] },
  { key: "resiliente", label: "Resiliente sob pressão", triggers: ["resilien", "pressao", "adaptav"] },
  { key: "negociador", label: "Negociador(a)", triggers: ["negociador", "persuas", "convincen"] },
  { key: "criativo", label: "Criativo(a) e inovador(a)", triggers: ["criativ", "inovad", "inovacao"] },
  { key: "detalhista", label: "Detalhista", triggers: ["detalh", "minucios", "atencao aos detalhes", "precisao"] },
  { key: "colaborativo", label: "Trabalho em equipe", triggers: ["trabalho em equipe", "espirito de equipe", "colabor", "cooperat"] },
  { key: "pontual", label: "Pontual e comprometido(a)", triggers: ["pontual", "assidu,compromet", "responsav"] },
  { key: "empatico", label: "Empático(a)", triggers: ["empat", "escuta ativa", "acolhed"] },
  { key: "aprendiz", label: "Gosta de aprender", triggers: ["aprender", "curios", "autodidat", "estudios"] }
];

export const DISC_STATEMENTS = [
  { id: 1, factor: "D", text: "Gosto de assumir a frente quando é preciso decidir rápido." },
  { id: 2, factor: "I", text: "Tenho facilidade para iniciar conversas com pessoas que acabei de conhecer." },
  { id: 3, factor: "S", text: "Prefiro rotinas previsíveis a mudanças frequentes." },
  { id: 4, factor: "C", text: "Gosto de seguir procedimentos e padrões bem definidos." },
  { id: 5, factor: "D", text: "Sinto-me motivado(a) por metas desafiadoras." },
  { id: 6, factor: "I", text: "Gosto de apresentar ideias e convencer as pessoas sobre elas." },
  { id: 7, factor: "S", text: "Mantenho a paciência mesmo em momentos de pressão." },
  { id: 8, factor: "C", text: "Confiro os detalhes antes de entregar um trabalho." },
  { id: 9, factor: "D", text: "Prefiro ir direto ao ponto nas conversas de trabalho." },
  { id: 10, factor: "I", text: "Ambientes animados e com troca entre as pessoas me dão energia." },
  { id: 11, factor: "S", text: "Gosto de apoiar colegas e ajudar o time nos bastidores." },
  { id: 12, factor: "C", text: "Prefiro decidir com base em dados e evidências." },
  { id: 13, factor: "D", text: "Fico à vontade para decidir mesmo com informações incompletas." },
  { id: 14, factor: "I", text: "Costumo animar o grupo quando o clima está desmotivado." },
  { id: 15, factor: "S", text: "Valorizo relações de trabalho estáveis e de longo prazo." },
  { id: 16, factor: "C", text: "Sinto-me confortável com atividades que exigem precisão e análise." },
  { id: 17, factor: "D", text: "Encaro obstáculos como oportunidades para mostrar resultado." },
  { id: 18, factor: "I", text: "Prefiro atividades com contato frequente com pessoas." },
  { id: 19, factor: "S", text: "Prefiro concluir uma tarefa antes de começar outra." },
  { id: 20, factor: "C", text: "Gosto de entender bem as regras antes de agir." },
  { id: 21, factor: "D", text: "Quando discordo, costumo dizer de forma clara e objetiva." },
  { id: 22, factor: "I", text: "Sinto-me bem quando meu trabalho é reconhecido publicamente." },
  { id: 23, factor: "S", text: "Costumo ouvir com atenção antes de dar minha opinião." },
  { id: 24, factor: "C", text: "Quando preciso escolher, prefiro qualidade a rapidez." }
];

export const DISC_PROFILES_INFO = {
  D: {
    name: "Dominância (Execução e Resultados)",
    color: "#e11d48",
    bgSoft: "#fff1f2",
    description: "Foco em resultados, tomada de decisão rápida, superação de desafios e assertividade.",
    strengths: "Iniciativa, determinação, foco no objetivo, coragem para assumir riscos calculados.",
    workStyle: "Prefere autonomia, metas diretas, agilidade e comunicação objetiva.",
    interviewQuestion: "Conte sobre uma situação em que você precisou tomar uma decisão rápida com informações incompletas. Como conduziu e qual foi o resultado?"
  },
  I: {
    name: "Influência (Comunicação e Conexão)",
    color: "#f59e0b",
    bgSoft: "#fef3c7",
    description: "Habilidade de articulação, entusiasmo, facilidade para engajar equipes e persuasão empática.",
    strengths: "Comunicação verbal, otimismo, relacionamento interpessoal, criatividade e motivação de times.",
    workStyle: "Prospera em ambientes colaborativos, dinâmicos e com rica troca de ideias.",
    interviewQuestion: "Descreva um momento em que precisou convencer pessoas de outras áreas sobre uma ideia. Qual foi sua abordagem?"
  },
  S: {
    name: "Estabilidade (Consistência e Cooperação)",
    color: "#10b981",
    bgSoft: "#ecfdf5",
    description: "Paciência, lealdade, método confiável, cooperação contínua e foco em relações sólidas.",
    strengths: "Resiliência, escuta atenta, confiabilidade, espírito de equipe e perseverança.",
    workStyle: "Valoriza segurança, rotinas bem estruturadas, planejamento e harmonia coletiva.",
    interviewQuestion: "Fale sobre um período de rotina intensa. Como você manteve a qualidade e a constância das entregas?"
  },
  C: {
    name: "Conformidade (Precisão e Qualidade)",
    color: "#3b82f6",
    bgSoft: "#eff6ff",
    description: "Apreço pela exatidão técnica, análise detalhada, conformidade a normas e busca pelo rigor.",
    strengths: "Pensamento crítico, organização lógica, atenção a detalhes e controle de riscos.",
    workStyle: "Atua com dados, metodologias claras, padrões documentados e foco em qualidade técnica.",
    interviewQuestion: "Conte sobre uma entrega que exigiu muita precisão e cumprimento de normas. Como garantiu que estava correta?"
  }
};

export const FREE_COURSES_PROVIDERS = [
  { name: "Escola Virtual Gov (EV.G)", url: "https://www.escolavirtual.gov.br/catalogo-cursos?pesquisa=" },
  { name: "Fundação Bradesco (Escola Virtual)", url: "https://www.ev.org.br/cursos?q=" },
  { name: "Sebrae Cursos Online", url: "https://sebrae.com.br/sites/PortalSebrae/cursosonline?termo=" },
  { name: "SENAI Play", url: "https://senaiplay.com.br/pesquisa?termo=" },
  { name: "Coursera Cursos Gratuitos", url: "https://www.coursera.org/search?query=" },
  { name: "YouTube Educacional", url: "https://www.youtube.com/results?search_query=curso+gratuito+" }
];

export const INITIAL_SEED_CANDIDATES = [
  {
    id: "cand_1",
    full_name: "Mariana Alencar Guimarães",
    headline: "Analista Financeiro Pleno • FP&A, DRE e Fluxo de Caixa",
    city: "São Paulo",
    uf: "SP",
    work_mode: "hibrido",
    age_band: "30-39",
    education: "superior",
    summary: "Profissional de Finanças com 6 anos de experiência em controladoria, conciliação e elaboração de DRE gerencial. Reduzi custos operacionais em 14% na última holding através de automação de planilhas e renegociação de prazos bancários.",
    experience: "Analista Financeiro Sênior na Aliança Logística (2022-2026). Responsável pelo fluxo de caixa diário de R$ 4,5M, fechamento de conciliações e relatórios para a diretoria. Implementei rotinas no ERP Protheus e dashboards em Power BI.",
    skills: ["Excel avançado", "Power BI", "Fluxo de caixa", "Conciliação bancária", "Contas a pagar", "Contas a receber", "Protheus", "DRE"],
    traits: ["organizado", "logico", "detalhista", "resiliente"],
    keywords: ["financeiro", "dre", "protheus", "conciliacao", "controladoria", "fluxo de caixa"],
    aspirations: "Crescer para coordenação de controladoria corporativa.",
    expectations: "Ambiente que valorize ideias de eficiência e transparência.",
    contribution: "Rigor na gestão de caixa, mitigação de riscos e relatórios claros para decisão.",
    best_quality: "Pontualidade nas entregas e clareza analítica em cenários complexos.",
    develop_topic: "Automação avançada com Python para finanças corporativas.",
    linkedin: "https://www.linkedin.com/in/mariana-alencar-exemplo",
    email: "mariana.guimaraes@exemplo.com.br",
    phone: "(11) 98765-4321",
    visible: true,
    notify_email: true,
    disc: {
      raw: { D: 18, I: 15, S: 22, C: 26 },
      scores: { D: 50, I: 37.5, S: 66.7, C: 83.3 },
      relative: { D: 21, I: 16, S: 27, C: 36 },
      primary: "C",
      secondary: "S"
    },
    cvScore: 92,
    consent_at: "2026-02-15T10:00:00Z"
  },
  {
    id: "cand_2",
    full_name: "Carlos Eduardo Silveira",
    headline: "Supervisor de Atendimento ao Cliente & Sucesso do Cliente (CX)",
    city: "Belo Horizonte",
    uf: "MG",
    work_mode: "presencial",
    age_band: "40-49",
    education: "superior",
    summary: "Líder de operações de atendimento e SAC com mais de 10 anos de vivência. Aumentei o CSAT de 72% para 91% gerenciando equipe de 28 operadores em regime de alta demanda e resolução no primeiro contato.",
    experience: "Coordenador de CX na Minas Soluções B2B (2020-2026). Treinamento de equipes, monitoria de qualidade, elaboração de POPs e redução de turnover de 35% para 9% com programas de reconhecimento e clima acolhedor.",
    skills: ["Atendimento ao cliente", "Liderança de equipes", "Gestão de pessoas", "CRM", "Call center", "Treinamento e desenvolvimento", "Comunicação"],
    traits: ["lider", "comunicativo", "empatico", "colaborativo", "proativo"],
    keywords: ["atendimento", "sac", "cx", "lideranca", "equipes", "qualidade"],
    aspirations: "Gerenciar operações corporativas de atendimento ao cliente multicanal.",
    expectations: "Empresas com cultura humanizada e compromisso com o desenvolvimento das pessoas.",
    contribution: "Capacidade comprovada de unir foco em metas com respeito e motivação de equipe.",
    best_quality: "Facilidade de criar pontes de diálogo e solucionar conflitos de imediato.",
    develop_topic: "Inteligência Artificial aplicada a CRM e automação de chamados.",
    linkedin: "https://www.linkedin.com/in/carlos-silveira-exemplo",
    email: "carlos.silveira@exemplo.com.br",
    phone: "(31) 99876-5432",
    visible: true,
    notify_email: true,
    disc: {
      raw: { D: 22, I: 27, S: 24, C: 16 },
      scores: { D: 66.7, I: 87.5, S: 75.0, C: 41.7 },
      relative: { D: 25, I: 34, S: 28, C: 13 },
      primary: "I",
      secondary: "S"
    },
    cvScore: 88,
    consent_at: "2026-02-18T14:30:00Z"
  },
  {
    id: "cand_3",
    full_name: "Beatriz Nogueira Duarte",
    headline: "Especialista em Departamento Pessoal, Folha & Legislação Trabalhista",
    city: "Curitiba",
    uf: "PR",
    work_mode: "remoto",
    age_band: "30-39",
    education: "pos",
    summary: "Especialista em DP e rotinas de eSocial com 8 anos de experiência. Zero autuações em auditorias fiscais e fechamento de folha de pagamento de até 850 colaboradores nos prazos rigorosos da CLT.",
    experience: "Supervisora de DP na Sul Brasil Empreendimentos (2019-2026). Gestão de admissões, rescisões, férias, benefícios, CIPA e compliance trabalhista com TOTVS Protheus.",
    skills: ["Departamento pessoal", "Folha de pagamento", "TOTVS", "Legislação trabalhista", "eSocial", "Benefícios", "Compliance", "Auditoria"],
    traits: ["detalhista", "organizado", "discreto", "pontual"],
    keywords: ["departamento pessoal", "folha", "esocial", "trabalhista", "protheus"],
    aspirations: "Atuar como consultora interna ou gestora de gente e conformidade legal.",
    expectations: "Segurança jurídica e postura ética inegociável na condução das pessoas.",
    contribution: "Precisão contábil e trabalhista, blindagem contra passivos e atendimento seguro aos funcionários.",
    best_quality: "Domínio profundo das normas e cuidado preventivo em cada detalhe.",
    develop_topic: "Gestão estratégica de People Analytics e indicadores de absenteísmo.",
    linkedin: "https://www.linkedin.com/in/beatriz-duarte-exemplo",
    email: "beatriz.duarte@exemplo.com.br",
    phone: "(41) 98877-6655",
    visible: true,
    notify_email: true,
    disc: {
      raw: { D: 16, I: 14, S: 23, C: 27 },
      scores: { D: 41.7, I: 33.3, S: 70.8, C: 87.5 },
      relative: { D: 19, I: 14, S: 29, C: 38 },
      primary: "C",
      secondary: "S"
    },
    cvScore: 94,
    consent_at: "2026-02-20T09:15:00Z"
  },
  {
    id: "cand_4",
    full_name: "Lucas Mendes Ferreira",
    headline: "Consultor Comercial B2B • Negociação, Vendas Consultivas e CRM",
    city: "Campinas",
    uf: "SP",
    work_mode: "qualquer",
    age_band: "25-29",
    education: "superior",
    summary: "Executivo de Vendas focado em prospecção outbound corporativa. Superei a meta em 128% no último ano fechando contratos anuais de software e serviços com ticket médio de R$ 60 mil.",
    experience: "Executivo de Contas na TechAgro (2021-2026). Mapeamento de decisores C-Level, elaboração de propostas comerciais e negociação de contratos consultivos com uso intensivo de CRM e Pipeline.",
    skills: ["Vendas", "Negociação", "CRM", "Comunicação", "Apresentações", "Gestão de projetos"],
    traits: ["proativo", "negociador", "comunicativo", "resiliente", "lider"],
    keywords: ["vendas", "b2b", "comercial", "negociacao", "prospeccao", "crm"],
    aspirations: "Assumir a liderança de novos negócios ou gerência regional comercial.",
    expectations: "Remuneração alinhada ao desempenho e produto com entrega de valor genuíno.",
    contribution: "Energia comercial constante, relacionamento de alto nível e fechamento ágil.",
    best_quality: "Perseverança ética e habilidade natural de ouvir e diagnosticar necessidades do cliente.",
    develop_topic: "Estratégias de Growth B2B e Account-Based Marketing (ABM).",
    linkedin: "https://www.linkedin.com/in/lucas-mendes-exemplo",
    email: "lucas.mendes@exemplo.com.br",
    phone: "(19) 97766-5544",
    visible: true,
    notify_email: true,
    disc: {
      raw: { D: 27, I: 25, S: 16, C: 17 },
      scores: { D: 87.5, I: 79.2, S: 41.7, C: 45.8 },
      relative: { D: 35, I: 32, S: 16, C: 17 },
      primary: "D",
      secondary: "I"
    },
    cvScore: 89,
    consent_at: "2026-02-22T11:45:00Z"
  }
];

export const INITIAL_SEED_VACANCIES = [
  {
    id: "vac_1",
    title: "Analista de Controladoria e Finanças",
    company: "Grupo Âmplia Performance",
    city: "São Paulo",
    uf: "SP",
    work_mode: "hibrido",
    education: "superior",
    requirements: ["Excel avançado", "DRE", "Fluxo de caixa", "Conciliação bancária", "Power BI"],
    traits: ["organizado", "logico", "detalhista", "pontual"],
    description: "Buscamos profissional analítico para estruturar relatórios financeiros executivos, acompanhamento orçamentário e suporte à tomada de decisões estratégicas da holding.",
    disc_ideal: {
      primary: "C",
      secondary: "S"
    },
    status: "open",
    created_at: "2026-02-10T10:00:00Z"
  },
  {
    id: "vac_2",
    title: "Coordenador(a) de Atendimento e Relações com Clientes",
    company: "Rede Saúde & Vida",
    city: "Belo Horizonte",
    uf: "MG",
    work_mode: "presencial",
    education: "superior",
    requirements: ["Atendimento ao cliente", "Liderança de equipes", "Gestão de pessoas", "Comunicação"],
    traits: ["lider", "comunicativo", "empatico", "colaborativo"],
    description: "Coordenação da equipe de recepção e SAC hospitalar. Foco em humanização no acolhimento, melhoria contínua dos índices de satisfação e resolução rápida de demandas.",
    disc_ideal: {
      primary: "I",
      secondary: "S"
    },
    status: "open",
    created_at: "2026-02-12T14:00:00Z"
  },
  {
    id: "vac_3",
    title: "Especialista de DP e Folha de Pagamento",
    company: "Logística Integrada Brasil",
    city: "Curitiba",
    uf: "PR",
    work_mode: "remoto",
    education: "superior",
    requirements: ["Departamento pessoal", "Folha de pagamento", "TOTVS", "Compliance"],
    traits: ["detalhista", "organizado", "discreto"],
    description: "Responsável pelo processamento integral da folha de pagamento, encargos, eSocial e garantia de conformidade com acordos coletivos e legislação trabalhista.",
    disc_ideal: {
      primary: "C",
      secondary: "S"
    },
    status: "open",
    created_at: "2026-02-15T09:00:00Z"
  }
];

export const INITIAL_SEED_EXPERTS = [
  {
    id: "exp_1",
    name: "Edvania Freitas",
    title: "Especialista Executiva em Governança, Crédito & Gestão de Pessoas",
    formats: ["Consultoria", "Mentoria", "Palestras", "Aulas e treinamentos"],
    services: "Estruturação de políticas corporativas, matriz de alçadas em R$, liderança executiva e programas de mentoria para desenvolvimento de líderes.",
    about: "Idealizadora do Monte Sua Equipe e fundadora da Âmplia Performance (@ampliaperformance). Trajetória de mais de 20 anos em governança corporativa, análise de risco e formação de equipes de alta performance.",
    city: "São Paulo - SP",
    linkedin: "https://www.linkedin.com/in/edvaniafreitas",
    email: "contato@ampliaperformance.com.br",
    phone: "(11) 99999-8888",
    visible: true
  },
  {
    id: "exp_2",
    name: "Dr. Roberto Albuquerque",
    title: "Consultor de Compliance Trabalhista & LGPD no RH",
    formats: ["Consultoria", "Palestras", "Cursos"],
    services: "Adequação de processos seletivos à LGPD, auditoria de folha de pagamento e prevenção de passivos trabalhistas.",
    about: "Advogado trabalhista empresarial e consultor sênior de conformidade para departamentos de Recursos Humanos e DP.",
    city: "Curitiba - PR",
    linkedin: "https://www.linkedin.com/in/roberto-compliance-rh",
    email: "roberto@compliance-rh.com.br",
    phone: "(41) 98765-1122",
    visible: true
  }
];
