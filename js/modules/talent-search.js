/**
 * MONTE SUA EQUIPE — Motor de Busca em Linguagem Natural & Reconhecimento de Voz
 * Interpretação de texto livre, comandos de voz (Web Speech API) e registro de auditoria
 */

import { SKILLS_DICTIONARY, BEHAVIORAL_TRAITS } from '../data/constants.js';
import { StorageService } from '../data/storage.js';
import { MatchingEngine } from './matching-engine.js';

export class TalentSearchEngine {
  /**
   * Interpreta o texto livre digitado ou falado pelo recrutador
   */
  static parseSearchPrompt(prompt) {
    const raw = String(prompt || "").trim();
    const normalized = raw
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

    // 1. Cargo: o texto depois de quero/preciso/procuro/busco (um/uma) até que/com/em/para/mora
    let jobTitle = "";
    const cargoRegex = /(?:quero|preciso|procuro|busco|contratar|vaga de)\s+(?:de\s+)?(?:um\s+|uma\s+)?([a-z0-9\s/]+?)(?=\s+(?:que|com|em|para|mora|resida|salario|experiencia|$))/i;
    const cargoMatch = normalized.match(cargoRegex);
    if (cargoMatch && cargoMatch[1]) {
      jobTitle = cargoMatch[1].trim();
    }

    // 2. Cidade e UF
    const ufs = [
      "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", 
      "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"
    ];
    let foundUf = "";
    for (const uf of ufs) {
      if (new RegExp(`\\b${uf.toLowerCase()}\\b`).test(normalized)) {
        foundUf = uf;
        break;
      }
    }

    const commonCities = ["sao paulo", "rio de janeiro", "belo horizonte", "curitiba", "porto alegre", "campinas", "salvador", "recife", "fortaleza", "brasilia"];
    let foundCity = "";
    for (const city of commonCities) {
      if (normalized.includes(city)) {
        foundCity = city.charAt(0).toUpperCase() + city.slice(1);
        break;
      }
    }

    // 3. Competências técnicas presentes no pedido
    const foundSkills = [];
    SKILLS_DICTIONARY.forEach(skill => {
      const sNorm = skill.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
      if (normalized.includes(sNorm)) {
        foundSkills.push(skill);
      }
    });

    // 4. Estilos comportamentais presentes no pedido
    const foundTraits = [];
    BEHAVIORAL_TRAITS.forEach(trait => {
      const match = trait.triggers.some(tr => normalized.includes(tr));
      if (match) {
        foundTraits.push(trait.key);
      }
    });

    // 5. Alerta de filtro de idade (Lei 9.029/1995)
    const mentionsAge = /\b\d+\s*anos|idade|jovem aprendiz|mais de 50|senioridade\b/i.test(normalized);

    return {
      rawQuery: raw,
      parsedCriteria: {
        title: jobTitle,
        city: foundCity,
        uf: foundUf,
        requirements: foundSkills,
        traits: foundTraits
      },
      hasAgeMention: mentionsAge,
      ageLegalWarning: mentionsAge 
        ? "Aviso Legal (Lei 9.029/1995): É vedada a adoção de qualquer prática discriminatória por motivo de idade para efeito de admissão. O filtro por faixa etária deve ser utilizado exclusivamente em hipóteses amparadas por lei (ex.: Programa Jovem Aprendiz ou atividades legalmente vedadas a menores de 18 anos)."
        : null
    };
  }

  /**
   * Executa a busca nos candidatos cadastrados aplicando compatibilidade técnica
   */
  static search(prompt, reason, vacancyId = null, recruiterId = null) {
    if (!reason || reason.trim().length < 5) {
      throw new Error("O 'Motivo da busca' é obrigatório (mínimo de 5 caracteres) para registro de auditoria e conformidade LGPD.");
    }

    const parsed = this.parseSearchPrompt(prompt);
    const allCandidates = StorageService.getCandidates().filter(c => c.visible !== false);

    // Avalia a compatibilidade de cada candidato
    const results = allCandidates.map(candidate => {
      const evaluation = MatchingEngine.evaluateCandidateForVacancy(candidate, parsed.parsedCriteria);
      return {
        candidate: candidate,
        technical: evaluation.technical,
        behavioral: evaluation.behavioral,
        interviewQuestions: evaluation.interviewQuestions
      };
    });

    // Ordena decrescente pela nota técnica
    results.sort((a, b) => b.technical.score - a.technical.score);

    // Registra auditoria da busca (search_logs)
    StorageService.logSearch(prompt, reason, results.length, recruiterId, vacancyId);

    return {
      query: prompt,
      reason: reason,
      parsed: parsed,
      results: results,
      totalFound: results.length
    };
  }

  /**
   * Reconhecimento de Voz via Web Speech API nativa do navegador
   */
  static startVoiceRecognition(onResult, onError, onEnd) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      onError("Seu navegador não possui suporte à digitação por voz. Experimente usar o Google Chrome ou Microsoft Edge.");
      return null;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'pt-BR';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        onResult(transcript);
      };

      recognition.onerror = (event) => {
        console.warn("Speech recognition error:", event.error);
        onError(`Falha no microfone: ${event.error}. Você pode digitar o pedido normalmente.`);
      };

      recognition.onend = () => {
        if (onEnd) onEnd();
      };

      recognition.start();
      return recognition;
    } catch (e) {
      onError(`Não foi possível iniciar o microfone: ${e.message}`);
      return null;
    }
  }
}
