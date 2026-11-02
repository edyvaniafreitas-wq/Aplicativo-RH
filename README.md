# 🤝 Monte Sua Equipe • Plataforma Executiva de Conexão Profissional & Gestão de RH

> **Uma solução concebida e idealizada por Edvania Freitas ([@ampliaperformance](https://www.instagram.com/ampliaperformance/)) para conectar profissionais a empresas, consultorias de RH e recrutadores com respeito, acolhimento e inteligência estratégica.**

[![Brand](https://img.shields.io/badge/Idealizado%20por-Edvania%20Freitas-0ea5e9.svg)](https://www.instagram.com/ampliaperformance/)
[![Instagram](https://img.shields.io/badge/Instagram-@ampliaperformance-E1306C.svg)](https://www.instagram.com/ampliaperformance/)
[![Arquitetura](https://img.shields.io/badge/Arquitetura-100%25%20Aut%C3%B4noma%20%7C%20Sem%20Lovable-brightgreen.svg)]()
[![Status](https://img.shields.io/badge/Status-100%25%20Funcional-success.svg)]()
[![LGPD](https://img.shields.io/badge/Conformidade-LGPD%20Art.%207%20e%2018-blue.svg)]()

---

## 💡 Estudo & Análise: Por que e Como Funciona Sem o Lovable?

### 1. O Diagnóstico das Limitações do Lovable
Nas plataformas do ecossistema Lovable (como TanStack Start / Vite configurado com dependências `@lovable.dev`), os projetos enfrentam três grandes desafios:
1. **Cobrança recorrente de créditos:** Cada ajuste em formulários, regras de matching ou componentes consome créditos pagos da ferramenta.
2. **Dependência de servidores intermediários:** Se o serviço de nuvem do Lovable estiver instável, a aplicação não carrega ou perde dados.
3. **Complexidade desnecessária de build:** A dependência de empacotadores pesados dificulta a execução direta pelo cliente e aumenta o risco de telas brancas (*blank screens*) e regressões.

### 2. A Solução Perfeita e 100% Funcional (Nativa & Livre)
Este aplicativo foi concebido com uma **arquitetura moderna, limpa e autônoma**, exatamente como as plataformas corporativas de maior sucesso da Âmplia Performance (`Politicas` e `Leads`):
- **Motor 100% Client-Side:** Toda a inteligência (leitura de currículo, sanitização de CPF/RG, cálculo de compatibilidade ponderada, perfil comportamental DISC e geração de dossiês) roda no navegador do usuário, **sem custo de APIs pagas e sem IA cara**.
- **Duplo Modo de Persistência:**
  - *Modo Autônomo Imediato:* Utiliza LocalStorage e IndexedDB com isolamento e governança, funcionando instantaneamente sem necessidade de configurar nada.
  - *Modo Nuvem (Opcional):* Totalmente compatível com Supabase padrão caso a administradora decida hospedar um backend compartilhado.
- **PWA (Progressive Web App):** Instalável no celular e no computador com Service Worker que armazena as telas em cache e **nunca expõe dados pessoais**.

---

## 🏛️ Funcionalidades Implementadas

### 👤 1. Área do Profissional (Candidato)
- **Minha Jornada:** Faixas com mensagens acolhedoras, progresso do perfil e 5 passos com **Semáforos Dinâmicos**:
  1. *Conte sua história:* Dados de trajetória e competências.
  2. *Valorize sua trajetória:* Diagnóstico e nota de 0 a 100 do currículo.
  3. *Descubra seu estilo:* Perfil comportamental DISC.
  4. *Explore possibilidades:* Vagas internas compatíveis.
  5. *Prepare o próximo passo:* Convites recebidos.
- **Meu Currículo (2 Etapas):**
  - *Etapa 1:* Importação de arquivo (PDF, DOCX, TXT até 8MB) ou colar texto livre. Remoção automática de CPF e RG (minimização LGPD).
  - *Etapa 2:* Apresentação do que foi extraído com botão "Corrigir" e formulário inteligente que exibe **somente os campos faltantes**.
  - Dicionário de mais de 80 competências técnicas e 15 estilos comportamentais mapeados por raízes textuais.
- **Perfil Comportamental (DISC):**
  - 24 afirmações originais com escala Likert de 1 a 5.
  - Cálculo de nota bruta (0 a 100) e **intensidade relativa** para mitigar viés de aquiescência.
  - Identificação de estilo predominante e secundário com cards informativos.
  - Modal formal de **Base Científica & Ética** (Marston 1928, Walter Clarke 1956, Sackett 2022 e Lei 4.119/1962).
- **Análise do Currículo:**
  - Anel de pontuação de 0 a 100 com semáforo (Verde: *Pronto para enviar*; Amarelo: *Ajustes recomendados*; Vermelho: *Ajustes importantes*).
  - Linguagem respeitosa e encorajadora (*"Vamos valorizar melhor sua experiência"*).
  - Recomendações de cursos gratuitos geradas automaticamente com links diretos para **Escola Virtual Gov (EV.G), Fundação Bradesco, Sebrae, SENAI Play, Coursera e YouTube Educacional**.
- **Vagas para Mim:**
  - Vagas internas ordenadas por compatibilidade com **Dois Semáforos Separados** (Técnico e Comportamental — nunca somados).
  - Botão *"Tenho interesse"* para manifestação de candidatura.
  - Links prontos de pesquisa externa de vagas no **LinkedIn, Indeed, Gupy e Vagas.com**.
- **Convites:**
  - Confirmação de presença, recusa educada ou pedido de remarcação com justificativa.
  - Sincronização direta com **Google Agenda** e download de arquivo de calendário **.ICS** com lembrete de 1 hora antes.
- **Privacidade & Dados (LGPD Art. 18):**
  - Exportação completa dos dados em arquivo JSON.
  - Exclusão irrevogável da conta e dos dados a qualquer momento pelo próprio titular.

---

### 🏢 2. Área da Empresa / Recrutamento & RH
- **Visão Geral:** Indicadores de vagas ativas, profissionais disponíveis e saúde das vagas com semáforo de aderência.
- **Buscar Talentos com Reconhecimento de Voz & IA de Regras:**
  - Campo de texto livre com botão de microfone via **Web Speech API nativa (pt-BR)**.
  - Interpretação semântica de cargo, cidade, estado, conhecimentos exigidos e traços comportamentais.
  - **Motivo da busca obrigatório** (mínimo de 5 caracteres) para registro inviolável em `search_logs`.
  - Alerta legal sobre a **Lei nº 9.029/1995** (vedação de práticas discriminatórias por idade).
  - Roteiro estruturado de entrevista gerado automaticamente com perguntas direcionadas para conhecimentos faltantes e fatores DISC.
- **Gestão de Vagas:** Formulário completo com definição de competências e estilos DISC ideais.
- **Esteira Kanban de Recrutamento (7 Etapas):**
  1. *Triagem Inicial*
  2. *Entrevista com RH*
  3. *Teste Técnico / Estudo de Caso*
  4. *Entrevista com a Liderança*
  5. *Dinâmica de Grupo*
  6. *Entrevista Final*
  7. *Proposta & Alinhamento*
- **Automação de Convites:** Geração instantânea do texto formatado com botões de disparo para WhatsApp, e-mail, Google Agenda e arquivo `.ics`.
- **Dossiê Executivo C-Level (HTML / Impressão):** Documento formal com carimbo de confidencialidade LGPD, quebra analítica de compatibilidade, trajetória profissional e formulário de notas de 1 a 5 para os entrevistadores.

---

### 🛡️ 3. Área da Administradora (Governança & Analytics)
- **Início & Cuidados:** 3 cartões de semáforo para acompanhar aprovações pendentes, conexões ativas e movimentação de vagas.
- **Painel Executivo com 6 KPIs:**
  - Total de Usuários (+N em 7 dias)
  - Profissionais Cadastrados
  - Empresas & Consultorias
  - Buscas de Talentos Realizadas
  - Conexões Geradas (entrevistas + interesses)
  - % de Usuários que Salvaram Dados (com semáforo: Verde >= 50%, Amarelo >= 25%, Vermelho < 25%)
- **Gráficos Acessíveis:** Funil de conexões, engajamento por etapa e distribuição dos estilos DISC.
- **Gestão de Usuários:** Aprovação e bloqueio de contas corporativas com um clique.
- **Auditoria Completa & Exportações:**
  - Exportação em **CSV** dos logs de buscas corporativas (quem buscou, pedido, motivo e resultados).
  - Exportação em **CSV** da trilha de atividades do sistema.
- **Configurações & Marca:**
  - Chaves de aprovação automática e visibilidade de dados.
  - Personalização de título e slogan do aplicativo.

---

### 🌟 4. Vitrine de Especialistas
- Espaço aberto para divulgação de consultores, mentores, palestrantes e instrutores de treinamento.
- Filtros por formatos (Consultoria, Mentoria, Palestras, Treinamentos, Aulas).
- Formulário aberto *"Apresente seu trabalho"*.

---

## 🚀 Como Executar Localmente

### Opção 1: Execução Imediata via PowerShell (Recomendado no Windows)
Não requer Node.js nem instalação de pacotes:
1. Abra o terminal na pasta do projeto:
   ```powershell
   powershell -ExecutionPolicy Bypass -File .\serve.ps1 -Port 5080
   ```
2. Abra no navegador:
   👉 **http://localhost:5080**

### Opção 2: Execução com Node / Vite
Se preferir usar o Vite:
```sh
npm install
npm run dev
```

---

## 🎨 Identidade Visual ("Gente que Conecta")

- **Tipografia:**
  - Títulos de Impacto: **Bricolage Grotesque** (Display 700/800 com letter-spacing negativo)
  - Leitura & Interface: **Source Sans 3**
  - Métricas e Números: **IBM Plex Mono**
- **Cores & Harmonia:**
  - Azul Royal (`#2459CF`) — Confiança executiva e solidez
  - Coral Acolhedor (`#AF3557` / `#F27687`) — Humanização e calor
  - Lilás Estratégico (`#7045AF` / `#A487EC`) — Sabedoria e reflexão
  - Dourado Conquista (`#90521E` / `#FFF3D7`) — Realização e oportunidade
- **Semáforo Universal ("Light"):** Três lâmpadas lado a lado (vermelho, amarelo, verde) com apenas uma acesa por vez, sempre acompanhadas de texto claro em alto contraste.

---

## ⚖️ Conformidade Legal & Ética
- **LGPD (Lei nº 13.709/2018):** Minimização rigorosa de dados. CPF e RG são expurgados no front-end antes de qualquer persistência.
- **Lei nº 9.029/1995:** Proibição de exigência discriminatória de idade, gênero ou estado civil para fins admissionais.
- **Lei nº 4.119/1962 & Resolução CFP nº 31/2022:** Esclarecimento explícito de que o mapeamento DISC apoia o diálogo e o autoconhecimento, não se constituindo em avaliação psicológica clínica privativa.
