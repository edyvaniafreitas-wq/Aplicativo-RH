# Prompts para criar o **Monte Sua Equipe** no Lovable

**Como usar:** cole um prompt por vez no Lovable, na ordem, e só avance quando a etapa anterior estiver funcionando. Mandar tudo de uma vez costuma gerar código incompleto. Antes do Prompt 1:
1. Ative o **Lovable Cloud** (ou conecte o seu Supabase) no projeto.
2. Envie para o projeto as 6 fotos da marca (perfil, entrevista, aprender, equipe, comunidade e comunidade-sm), que estão na pasta `img` do pacote MonteSuaEquipe.zip.

Entre um prompt e outro, teste o que foi pedido. Se algo falhar, peça a correção antes de seguir.

---

## PROMPT 1 · Fundação, identidade visual, login e banco seguro

```
Crie um aplicativo web chamado "Monte Sua Equipe": uma plataforma GRATUITA que conecta profissionais (candidatos, empregados ou não) a empresas, consultorias de RH e recrutadores. Ela nasce para o grupo do LinkedIn "Monte Sua Equipe", idealizado por Edvania Freitas. Todo o texto da interface é em português do Brasil, com tom profissional, executivo, acolhedor e respeitoso. Nunca use termos que constranjam ou julguem as pessoas.

STACK: React + Vite + TypeScript + Tailwind + shadcn/ui, com Lovable Cloud (Supabase) para autenticação, banco e funções. Não use nenhuma API paga nem IA paga. Toda a inteligência (leitura de currículo, interpretação da busca, compatibilidade, perfil comportamental) deve ser feita por regras no próprio código.

IDENTIDADE VISUAL ("Gente que conecta"), definida em tokens CSS e com modo claro e escuro:
- Claro: fundo #F7FAFF com brilho radial #E7F5FF no canto superior direito; superfície #FFFFFF; superfície 2 #EDF3FF; texto #203458; texto secundário #536581; linhas #DFE7F4; destaque azul royal #2459CF (suave #EAF1FF); coral #AF3557 (suave #FFF0F3, faixa #F27687); lilás #7045AF (suave #F2EDFF, faixa #A487EC); dourado #90521E (suave #FFF3D7).
- Degradês: hero linear-gradient(135deg,#EAF3FF,#F4EEFF); boas-vindas (120deg,#EFF6FF,#F6EEFF); bloco "crescer" (110deg,#FFF0F2,#F3F0FF); marca (140deg,#2459CF,#8760DF).
- Escuro: fundo #0D1322, superfície #151D31, superfície 2 #1C2640, texto #E7EDFB, secundário #9EABC8, linhas #2A3656, destaque #86A8F7.
- Tipografia (Google Fonts): títulos em "Bricolage Grotesque" 700/800, com letter-spacing negativo; texto em "Source Sans 3"; números e dados em "IBM Plex Mono".
- Cantos de 20px nos cartões e 28px nos blocos de boas-vindas; botões com no mínimo 44px de altura e cantos de 12px; sombra suave 0 8px 30px rgba(48,86,160,.07).
- Cartões de passos com faixa superior de 4px alternando azul (#477BEE), coral (#F27687) e lilás (#A487EC).
- Totalmente responsivo: no celular, as abas rolam na horizontal e nada pode gerar rolagem lateral da página. Respeite prefers-reduced-motion.

SEMÁFORO (componente reutilizável "Light"): três lâmpadas lado a lado (vermelho #d03b3b, amarelo #fab219, verde #0ca30c) com só uma acesa, sempre acompanhadas de um rótulo em texto (nunca só a cor). Também deve existir o estado "sem dados", com todas apagadas.

LOGIN OBRIGATÓRIO: nenhuma tela além da de entrada funciona sem conta.
- Tela de entrada: à esquerda, um hero com o selo "Grupo Monte Sua Equipe", o título "Gente que conecta. Talentos que transformam.", o texto "Boas conversas abrem caminhos. Encontre talentos, compartilhe sua trajetória e descubra novas oportunidades. Gratuito para profissionais e empresas. Vamos construir essa história juntos?", dois blocos (Profissionais ⇄ Empresas e RH), a foto "comunidade" ocupando toda a largura na base e três cartões (Segurança, Dados mínimos, Você no controle). À direita, fixo no desktop, o formulário com as abas "Criar conta" (padrão) e "Já tenho conta".
- No celular: esconda os blocos e os cartões do hero e mostre o formulário logo após a foto.
- Cadastro de Profissional: nome completo, e-mail, senha (mínimo de 8 caracteres) e aceite dos termos.
- Cadastro de Empresa, RH ou consultoria: os mesmos campos mais empresa, CNPJ (opcional), cargo, telefone, tipo (Empresa, Consultoria de RH, Recrutador autônomo, Outro) e "Por que deseja buscar profissionais aqui?" (obrigatório). O aceite dos termos informa que as buscas ficam registradas com o motivo.
- Inclua "Esqueci minha senha", confirmação de e-mail e a tela "Cadastro em análise" para contas pendentes ou bloqueadas.

PAPÉIS: candidate (Profissional), recruiter (Empresa/RH), admin (Administradora). O e-mail da administradora fica na tabela app_settings, e quem se cadastra com ele vira admin automaticamente. Ninguém consegue escolher "admin" no cadastro nem alterar o próprio papel ou status.

BANCO (crie com Row Level Security em TODAS as tabelas):
- app_settings (linha única): admin_email, auto_approve_candidates (padrão true), auto_approve_recruiters (padrão false), recruiters_see_contact (true), recruiters_can_export (true), candidates_see_vacancies (true), experts_visible (true). Usuários logados leem tudo, exceto admin_email; só a admin altera.
- profiles: id (= auth.users.id), email, full_name, role, status (pending/approved/blocked), company, cnpj, job_title, phone, recruiter_type, purpose, terms_accepted_at, created_at, last_seen_at. Um gatilho cria o perfil no cadastro e aprova ou deixa pendente conforme app_settings. Outro gatilho impede o usuário de mudar o próprio role, status ou email. Cada pessoa vê o próprio perfil; a admin vê todos.
- candidates: user_id, full_name, headline, city, uf, work_mode, age_band, is_minor, guardian_name, guardian_consent, education, summary, experience, skills[], traits[], keywords[], aspirations, expectations, contribution, best_quality, develop_topic, linkedin, email, phone, photo (base64 reduzida, até 150 KB), cv_text (até 20 mil caracteres), disc (jsonb), visible, notify_email, consent_at, updated_at. Regra: menor de idade exige guardian_consent e o nome do responsável. Só o dono e a admin acessam a tabela.
- VIEW v_candidates para as empresas: mostra só perfis visíveis, e só para recrutadores aprovados ou para a admin. O e-mail e o telefone aparecem somente se recruiters_see_contact estiver ligado, se quem consulta for a admin, ou se o recrutador já agendou entrevista com aquele profissional ou se o profissional demonstrou interesse numa vaga dele. A view nunca expõe cv_text.
- vacancies: owner_id, title, company, city, uf, work_mode, education, requirements[], traits[], description, disc_ideal (jsonb, com primary e secondary opcionais), status (open/closed), datas.
- applications (interesse do profissional em uma vaga, único por par).
- interviews: recruiter_id, candidate_id, vacancy_id, vacancy_title, company, stage (triagem, rh, teste, gestor, dinamica, final, proposta), scheduled_at, duration_min, mode, location, notes, status (agendada, confirmada, recusada, remarcar, concluida, cancelada), candidate_note. O profissional responde só pela função respond_interview, que altera apenas o status e a nota do próprio convite.
- experts (Vitrine de Especialistas): nome, título, formatos[], serviços, sobre, cidade, linkedin, email, telefone, visível.
- search_logs (cada busca de talentos: quem, pedido, motivo com no mínimo 5 caracteres, vaga, critérios e quantidade de resultados) e activity (log de ações). As duas aceitam só INSERT feito pelo próprio usuário; nenhuma alteração ou exclusão; leitura apenas pela admin. Um gatilho grava o e-mail do usuário e a data do servidor.
- branding (logo e imagem de capa enviados pela admin): leitura pública, alteração só pela admin.
- Função delete_my_account (o titular exclui a própria conta, LGPD art. 18) e touch_last_seen.

Teste as regras: um profissional não pode ver outro profissional; uma empresa pendente não vê ninguém; ninguém se promove a admin; ninguém apaga registros de busca.
```

---

## PROMPT 2 · Profissional: currículo primeiro, só os campos que faltam

```
Crie a área do PROFISSIONAL, com as abas: Minha jornada, Meu currículo, Perfil comportamental, Análise do currículo, Vagas para mim, Convites, Vitrine e Privacidade. Depois do cadastro, o profissional cai direto em "Meu currículo".

No topo de cada aba, coloque uma faixa com foto e uma frase acolhedora (selo "Conexões que fazem a diferença"):
- Meu currículo (foto perfil): "Sua história tem valor." / "Conte o que aprendeu, realizou e deseja construir."
- Análise (foto aprender): "Seu próximo passo pode começar com uma descoberta."
- Vagas (foto equipe): "Novas equipes. Novas possibilidades."
- Convites (foto entrevista): "Uma boa conversa pode abrir caminhos."
- Vitrine (foto aprender): "O que você sabe pode inspirar alguém."

MEU CURRÍCULO, em 2 etapas:
ETAPA 1: só a importação, sem nenhum campo. Área grande de arrastar ou clicar para enviar PDF, DOCX ou TXT (até 8 MB), mais a opção "colar o texto do currículo ou do LinkedIn". Leia o PDF com pdfjs-dist e o DOCX com mammoth, no navegador. O arquivo NÃO é guardado, só o texto. Remova CPF e RG do texto antes de salvar. Inclua um link discreto "Montar meu perfil do zero" para quem ainda não tem currículo (primeiro emprego).
Leitura automática por regras:
- e-mail, telefone e link do LinkedIn por expressões regulares;
- nome: primeira linha com 2 a 6 palavras;
- título profissional: a linha logo abaixo do nome;
- cidade e UF: padrão "Cidade - UF" ou uma lista de cidades brasileiras;
- escolaridade por palavras-chave: doutorado, mestrado, pós/MBA, bacharel/graduação, "cursando" (superior em andamento), técnico, ensino médio/segundo grau, fundamental;
- faixa etária: um "NN anos" no início do texto;
- seções Resumo/Perfil/Objetivo e Experiência;
- habilidades por dicionário;
- comportamentos por palavras-gatilho;
- palavras-chave: as habilidades encontradas mais os 12 termos mais frequentes, sem nome, e-mail e títulos de seção.
ETAPA 2:
- Bloco "Encontramos no seu currículo", listando cada informação lida com um botão "Corrigir" (que abre só aquele campo).
- Abaixo, aparecem SOMENTE os campos que o currículo não trouxe, agrupados em Identificação, Trajetória e Aspirações.
- Campos possíveis: foto, nome, título, cidade+UF, e-mail, WhatsApp, LinkedIn, escolaridade, modalidade (presencial/híbrido/remoto/qualquer), faixa etária (opcional: 14-17, 18-24, 25-29, 30-39, 40-49, 50-59, 60+; se 14-17, pedir nome e autorização do responsável), resumo, experiências, habilidades (chips), "Como você trabalha" (botões de comportamento) e as 5 aspirações: o que busca na carreira, o que espera das empresas, o que pode entregar, maior qualidade e tema que quer desenvolver.
- Por último: privacidade (mostrar o perfil para empresas aprovadas; receber alertas por e-mail a cada 5 dias; consentimento LGPD obrigatório).
DEPOIS DE SALVAR: resumo do perfil em 3 colunas, semáforo "% completo" (verde a partir de 80, amarelo a partir de 50), aviso "Faltam N informações · Completar agora" (que abre só o que falta) e os botões Editar perfil e Importar currículo atualizado.

DICIONÁRIO DE HABILIDADES: Excel, Excel avançado, Power BI, SQL, Python, SAP, Oracle, TOTVS, Protheus, Mega ERP, Contas a receber, Contas a pagar, Tesouraria, Fluxo de caixa, Conciliação bancária, Análise de crédito, Crédito, Cobrança, Recuperação de crédito, Negociação, Faturamento, Controladoria, Contabilidade, Fiscal, DRE, Análise de balanço, Orçamento, FP&A, Auditoria, Compliance, Imposto de Renda, Folha de pagamento, Departamento pessoal, Recrutamento e seleção, Treinamento e desenvolvimento, Gestão de pessoas, Liderança de equipes, Atendimento ao cliente, Vendas, CRM, Marketing digital, Mídias sociais, Logística, Compras, Estoque, Gestão de projetos, Scrum, Power Automate, Automação de processos, Inteligência Artificial, JavaScript, React, Java, C#, Inglês, Espanhol, Libras, Comunicação, Pacote Office, Google Sheets, Contratos, Jurídico, Imobiliário, Combustíveis, Energia, Call center, Telemarketing, Recepção, Administrativo, Secretariado, CNH B, CNH D, Segurança do trabalho, Manutenção, Elétrica, Mecânica, Produção, Qualidade, ISO 9001, Enfermagem, Primeiros socorros, Cozinha, Design, Canva, Photoshop, Redação, PNL, DISC, Coaching, Oratória

COMPORTAMENTOS (chave, rótulo, raízes que identificam no texto, já sem acento e em minúsculas):
- `calmo` — **Tranquilo(a)** — palavras-gatilho: tranquil,calm,seren,pacien,equilibr
- `logico` — **Lógico(a) e analítico(a)** — palavras-gatilho: logic,analitic,raciocin,racional
- `discreto` — **Discreto(a) e ético(a)** — palavras-gatilho: discre,fofoc,etic,sigil,confidenc,reservad
- `lider` — **Liderança** — palavras-gatilho: lider,gestao de equipe,gestor de equipe,coordenei,coordenacao de equipe
- `comunicativo` — **Comunicativo(a)** — palavras-gatilho: comunicativ,comunicacao,extrovert,oratori
- `organizado` — **Organizado(a)** — palavras-gatilho: organizad,metodic,disciplin
- `proativo` — **Proativo(a)** — palavras-gatilho: proativ,iniciativa,dono do problema
- `resiliente` — **Resiliente sob pressão** — palavras-gatilho: resilien,pressao,adaptav
- `negociador` — **Negociador(a)** — palavras-gatilho: negociador,persuas,convincen
- `criativo` — **Criativo(a) e inovador(a)** — palavras-gatilho: criativ,inovad,inovacao
- `detalhista` — **Detalhista** — palavras-gatilho: detalh,minucios,atencao aos detalhes,precisao
- `colaborativo` — **Trabalho em equipe** — palavras-gatilho: trabalho em equipe,espirito de equipe,colabor,cooperat
- `pontual` — **Pontual e comprometido(a)** — palavras-gatilho: pontual,assidu,compromet,responsav
- `empatico` — **Empático(a)** — palavras-gatilho: empat,escuta ativa,acolhed
- `aprendiz` — **Gosta de aprender** — palavras-gatilho: aprender,curios,autodidat,estudios

ANÁLISE DO CURRÍCULO ("Dê mais força à sua trajetória"): nota de 0 a 100 mostrada em anel, com semáforo (verde a partir de 80 "Pronto para enviar", amarelo a partir de 60 "Ajustes recomendados", vermelho "Ajustes importantes"). Explique que a nota avalia como o currículo está escrito e não mede o valor profissional da pessoa.
Comece em 100 e desconte:
- sem nome: -10;
- sem e-mail ou WhatsApp: -12;
- sem LinkedIn: -6;
- sem título: -10;
- resumo com menos de 25 palavras: -8 (mais de 160: -4);
- sem resultados em números (%, R$, quantidades): -12;
- sem verbos de ação (implantei, reduzi, liderei…): -6;
- experiência com menos de 200 caracteres: -10;
- menos de 5 habilidades: -6;
- sem escolaridade: -5;
- dados pessoais desnecessários (CPF, RG, estado civil, filhos, religião, data de nascimento): -6, com a orientação de retirar;
- objetivo genérico: -4;
- excesso de maiúsculas: -3;
- mais de 1.300 palavras: -4;
- aspirações incompletas: -3 a -6.
Mostre cada item com bolinha verde, amarela ou vermelha e uma dica, mais o card "Como o recrutador vê" com linguagem respeitosa. Quem tem nota baixa vê "Vamos valorizar melhor sua experiência". O card "Tema que você quer desenvolver" traz a foto aprender e links de cursos gratuitos (Escola Virtual.Gov, Fundação Bradesco, Sebrae, SENAI, Coursera, YouTube), montados como buscas.

MINHA JORNADA (início):
- Bloco de boas-vindas em 2 colunas: à esquerda, o texto "Que bom ter você aqui, [nome]." e o título "Seu próximo capítulo começa com uma conexão.", com o próximo passo pendente, uma barra de progresso "X de 5" e um botão; à direita, a foto comunidade.
- "Um passo de cada vez": 5 cartões clicáveis, cada um com semáforo: Conte sua história (% do perfil), Valorize sua trajetória (nota do currículo), Descubra seu estilo (perfil comportamental), Explore possibilidades (vagas compatíveis) e Prepare o próximo passo (convites).
- Depois: "Vagas em destaque" e "Seu estilo de trabalho" (mini gráfico DISC), e o bloco "Espaço para evoluir", com a foto aprender e o texto "Sempre há algo novo para aprender e compartilhar."

PRIVACIDADE: o que as empresas veem, e os botões exportar meus dados (JSON), corrigir e excluir conta (com confirmação na própria tela).
```

---

## PROMPT 3 · Perfil comportamental (modelo DISC) com base científica

```
Crie a aba "Perfil comportamental". Se o profissional ainda não salvou o perfil, peça que salve primeiro.

QUESTIONÁRIO: 24 afirmações originais (NÃO copie questionários comerciais protegidos), em escala de 1 a 5 (Discordo totalmente, Discordo, Neutro, Concordo, Concordo totalmente). Botões grandes, barra de progresso fixa ("12 de 24") e aviso: "Este questionário apoia o autoconhecimento e a conversa com as empresas. Ele não é um teste psicológico e não decide nenhuma contratação." Intro: "Não existem respostas certas ou erradas: responda pensando em como você age na maior parte do tempo." Ao enviar com respostas faltando, role até a primeira pendente.
Afirmações (o fator está entre colchetes):
1. [D] Gosto de assumir a frente quando é preciso decidir rápido.
2. [I] Tenho facilidade para iniciar conversas com pessoas que acabei de conhecer.
3. [S] Prefiro rotinas previsíveis a mudanças frequentes.
4. [C] Gosto de seguir procedimentos e padrões bem definidos.
5. [D] Sinto-me motivado(a) por metas desafiadoras.
6. [I] Gosto de apresentar ideias e convencer as pessoas sobre elas.
7. [S] Mantenho a paciência mesmo em momentos de pressão.
8. [C] Confiro os detalhes antes de entregar um trabalho.
9. [D] Prefiro ir direto ao ponto nas conversas de trabalho.
10. [I] Ambientes animados e com troca entre as pessoas me dão energia.
11. [S] Gosto de apoiar colegas e ajudar o time nos bastidores.
12. [C] Prefiro decidir com base em dados e evidências.
13. [D] Fico à vontade para decidir mesmo com informações incompletas.
14. [I] Costumo animar o grupo quando o clima está desmotivado.
15. [S] Valorizo relações de trabalho estáveis e de longo prazo.
16. [C] Sinto-me confortável com atividades que exigem precisão e análise.
17. [D] Encaro obstáculos como oportunidades para mostrar resultado.
18. [I] Prefiro atividades com contato frequente com pessoas.
19. [S] Prefiro concluir uma tarefa antes de começar outra.
20. [C] Gosto de entender bem as regras antes de agir.
21. [D] Quando discordo, costumo dizer de forma clara e objetiva.
22. [I] Sinto-me bem quando meu trabalho é reconhecido publicamente.
23. [S] Costumo ouvir com atenção antes de dar minha opinião.
24. [C] Quando preciso escolher, prefiro qualidade a rapidez.

CÁLCULO:
- Nota de cada fator = (soma − 6) / 24 × 100.
- Para os gráficos, use a intensidade relativa, que reduz o efeito de quem concorda com tudo: (nota + 5) dividida pela soma dos 4 fatores, em %.
- Predominante = maior nota. Secundário = o segundo, se estiver até 15 pontos do primeiro.
- "Perfil versátil" quando a diferença entre o maior e o menor percentual for menor que 8.
- Guarde em candidates.disc apenas {D,I,S,C,at,v:"MSE-DISC-24 v1"}, nunca as respostas individuais.
- Cores (validadas para daltonismo): D #eb6834, I #6250d6, S #1baf7a, C #2a78d6. No escuro: D #d95926, I #9085e9, S #199e70, C #3987e5.

RESULTADO:
- Título com o estilo (por exemplo "Analista (C)") e a frase "Estilo predominante de X, com traços marcantes de Y: combina [resumo X] com [resumo Y]".
- Gráfico de 4 barras com os percentuais.
- 9 cartões: Pontos fortes; Pontos para desenvolver; Cargos que combinam com você (os do predominante mais 2 do secundário); Atividades em que tende a se destacar; Liderança que mais favorece; Estilo ao liderar; Ambiente de trabalho ideal; Relação com os colegas; Como se comunicar melhor.
- Aderência a cada vaga aberta, com semáforo.
- Aviso final de que o resultado é autodeclarado, pode mudar e não substitui a entrevista.
- Botões "Responder novamente" e "Base científica".

TEXTOS DE CADA ESTILO (use exatamente):

**D · Dominância · estilo Executor** (resumo curto: "foco em resultado e decisão")
- Essência: Pessoas com esse estilo costumam ser orientadas a resultados, decisões ágeis e desafios. Gostam de autonomia e de ver as coisas acontecerem.
- Pontos fortes: Foco em resultado; Tomada de decisão ágil; Coragem diante de desafios; Iniciativa e senso de urgência
- Pontos para desenvolver: Ouvir mais antes de decidir; Dosar a objetividade para preservar relacionamentos; Dar atenção a detalhes e processos
- Cargos que combinam: Gestão e coordenação de áreas; Vendas consultivas e novos negócios; Gestão de projetos; Negociação e recuperação de crédito; Operações com metas; Abertura de mercados e empreendedorismo
- Atividades em que se destaca: Metas desafiadoras; Resolução de situações críticas; Negociações; Condução de projetos; Decisões com autonomia
- Liderança que mais favorece: Costuma render mais com líderes que dão autonomia, metas claras e retorno direto, sem acompanhamento excessivo.
- Estilo ao liderar: Tende a liderar pelo exemplo e pela busca de resultados. Ganha ainda mais força ao incluir escuta ativa e reconhecimento da equipe.
- Ambiente ideal: Dinâmico, com desafios, autonomia e espaço para crescer.
- Relação com os colegas: Relaciona-se bem com quem é objetivo e cumpre prazos. Ganha muito ao trabalhar com colegas detalhistas e acolhedores, que complementam seu ritmo.
- Como se comunicar melhor: Seja breve, vá direto ao ponto e apresente opções com foco em resultado.

**I · Influência · estilo Comunicador** (resumo curto: "facilidade para engajar pessoas")
- Essência: Pessoas com esse estilo costumam se destacar pela comunicação, pelo entusiasmo e pela facilidade de criar relacionamentos e influenciar positivamente.
- Pontos fortes: Comunicação e persuasão; Construção de relacionamentos; Entusiasmo que mobiliza o grupo; Criatividade e novas ideias
- Pontos para desenvolver: Organização e acompanhamento de prazos; Profundidade em análises e detalhes; Foco em uma prioridade por vez
- Cargos que combinam: Vendas e relacionamento com clientes; Marketing e comunicação; Treinamento e desenvolvimento; Atendimento e sucesso do cliente; Eventos e relações institucionais; Recrutamento e marca empregadora
- Atividades em que se destaca: Apresentações; Prospecção e networking; Facilitação de reuniões; Negociação com pessoas; Trabalho em equipe
- Liderança que mais favorece: Costuma render mais com líderes acessíveis, que reconhecem conquistas, abrem espaço para ideias e ajudam a organizar prioridades.
- Estilo ao liderar: Tende a liderar inspirando e engajando pessoas. Ganha ainda mais força ao estruturar rotinas de acompanhamento.
- Ambiente ideal: Colaborativo, comunicativo, com interação, reconhecimento e liberdade criativa.
- Relação com os colegas: Cria laços com facilidade e integra o time. Ganha muito ao trabalhar com colegas analíticos, que ajudam a estruturar ideias.
- Como se comunicar melhor: Abra espaço para conversa, demonstre entusiasmo e registre por escrito os combinados.

**S · Estabilidade · estilo Planejador** (resumo curto: "constância e cooperação")
- Essência: Pessoas com esse estilo costumam se destacar pela constância, pela cooperação e pela lealdade. Valorizam harmonia, previsibilidade e relações de confiança.
- Pontos fortes: Confiabilidade e constância; Escuta e empatia; Espírito de equipe; Serenidade sob pressão
- Pontos para desenvolver: Adaptar-se a mudanças rápidas; Expressar discordâncias com mais clareza; Assumir riscos calculados
- Cargos que combinam: Atendimento e suporte; Administrativo e backoffice; Departamento pessoal e RH; Contas a pagar e a receber; Planejamento e controle de rotinas; Saúde, educação e cuidado
- Atividades em que se destaca: Processos contínuos; Apoio ao time; Atendimento consultivo; Rotinas bem definidas; Mediação de conflitos
- Liderança que mais favorece: Costuma render mais com líderes que explicam o porquê das mudanças, oferecem segurança e reconhecem a dedicação.
- Estilo ao liderar: Tende a liderar com proximidade, apoio e estabilidade. Ganha ainda mais força ao conduzir mudanças com agilidade.
- Ambiente ideal: Harmônico, cooperativo, previsível, com rotinas claras e relações de confiança.
- Relação com os colegas: É o ponto de equilíbrio do time, leal e prestativo. Ganha muito ao trabalhar com colegas que trazem senso de urgência.
- Como se comunicar melhor: Antecipe mudanças, explique o contexto e dê tempo para adaptação.

**C · Conformidade · estilo Analista** (resumo curto: "rigor, método e análise")
- Essência: Pessoas com esse estilo costumam se destacar pela precisão, pela análise e pelo compromisso com qualidade e padrões.
- Pontos fortes: Rigor técnico e precisão; Pensamento analítico; Organização e método; Compromisso com qualidade e normas
- Pontos para desenvolver: Decidir com informações suficientes, sem esperar a perfeição; Flexibilidade diante de exceções; Compartilhar ideias com mais frequência
- Cargos que combinam: Controladoria, contabilidade e auditoria; Análise de crédito e risco; Análise de dados e BI; Compliance, jurídico e qualidade; Engenharia e tecnologia; Planejamento financeiro (FP&A)
- Atividades em que se destaca: Análises e diagnósticos; Conciliações e controles; Relatórios; Padronização de processos; Revisão de qualidade
- Liderança que mais favorece: Costuma render mais com líderes que trazem expectativas claras, critérios objetivos e tempo para entregar com qualidade.
- Estilo ao liderar: Tende a liderar pela competência técnica e pela organização. Ganha ainda mais força ao delegar e dar visibilidade às pessoas.
- Ambiente ideal: Estruturado, com processos claros, foco em qualidade e decisões baseadas em evidências.
- Relação com os colegas: Contribui com precisão e senso crítico. Ganha muito ao trabalhar com colegas comunicativos, que facilitam a integração com outras áreas.
- Como se comunicar melhor: Traga dados, seja preciso e dê tempo para análise antes de pedir uma decisão.


ADERÊNCIA COMPORTAMENTAL À VAGA:
- Perfil ideal da vaga: se a empresa escolheu um estilo indicado (e um complementar opcional), use 46% para o indicado, 30% para o complementar e 12% para os demais. Caso contrário, derive dos comportamentos marcados na vaga, partindo de peso 1 para cada fator e somando: lider→D2; proativo→D2; negociador→D1+I1; resiliente→D1+S1; comunicativo→I2; criativo→I2; empatico→S1+I1; colaborativo→S2; calmo→S2; pontual→S1+C1; organizado→C2; detalhista→C2; logico→C2; discreto→C1+S1; aprendiz→C1+I1. Depois normalize para 100%.
- Aderência = 100 − (soma das diferenças absolutas entre os percentuais do candidato e os da vaga) / 2.
- Semáforo: verde a partir de 75 "alta aderência"; amarelo a partir de 60 "aderência parcial"; vermelho "explorar na entrevista". Sem dados: lâmpadas apagadas.
- Mostre SEMPRE separado da compatibilidade técnica. Nunca some as duas.

MODAL "BASE CIENTÍFICA" (texto fixo):
- Origem: teoria de William Moulton Marston, "Emotions of Normal People" (1928). O primeiro questionário baseado nela foi criado por Walter Clarke (1956).
- Instrumentos comerciais relatam boa consistência interna, mas estudos independentes indicam que o DISC descreve estilos de comportamento e NÃO tem validade comprovada para prever desempenho no trabalho.
- O Big Five tem mais evidências, em especial a conscienciosidade (Barrick e Mount, 1991).
- A meta-análise de Sackett, Zhang, Berry e Lievens (2022, Journal of Applied Psychology) aponta a entrevista estruturada como o método de maior validade média (0,42), à frente de testes de conhecimento (0,40) e de capacidade cognitiva (0,31).
- Este questionário não é teste psicológico. Testes psicológicos são de uso exclusivo de psicólogos (Lei 4.119/1962 e Resolução CFP nº 31/2022).
- Não existe perfil certo ou errado.
```

---

## PROMPT 4 · Empresa: busca em linguagem natural, vagas, entrevistas e dossiê

```
Crie a área da EMPRESA/RH, com as abas: Visão geral, Buscar talentos, Minhas vagas, Processos, Vitrine e Minha empresa. Os profissionais vêm sempre da view v_candidates.

VISÃO GERAL:
- Boas-vindas com a foto comunidade: "Grandes equipes começam com boas conexões." e os botões Buscar talentos e Publicar vaga.
- KPIs: vagas abertas, profissionais disponíveis, etapas agendadas e presenças confirmadas.
- "Saúde das vagas", com semáforo pela quantidade de profissionais com 80% ou mais de compatibilidade (3 ou mais: verde; 1 ou 2: amarelo; 0: vermelho "Use a busca ativa").
- Gráfico de barras horizontais "Seu processo por etapa", a tabela "Próximas entrevistas" e o bloco "Cada trajetória tem algo a acrescentar".

BUSCAR TALENTOS:
- Caixa grande para descrever o profissional em texto livre, com botão de microfone (Web Speech API, pt-BR; se o navegador não suportar, avise com gentileza).
- Campo "Motivo da busca", obrigatório e registrado em search_logs, e opção "Vincular a uma vaga".
- Interprete o pedido por regras, sem acento e em minúsculas:
  - cargo: o texto depois de "quero/preciso/procuro/busco (um/uma)", até "que/com/em/para/mora…";
  - cidade: na lista de cidades ou nas cidades dos candidatos; UF pelo nome do estado ou pela sigla;
  - escolaridade mínima pelas mesmas palavras-chave da leitura de currículo;
  - idade: "menos de N anos", "mais de N", "entre N e M", "maior de idade", "jovem aprendiz" (14-24);
  - modalidade: remoto/home office, híbrido, presencial;
  - comportamentos pelas raízes (por exemplo, "não goste de fofoca" vira Discreto(a) e ético(a));
  - habilidades pelo dicionário, pelas habilidades dos candidatos e pelas frases após "saiba / conhecimento em / experiência com / domine / assuntos", divididas por vírgula ou "e".
- Mostre "Entendi assim" com chips removíveis (Cargo, Local, Escolaridade, Idade, Modalidade, Conhecimentos, Comportamentos).
- Se o pedido usar idade, mostre o aviso: "A Lei 9.029/1995 proíbe práticas discriminatórias por idade no acesso ao emprego. Use o filtro de idade apenas quando houver base legal, como Jovem Aprendiz ou atividades vedadas a menores de 18."

COMPATIBILIDADE TÉCNICA (0-100%): soma ponderada dos critérios presentes, dividida pelos pesos presentes.
- Conhecimentos (peso 45): cada requisito vale 1 se aparece inteiro no texto do candidato (título, resumo, experiência, habilidades, palavras-chave, cv_text), 0,5 se metade das palavras aparece, e 0 nos demais casos.
- Cargo (10): fração das palavras do cargo encontradas.
- Comportamentos (15).
- Local (15): mesma cidade vale 1; mesma UF vale 0,6 (ou 1, se o pedido não citar cidade); vaga remota com candidato remoto ou sem preferência vale 1.
- Escolaridade (10): atende vale 1; um nível abaixo vale 0,5.
- Modalidade (5).
- Idade é FILTRO: exclui o candidato só se a faixa informada não se sobrepõe ao pedido. Sem faixa informada, o candidato fica, com a nota "Faixa etária não informada".
- Semáforo técnico: verde a partir de 80, amarelo a partir de 55, vermelho abaixo.

RESULTADOS (até 100, ordenados pela nota técnica): cada cartão tem foto ou iniciais, nome, título, cidade, escolaridade, os semáforos Técnica e Comportamental lado a lado, um chip com o estilo DISC, o resumo, chips verdes (atende) e tracejados (a desenvolver) e os botões Ver perfil, Agendar etapa, LinkedIn, WhatsApp (wa.me/55…) e E-mail (mailto). Mostre também o e-mail e o telefone em texto selecionável, ou "Contato liberado após o primeiro agendamento".
- Avisos: "Deseja agendar alguma etapa de entrevista?" e "Os semáforos ajudam a priorizar conversas, mas não substituem a avaliação humana. Decida sempre após uma entrevista estruturada."
- "Exportar contatos e resumos": CSV com separador ";" e BOM UTF-8, registrado em activity; disponível só se app_settings permitir.
- "Busca ativa na internet": links prontos para pesquisa de pessoas no LinkedIn, Google com site:br.linkedin.com/in, Google para currículos públicos e GitHub (para perfis técnicos), mais um texto de busca booleana com botão de copiar. Explique que o app não copia nem guarda perfis externos (LGPD e regras do LinkedIn) e sugira convidar essas pessoas para o grupo.

VER PERFIL (modal): dados completos, aspirações, cartão do perfil comportamental (estilo, liderança que favorece, ambiente ideal, mini gráfico e semáforo de aderência) e "Roteiro para a entrevista estruturada", com até 6 perguntas geradas assim:
- sempre: "Fale sobre a experiência mais relevante para esta vaga e o principal resultado que você entregou.";
- até 2 perguntas para conhecimentos faltantes: "Como você lidaria com demandas de X? Conte uma situação parecida que já viveu.";
- 1 pergunta para um conhecimento atendido: "Descreva um resultado concreto que você alcançou com X. Como mediu esse resultado?";
- até 2 perguntas para fatores DISC em que o candidato fica 8 pontos ou mais abaixo do ideal da vaga:
- D: "Conte sobre uma situação em que você precisou tomar uma decisão rápida com informações incompletas. Como conduziu e qual foi o resultado?"
- I: "Descreva um momento em que precisou convencer pessoas de outras áreas sobre uma ideia. Qual foi sua abordagem?"
- S: "Fale sobre um período de rotina intensa. Como você manteve a qualidade e a constância das entregas?"
- C: "Conte sobre uma entrega que exigiu muita precisão e cumprimento de normas. Como garantiu que estava correta?"
- sempre: "O que você espera encontrar nesta empresa e como esta oportunidade se conecta com seus objetivos de carreira?"
Inclua a orientação: "Faça as mesmas perguntas a todos os candidatos da vaga e registre uma nota de 1 a 5 para cada resposta, com critérios definidos antes." Registre "ver_perfil" em activity.

AGENDAR ETAPA (modal): vaga, título, empresa, etapa, data, hora, duração, formato (Online, Presencial, Telefone), link ou endereço e orientações, já preenchidas com a descrição da etapa:
- Triagem e conversa inicial: conversa rápida para conhecer você, confirmar disponibilidade e alinhar expectativas.
- Entrevista com RH: entrevista comportamental sobre trajetória, valores, motivações e forma de trabalhar.
- Teste técnico ou estudo de caso: avaliação prática dos conhecimentos exigidos pela vaga.
- Entrevista com a liderança: conversa sobre desafios, entregas e rotina da área.
- Dinâmica de grupo: atividade em grupo para observar colaboração, comunicação e tomada de decisão.
- Entrevista final: alinhamento final com a diretoria ou sócios.
- Proposta e alinhamento: proposta, benefícios, documentação e data de início.
Depois de salvar, mostre "Convite pronto", com o texto completo (saudação, etapa, data e hora, formato, o que acontece, próximas etapas, pedido de confirmação com o link do app) e os botões Abrir e-mail, WhatsApp, LinkedIn, Google Agenda (link TEMPLATE), arquivo .ics (com lembrete de 1 hora antes), Dossiê e Copiar texto.

MINHAS VAGAS:
- Formulário: cargo, empresa, cidade, UF, modalidade, escolaridade mínima, conhecimentos exigidos (chips), comportamentos, estilo comportamental indicado e complementar (opcionais), descrição e "vaga aberta".
- Cada vaga mostra: semáforo de compatíveis, quantos têm interesse, Ver compatíveis (interessados primeiro, depois os de 55% ou mais), Busca ativa, Editar e Encerrar/Reabrir.

PROCESSOS: kanban por etapa, com status em etiqueta colorida e os botões Enviar, Próxima etapa (conclui a atual e abre o agendamento da seguinte), Dossiê, Concluir e Cancelar.

DOSSIÊ (arquivo HTML para baixar ou imprimir): dados do candidato, processo, compatibilidade, todas as etapas, perfil comportamental com a ressalva, roteiro de entrevista, resumo, experiências, aspirações, contato, próximos passos e rodapé LGPD de uso restrito.

PROFISSIONAL, aba VAGAS e CONVITES:
- "Vagas para mim": vagas internas ordenadas pela compatibilidade, com os dois semáforos. Quando a nota fica entre 55 e 79, mostre "Faltou pouco! Conhecimentos que você pode desenvolver para esta vaga:" com links de cursos gratuitos, e o botão "Tenho interesse" (applications). Inclua também "Buscar na internet", com links prontos para LinkedIn Vagas, Indeed, Gupy, Vagas.com e Google Vagas, usando o título e a cidade do profissional.
- "Convites": confirmar, pedir remarcação ou recusar (com mensagem), mais Google Agenda e .ics.

VITRINE DE ESPECIALISTAS (todos os perfis): cartões com formatos (Consultoria, Aulas e treinamentos, Cursos, Mentoria, Palestras, Aberto(a) a novas oportunidades), temas, sobre e contatos, mais o formulário "Apresente seu trabalho". Comece vazia.
```

---

## PROMPT 5 · Administradora: dashboards, auditoria, aprovações e marca

```
Crie a área da ADMINISTRADORA, com as abas: Início, Painel, Usuários, Atividade, Buscas, Buscar talentos, Vagas, Processos, Vitrine e Configurações. Tudo isso é visível somente para a admin.

INÍCIO: boas-vindas com a foto comunidade ("Conexões que abrem caminhos.") e 3 cartões com semáforo: Cuide da comunidade (pendências de aprovação), Acompanhe o movimento (conexões feitas) e Aproxime oportunidades (vagas abertas).

PAINEL ("Uso do app e conexões geradas"):
- 6 KPIs com "+N em 7 dias": usuários, profissionais, empresas, buscas, conexões (entrevistas + interesses + cliques de contato) e % de usuários que salvaram dados (este último com semáforo: verde a partir de 50, amarelo a partir de 25).
- Aviso com semáforo vermelho quando houver cadastros aguardando aprovação.
- Gráficos (cores validadas para daltonismo; legenda sempre visível e valores em texto, nunca só cor):
  1. Novos cadastros por semana (8 semanas), em colunas agrupadas: Profissionais #2a78d6 e Empresas #eb6834.
  2. Funil de conexões, em barras horizontais na escala de azuis #86b6ef, #5598e7, #2a78d6, #1c5cab, #104281: buscas, perfis visualizados, contatos iniciados, etapas agendadas e presenças confirmadas.
  3. Engajamento dos usuários, em barra 100% empilhada: salvou ou incluiu dados, só visualizou, só entrou, sem acesso.
  4. Estilos comportamentais dos profissionais (predominante de cada um), nas cores DISC.
  5. Conhecimentos mais procurados nas buscas × quantos profissionais do app os têm.
- Tabela "Engajamento por pessoa": acessos, visualizações, salvamentos e situação com semáforo (verde: salvou; amarelo: só visualizou; vermelho: só entrou), com exportação em CSV.
- Listas de conexões recentes e buscas recentes.
Ações que contam como SALVAR: perfil_disc, salvou_perfil, importou_cv, salvou_vaga, interesse, agendou, respondeu, salvou_vitrine, exportou. Ações de VISUALIZAR: ver_perfil, busca, abriu_tela, contato, dossie, vaga_externa, busca_ativa. ENTRADAS: login, sessao. Registre essas ações em activity em todo o app.

USUÁRIOS: tabela com filtro, os pendentes primeiro, troca de papel, Aprovar e Bloquear.
ATIVIDADE: filtros (Tudo, Entradas, Visualizações, Salvamentos, Conexões) e exportação em CSV.
BUSCAS: quem buscou, o pedido, o motivo e quantos perfis apareceram, com exportação em CSV.
CONFIGURAÇÕES: liga/desliga das 6 opções de app_settings, com explicação de cada uma, e "Identidade visual", para enviar logotipo (reduzido para 480px, PNG) e imagem de capa (1600px, JPEG 82%) para a tabela branding. O logotipo substitui o símbolo do topo; a capa substitui a foto principal da entrada e das boas-vindas.

TERMOS E PRIVACIDADE (modal acessível no rodapé de todas as telas e no cadastro):
- finalidade;
- dados tratados (só profissionais; CPF e RG removidos; o arquivo não é guardado);
- base legal: consentimento (LGPD art. 7º, I);
- quem vê: empresas aprovadas, com cada busca registrada;
- menores só com o responsável (art. 14);
- proibição de discriminação (Lei 9.029/1995);
- direitos do titular (art. 18);
- buscas externas;
- contato de privacidade.
Rodapé: "Monte Sua Equipe · conexão entre profissionais e empresas · gratuito para todos · Idealizado por Edvania Freitas".
```

---

## PROMPT 6 · Alertas por e-mail, PWA e revisão final

```
1. Crie a função de backend "conexoes" (Edge Function), protegida por um segredo próprio (CRON_SECRET), que envia e-mails pelo plano GRATUITO da Brevo (API smtp/email, até 300 por dia; limite DAILY_LIMIT de 250):
   - a cada 5 dias (pg_cron), cada profissional com alerta ligado recebe até 5 vagas internas com 60% ou mais de compatibilidade (mesma fórmula do app), com o que desenvolver, mais vagas recentes da internet pela API gratuita da Adzuna (país br, se houver chave) e links de busca prontos;
   - cada empresa recebe, por vaga aberta, até 10 profissionais novos com 60% ou mais: nome, título, cidade, resumo, telefone e e-mail (se a configuração permitir), LinkedIn e link para o app;
   - na hora: uma vaga nova avisa os profissionais com 70% ou mais, e um profissional novo ou atualizado avisa as empresas com vaga compatível de 70% ou mais;
   - guarde em match_notifications cada par profissional–vaga já avisado, para nunca repetir.
2. Transforme o app em PWA instalável: manifest (nome Monte Sua Equipe, theme #2459CF, ícones 192 e 512) e service worker com cache das telas e fotos, mas nunca dos dados pessoais.
3. Revisão final:
   - todos os textos em português, profissionais, acolhedores e sem termos que constranjam;
   - contraste AA no claro e no escuro;
   - nada de rolagem lateral no celular (390px);
   - foco visível no teclado;
   - teste o fluxo completo: cadastro → importação do currículo → só os campos faltantes → perfil comportamental → busca da empresa → agendamento → convite confirmado → painel da admin mostrando tudo.
```

---

### Observações importantes
- **Base pronta:** o banco com todas as regras de segurança já testadas está no arquivo `supabase/1-schema.sql` do pacote. Se o Lovable criar as tabelas diferente, cole esse SQL no editor SQL do Lovable Cloud ou do Supabase e peça ao Lovable para usar essas tabelas.
- **Créditos:** cada prompt consome créditos do Lovable. Dividir em 6 etapas evita retrabalho e gasto com correções.
- **Referência viva:** a demonstração publicada mostra exatamente como cada tela deve ficar. Use-a para comparar o resultado.
