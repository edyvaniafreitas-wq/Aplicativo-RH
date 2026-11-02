/**
 * MONTE SUA EQUIPE — Análise de Qualidade do Currículo & Recomendações
 * Avaliação técnica com pontuação 0 a 100, sem constrangimento, com foco em valorização
 */

import { FREE_COURSES_PROVIDERS } from '../data/constants.js';

export class CvAnalyzer {
  static analyze(candidate, rawText = "") {
    let score = 100;
    const items = [];
    const text = (rawText || `${candidate.summary || ''} ${candidate.experience || ''} ${candidate.headline || ''}`).trim();
    const wordCount = text.split(/\s+/).filter(Boolean).length;

    // 1. Nome
    if (!candidate.full_name || candidate.full_name.trim().length < 3) {
      score -= 10;
      items.push({ status: "red", text: "Nome completo não identificado.", penalty: 10, tip: "Inclua seu nome completo no início do documento." });
    } else {
      items.push({ status: "green", text: "Nome completo identificado com clareza.", tip: "Excelente identificação inicial." });
    }

    // 2. E-mail ou WhatsApp
    const hasContact = Boolean((candidate.email && candidate.email.includes("@")) || (candidate.phone && candidate.phone.length >= 8));
    if (!hasContact) {
      score -= 12;
      items.push({ status: "red", text: "Sem e-mail ou WhatsApp para contato.", penalty: 12, tip: "Recrutadores precisam de um canal direto e seguro para convites." });
    } else {
      items.push({ status: "green", text: "Canais de contato direto disponíveis.", tip: "E-mail e telefone cadastrados facilitam agendamentos rápidos." });
    }

    // 3. LinkedIn
    if (!candidate.linkedin || !candidate.linkedin.includes("linkedin.com")) {
      score -= 6;
      items.push({ status: "yellow", text: "Link do perfil no LinkedIn ausente.", penalty: 6, tip: "Adicionar o LinkedIn amplia sua credibilidade e permite que empresas conheçam sua rede." });
    } else {
      items.push({ status: "green", text: "Perfil do LinkedIn conectado.", tip: "Presença profissional digital validada." });
    }

    // 4. Título Profissional
    if (!candidate.headline || candidate.headline.trim().length < 4) {
      score -= 10;
      items.push({ status: "red", text: "Título profissional não especificado.", penalty: 10, tip: "Defina claramente sua área e especialidade (ex: 'Analista de DP Pleno • Folha & eSocial')." });
    } else {
      items.push({ status: "green", text: `Título bem definido: "${candidate.headline.slice(0, 45)}..."`, tip: "Comunica sua especialidade logo na primeira leitura." });
    }

    // 5. Resumo
    const summaryWords = (candidate.summary || "").split(/\s+/).filter(Boolean).length;
    if (summaryWords < 25) {
      score -= 8;
      items.push({ status: "yellow", text: "Resumo profissional muito curto (menos de 25 palavras).", penalty: 8, tip: "Escreva um resumo de 3 a 5 linhas destacando sua experiência principal e resultados." });
    } else if (summaryWords > 160) {
      score -= 4;
      items.push({ status: "yellow", text: "Resumo profissional muito extenso (mais de 160 palavras).", penalty: 4, tip: "Procure ser mais conciso no resumo e deixe os detalhes para o histórico de experiências." });
    } else {
      items.push({ status: "green", text: "Resumo objetivo e com tamanho ideal.", tip: "Facilita a leitura rápida do recrutador." });
    }

    // 6. Resultados em números (%, R$, quantidades)
    const hasNumbers = /\b\d+(?:[\.,]\d+)?%|\bR\$\s*\d+|\b\d+\s*(?:milhões|mil|colaboradores|anos|projetos|processos|clientes)\b/i.test(text);
    if (!hasNumbers) {
      score -= 12;
      items.push({ status: "yellow", text: "Pouca menção a resultados quantitativos.", penalty: 12, tip: "Inclua conquistas mensuráveis (ex: 'redução de 15% em custos', 'gestão de equipe de 12 pessoas', 'fechamento de folha de R$ 2M')." });
    } else {
      items.push({ status: "green", text: "Evidências e resultados quantitativos presentes.", tip: "Demonstra o impacto real do seu trabalho nas empresas." });
    }

    // 7. Verbos de ação
    const actionVerbs = /implant|reduz|lider|coorden|desenvolv|alcanc|estrutur|aument|otimiz|gerenci|implement/i;
    if (!actionVerbs.test(text)) {
      score -= 6;
      items.push({ status: "yellow", text: "Poucos verbos de ação para descrever suas realizações.", penalty: 6, tip: "Use verbos fortes no passado ou presente (ex: 'liderei', 'otimizei rotinas', 'implantei o sistema')." });
    } else {
      items.push({ status: "green", text: "Verbos de realização ativos presentes nas experiências.", tip: "Transmite postura proativa e orientada a entregas." });
    }

    // 8. Experiência
    const expLength = (candidate.experience || "").trim().length;
    if (expLength < 200) {
      score -= 10;
      items.push({ status: "yellow", text: "Histórico de experiência breve.", penalty: 10, tip: "Descreva suas principais atribuições e projetos nas empresas por onde passou." });
    } else {
      items.push({ status: "green", text: "Histórico profissional bem fundamentado.", tip: "Permite ao gestor visualizar sua vivência prática." });
    }

    // 9. Habilidades técnicas
    const skillsCount = (candidate.skills || []).length;
    if (skillsCount < 5) {
      score -= 6;
      items.push({ status: "yellow", text: `Poucas competências selecionadas (${skillsCount} de no mínimo 5).`, penalty: 6, tip: "Selecione ferramentas, sistemas (ERP, Excel) e conhecimentos técnicos que você domina." });
    } else {
      items.push({ status: "green", text: `${skillsCount} competências técnicas mapeadas.`, tip: "Essencial para compatibilidade com as vagas abertas." });
    }

    // 10. Escolaridade
    if (!candidate.education) {
      score -= 5;
      items.push({ status: "yellow", text: "Nível de escolaridade não informado.", penalty: 5, tip: "Informe sua formação acadêmica ou técnica atual." });
    } else {
      items.push({ status: "green", text: "Nível de escolaridade registrado.", tip: "Atende aos filtros cadastrais básicos." });
    }

    // 11. Dados desnecessários ou sensíveis
    const hasUnneededData = /\b(solteir[oa]|casad[oa]|divorciad[oa]|filhos?|nascid[oa]|nascimento|religi[aã]o|cat[oó]lic[oa]|evang[eé]lic[oa])\b/i.test(text);
    if (hasUnneededData) {
      score -= 6;
      items.push({ status: "red", text: "Dados pessoais desnecessários detectados (estado civil, filhos, data de nascimento).", penalty: 6, tip: "Por boas práticas e segurança, não informe estado civil, quantidade de filhos ou religião no currículo." });
    }

    // 12. Aspirações profissionais
    const hasAspirations = Boolean(candidate.aspirations && candidate.expectations);
    if (!hasAspirations) {
      score -= 5;
      items.push({ status: "yellow", text: "Aspirações profissionais e expectativas incompletas.", penalty: 5, tip: "Contar o que você busca na carreira ajuda empresas alinhadas aos seus valores a encontrarem você." });
    } else {
      items.push({ status: "green", text: "Aspirações e momentos de carreira compartilhados.", tip: "Garante encontros profissionais com propósitos convergentes." });
    }

    // Ajuste final da pontuação (0 a 100)
    score = Math.max(10, Math.min(100, score));

    // Determinação do Semáforo
    let statusLabel = "";
    let trafficLight = "green";
    let messageTone = "";

    if (score >= 80) {
      statusLabel = "Pronto para enviar";
      trafficLight = "green";
      messageTone = "Seu currículo está muito bem estruturado e transmite segurança aos recrutadores.";
    } else if (score >= 60) {
      statusLabel = "Ajustes recomendados";
      trafficLight = "yellow";
      messageTone = "Com pequenos ajustes você valorizará ainda mais sua trajetória e aumentará suas chances de entrevista.";
    } else {
      statusLabel = "Ajustes importantes";
      trafficLight = "red";
      messageTone = "Vamos valorizar melhor sua experiência! Preencha as orientações indicadas para destacar seus pontos fortes.";
    }

    // Montagem de recomendações de cursos gratuitos
    const topicToLearn = candidate.develop_topic || (candidate.skills && candidate.skills.length > 0 ? candidate.skills[0] : "Gestão de Carreira");
    const courseRecommendations = FREE_COURSES_PROVIDERS.map(provider => ({
      provider: provider.name,
      topic: topicToLearn,
      url: `${provider.url}${encodeURIComponent(topicToLearn)}`
    }));

    return {
      score: score,
      trafficLight: trafficLight,
      statusLabel: statusLabel,
      messageTone: messageTone,
      items: items,
      tips: items.map(i => i.tip).filter(Boolean),
      topicToLearn: topicToLearn,
      courseRecommendations: courseRecommendations
    };
  }
}
