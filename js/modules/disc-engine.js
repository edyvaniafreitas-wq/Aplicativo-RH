/**
 * MONTE SUA EQUIPE — Motor de Avaliação Comportamental DISC & Base Científica
 * Baseado na metodologia de estilos comportamentais com rigor ético e conformidade legal
 */

import { DISC_STATEMENTS, DISC_PROFILES_INFO } from '../data/constants.js';

export class DiscEngine {
  static getStatements() {
    return DISC_STATEMENTS;
  }

  /**
   * Calcula as pontuações e intensidades relativas dos 4 fatores DISC
   * @param {Object} answers Mapa de id da afirmação (1-24) para valor (1-5)
   */
  static calculate(answers) {
    const rawSums = { D: 0, I: 0, S: 0, C: 0 };
    const answeredCount = Object.keys(answers).length;

    DISC_STATEMENTS.forEach(stmt => {
      const val = parseInt(answers[stmt.id] || 3, 10);
      rawSums[stmt.factor] += val;
    });

    // Pontuação de cada fator: ((soma - 6) / 24) * 100 (escala de 0 a 100)
    const factorScores = {
      D: Math.round(((rawSums.D - 6) / 24) * 100),
      I: Math.round(((rawSums.I - 6) / 24) * 100),
      S: Math.round(((rawSums.S - 6) / 24) * 100),
      C: Math.round(((rawSums.C - 6) / 24) * 100)
    };

    // Intensidade relativa (reduz o viés de aquiescência): (nota + 5) / soma_dos_fatores_ajustados * 100
    const sumAdjusted = (factorScores.D + 5) + (factorScores.I + 5) + (factorScores.S + 5) + (factorScores.C + 5);
    const relative = {
      D: Math.round(((factorScores.D + 5) / sumAdjusted) * 100),
      I: Math.round(((factorScores.I + 5) / sumAdjusted) * 100),
      S: Math.round(((factorScores.S + 5) / sumAdjusted) * 100),
      C: Math.round(((factorScores.C + 5) / sumAdjusted) * 100)
    };

    // Identificação dos fatores predominantes (primário e secundário)
    const sortedFactors = Object.keys(relative).sort((a, b) => relative[b] - relative[a]);
    const primary = sortedFactors[0];
    const secondary = sortedFactors[1];

    return {
      raw: rawSums,
      scores: factorScores,
      relative: relative,
      primary: primary,
      secondary: secondary,
      isComplete: answeredCount >= 24,
      answeredCount: answeredCount,
      primaryInfo: DISC_PROFILES_INFO[primary],
      secondaryInfo: DISC_PROFILES_INFO[secondary]
    };
  }

  /**
   * Calcula a aderência comportamental com relação a uma vaga
   * Aderência = 100 - (soma das diferenças absolutas entre os % relativos do candidato e os da vaga) / 2
   */
  static calculateAdherence(candidateRelative, idealFactors) {
    if (!candidateRelative || !idealFactors) {
      return { adherence: null, trafficLight: "off", label: "Perfil DISC não respondido" };
    }

    // Perfil ideal da vaga: distribui peso maior para o primário e secundário
    const target = { D: 15, I: 15, S: 15, C: 15 };
    if (idealFactors.primary) {
      target[idealFactors.primary] = 40;
    }
    if (idealFactors.secondary) {
      target[idealFactors.secondary] = 30;
    }
    // Ajusta os outros dois
    const remainingKeys = Object.keys(target).filter(k => k !== idealFactors.primary && k !== idealFactors.secondary);
    remainingKeys.forEach(k => { target[k] = 15; });

    let diffSum = 0;
    ['D', 'I', 'S', 'C'].forEach(f => {
      diffSum += Math.abs((candidateRelative[f] || 25) - target[f]);
    });

    const adherence = Math.max(0, Math.min(100, Math.round(100 - (diffSum / 2))));

    let trafficLight = "yellow";
    let label = "Aderência parcial";
    if (adherence >= 75) {
      trafficLight = "green";
      label = "Alta aderência comportamental";
    } else if (adherence < 60) {
      trafficLight = "red";
      label = "Explorar sinergia na entrevista";
    }

    return {
      adherence: adherence,
      trafficLight: trafficLight,
      label: label,
      target: target
    };
  }

  /**
   * Conteúdo canônico do modal de embasamento científico
   */
  static getScientificBackground() {
    return {
      title: "Base Científica, Limites Metodológicos & Ética do DISC",
      sections: [
        {
          heading: "1. Origem e Desenvolvimento Teórico",
          body: "A teoria dos estilos comportamentais foi estruturada pelo psicólogo William Moulton Marston em sua obra 'Emotions of Normal People' (1928), descrevendo respostas adaptativas humanas aos ambientes em termos de Dominância (D), Influência (I), Estabilidade (S) e Conformidade (C). O primeiro questionário prático baseado no modelo foi desenvolvido por Walter Clarke em 1956."
        },
        {
          heading: "2. Validade Científica e Limitações",
          body: "Instrumentos comerciais de DISC possuem boa consistência interna, contudo estudos independentes de psicologia organizacional evidenciam que o DISC descreve tendências e estilos de trabalho, NÃO tendo validade preditiva comprovada para antecipar o desempenho técnico de um profissional no trabalho."
        },
        {
          heading: "3. O Modelo Big Five & Entrevistas Estruturadas",
          body: "A meta-análise seminal de Sackett, Zhang, Berry e Lievens (2022, Journal of Applied Psychology) demonstra que o método de maior validade média comprovada para contratação é a Entrevista Estruturada (validade 0,42), superando testes de conhecimentos (0,40) e inventários isolados. Entre os traços de personalidade, o modelo Big Five (especialmente o fator Conscienciosidade - Barrick & Mount, 1991) possui maior respaldo preditivo."
        },
        {
          heading: "4. Enquadramento Legal e Diretrizes Éticas (LGPD & CFP)",
          body: "Este questionário tem finalidade exclusiva de autoconhecimento e facilitação do diálogo entre profissional e empresa. Ele NÃO é e JAMAIS deve ser tratado como teste psicológico. Conforme a Lei Federal nº 4.119/1962 e a Resolução CFP nº 31/2022, a aplicação e interpretação de testes psicológicos são atos privativos de psicólogos inscritos no Conselho. Não existe perfil 'certo' ou 'errado': todo estilo agrega valor singular dependendo do contexto da equipe."
        }
      ]
    };
  }
}
