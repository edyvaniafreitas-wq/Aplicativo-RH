/**
 * MONTE SUA EQUIPE — Motor de Compatibilidade Técnica & Roteiro Estruturado de Entrevista
 * Algoritmo transparente, auditável, sem caixas-pretas e em total respeito à legislação
 */

import { DiscEngine } from './disc-engine.js';
import { DISC_PROFILES_INFO } from '../data/constants.js';

export class MatchingEngine {
  /**
   * Calcula a compatibilidade técnica ponderada (0 a 100%)
   * @param {Object} candidate Objeto do candidato
   * @param {Object} vacancy Objeto da vaga ou critérios da busca
   */
  static calculateTechnical(candidate, vacancy) {
    let earnedWeight = 0;
    let totalPossibleWeight = 0;
    const details = [];

    const candidateFullText = [
      candidate.headline || '',
      candidate.summary || '',
      candidate.experience || '',
      ...(candidate.skills || []),
      ...(candidate.keywords || []),
      candidate.raw_cleaned_text || ''
    ].join(' ').toLowerCase();

    // 1. Conhecimentos e Competências Técnicas (Peso 45)
    const requiredSkills = vacancy.requirements || [];
    if (requiredSkills.length > 0) {
      const weight = 45;
      totalPossibleWeight += weight;
      let matchedCount = 0;
      const missingSkills = [];
      const presentSkills = [];

      requiredSkills.forEach(skill => {
        const sLower = skill.toLowerCase();
        if (candidateFullText.includes(sLower)) {
          matchedCount += 1.0;
          presentSkills.push(skill);
        } else {
          // Checa se pelo menos metade das palavras aparecem
          const words = sLower.split(/\s+/).filter(w => w.length > 2);
          const wordsFound = words.filter(w => candidateFullText.includes(w)).length;
          if (words.length > 1 && wordsFound >= Math.ceil(words.length / 2)) {
            matchedCount += 0.5;
            presentSkills.push(`${skill} (parcial)`);
          } else {
            missingSkills.push(skill);
          }
        }
      });

      const skillRatio = Math.min(1.0, matchedCount / requiredSkills.length);
      const points = skillRatio * weight;
      earnedWeight += points;
      details.push({
        criterion: "Conhecimentos Técnicos",
        weight: weight,
        earned: Math.round(points),
        info: `${presentSkills.length} de ${requiredSkills.length} requisitos identificados`,
        missing: missingSkills,
        present: presentSkills
      });
    }

    // 2. Cargo / Título Profissional (Peso 10)
    if (vacancy.title) {
      const weight = 10;
      totalPossibleWeight += weight;
      const targetWords = vacancy.title.toLowerCase().split(/\s+/).filter(w => w.length > 3 && !["vaga", "para", "de", "com"].includes(w));
      const candHeadline = (candidate.headline || '').toLowerCase();
      let foundWords = 0;
      targetWords.forEach(w => {
        if (candHeadline.includes(w) || candidateFullText.includes(w)) foundWords++;
      });
      const ratio = targetWords.length > 0 ? foundWords / targetWords.length : 1.0;
      const points = ratio * weight;
      earnedWeight += points;
      details.push({
        criterion: "Alinhamento de Cargo",
        weight: weight,
        earned: Math.round(points),
        info: ratio >= 0.7 ? "Forte alinhamento com a função" : "Transição ou afinidade com a área"
      });
    }

    // 3. Comportamentos Desejados (Peso 15)
    const requiredTraits = vacancy.traits || [];
    if (requiredTraits.length > 0) {
      const weight = 15;
      totalPossibleWeight += weight;
      const candTraits = candidate.traits || [];
      const foundTraits = requiredTraits.filter(t => candTraits.includes(t));
      const ratio = foundTraits.length / requiredTraits.length;
      const points = ratio * weight;
      earnedWeight += points;
      details.push({
        criterion: "Estilos de Trabalho e Comportamentos",
        weight: weight,
        earned: Math.round(points),
        info: `${foundTraits.length} de ${requiredTraits.length} estilos convergentes`
      });
    }

    // 4. Localização (Peso 15)
    if (vacancy.city || vacancy.uf) {
      const weight = 15;
      totalPossibleWeight += weight;
      let ratio = 0;
      const isRemoteVacancy = (vacancy.work_mode || '').toLowerCase() === 'remoto';
      const isRemoteCandidate = (candidate.work_mode || '').toLowerCase() === 'remoto' || (candidate.work_mode || '').toLowerCase() === 'qualquer';

      if (isRemoteVacancy && isRemoteCandidate) {
        ratio = 1.0;
      } else if (vacancy.city && candidate.city && vacancy.city.toLowerCase() === candidate.city.toLowerCase()) {
        ratio = 1.0;
      } else if (vacancy.uf && candidate.uf && vacancy.uf.toUpperCase() === candidate.uf.toUpperCase()) {
        ratio = vacancy.city ? 0.6 : 1.0;
      } else if (!vacancy.city && vacancy.uf && candidate.uf && vacancy.uf.toUpperCase() === candidate.uf.toUpperCase()) {
        ratio = 1.0;
      } else {
        ratio = 0.2; // Mobilidade ou interesse interestadual
      }

      const points = ratio * weight;
      earnedWeight += points;
      details.push({
        criterion: "Localização e Deslocamento",
        weight: weight,
        earned: Math.round(points),
        info: ratio === 1.0 ? "Mesma localidade ou 100% remoto" : ratio >= 0.6 ? "Mesmo estado" : "Localidades diferentes"
      });
    }

    // 5. Escolaridade (Peso 10)
    if (vacancy.education) {
      const weight = 10;
      totalPossibleWeight += weight;
      const ranks = { fundamental: 1, medio: 2, tecnico: 3, cursando: 4, superior: 5, pos: 6, mestrado: 7, doutorado: 8 };
      const reqRank = ranks[vacancy.education] || 2;
      const candRank = ranks[candidate.education] || 2;
      let ratio = 0;
      if (candRank >= reqRank) {
        ratio = 1.0;
      } else if (candRank === reqRank - 1) {
        ratio = 0.5;
      } else {
        ratio = 0.2;
      }
      const points = ratio * weight;
      earnedWeight += points;
      details.push({
        criterion: "Formação e Escolaridade",
        weight: weight,
        earned: Math.round(points),
        info: ratio === 1.0 ? "Atende ou supera a formação mínima" : "Formação próxima"
      });
    }

    // 6. Modalidade de Trabalho (Peso 5)
    if (vacancy.work_mode) {
      const weight = 5;
      totalPossibleWeight += weight;
      const vMode = vacancy.work_mode.toLowerCase();
      const cMode = (candidate.work_mode || 'qualquer').toLowerCase();
      const ratio = (vMode === cMode || cMode === 'qualquer') ? 1.0 : 0.4;
      const points = ratio * weight;
      earnedWeight += points;
      details.push({
        criterion: "Modalidade de Atuação",
        weight: weight,
        earned: Math.round(points),
        info: ratio === 1.0 ? "Totalmente compatível" : "Flexibilidade a confirmar"
      });
    }

    // Cálculo final proporcional
    const score = totalPossibleWeight > 0 ? Math.round((earnedWeight / totalPossibleWeight) * 100) : 75;

    // Semáforo Técnico
    let trafficLight = "yellow";
    let label = "Compatibilidade Moderada";
    if (score >= 80) {
      trafficLight = "green";
      label = "Alta Compatibilidade Técnica";
    } else if (score < 55) {
      trafficLight = "red";
      label = "Desenvolvimento Prévio Necessário";
    }

    return {
      score: score,
      trafficLight: trafficLight,
      label: label,
      details: details
    };
  }

  /**
   * Avalia os dois semáforos juntos: Técnico e Comportamental (DISC)
   * Garantindo que NUNCA sejam somados ou misturados em uma única nota
   */
  static evaluateCandidateForVacancy(candidate, vacancy) {
    const techMatch = this.calculateTechnical(candidate, vacancy);
    const discMatch = DiscEngine.calculateAdherence(candidate.disc?.relative, vacancy.disc_ideal);

    // Geração do Roteiro Estruturado de Entrevista
    const interviewQuestions = this.generateStructuredInterviewQuestions(candidate, vacancy);

    return {
      technical: techMatch,
      behavioral: discMatch,
      interviewQuestions: interviewQuestions
    };
  }

  /**
   * Interface unificada de cálculo de aderência com pontuação global e detalhamento
   */
  static calculateMatch(candidate, vacancy) {
    const evalResult = this.evaluateCandidateForVacancy(candidate, vacancy);
    const tech = evalResult.technical;
    const disc = evalResult.behavioral;
    return {
      overall: tech.score,
      trafficLight: tech.trafficLight,
      label: tech.label,
      breakdown: {
        skillsScore: tech.details.find(d => d.criterion.includes("Conhecimentos"))?.earned || 0,
        traitsScore: tech.details.find(d => d.criterion.includes("Estilos"))?.earned || 0,
        locationScore: tech.details.find(d => d.criterion.includes("Localização"))?.earned || 0,
        discScore: disc.adherence || 75
      },
      technical: tech,
      behavioral: disc,
      interviewQuestions: evalResult.interviewQuestions
    };
  }

  /**
   * Criação do Roteiro Científico de Entrevista Estruturada
   */
  static generateStructuredInterviewQuestions(candidate, vacancy) {
    const questions = [];
    const reqs = vacancy.requirements || [];
    const candSkills = (candidate.skills || []).map(s => s.toLowerCase());

    // 1. Até 2 perguntas para conhecimentos técnicos faltantes
    const missing = reqs.filter(r => !candSkills.includes(r.toLowerCase()));
    missing.slice(0, 2).forEach(item => {
      questions.push({
        topic: `Conhecimento a Aprofundar: ${item}`,
        type: "tecnica_faltante",
        question: `Como você lidaria com demandas que exigem conhecimento em ${item}? Conte uma situação parecida que você já viveu em sua trajetória.`
      });
    });

    // 2. 1 pergunta para conhecimento atendido (validação de evidência)
    const present = reqs.filter(r => candSkills.includes(r.toLowerCase()));
    if (present.length > 0) {
      const topSkill = present[0];
      questions.push({
        topic: `Evidência de Domínio Técnico: ${topSkill}`,
        type: "tecnica_atendida",
        question: `Descreva um resultado concreto que você alcançou utilizando ${topSkill}. Como você mensurou esse resultado e qual foi o impacto para a empresa?`
      });
    }

    // 3. Até 2 perguntas para fatores DISC com variação relevante
    if (vacancy.disc_ideal && candidate.disc?.relative) {
      const targetFactors = ['D', 'I', 'S', 'C'];
      targetFactors.forEach(f => {
        const candVal = candidate.disc.relative[f] || 25;
        const idealVal = vacancy.disc_ideal.primary === f ? 40 : (vacancy.disc_ideal.secondary === f ? 30 : 15);
        if (idealVal - candVal >= 8 && questions.length < 5) {
          questions.push({
            topic: `Estilo Comportamental (Fator ${f} - ${DISC_PROFILES_INFO[f]?.name})`,
            type: "comportamental_disc",
            question: DISC_PROFILES_INFO[f]?.interviewQuestion || "Conte como você organiza seu método de trabalho diante de alta pressão."
          });
        }
      });
    }

    // 4. Pergunta padrão de convergência de propósitos (obrigatória)
    questions.push({
      topic: "Convergência de Valores e Expectativas",
      type: "proposito",
      question: "O que você espera encontrar nesta empresa e como esta oportunidade se conecta com seus objetivos de carreira e momento de vida?"
    });

    return {
      guidance: "Diretriz Científica (Sackett et al., 2022): Faça exatamente as mesmas perguntas a todos os candidatos concorrentes a esta vaga e registre uma nota de 1 a 5 para cada resposta com critérios pré-definidos.",
      list: questions
    };
  }
}
