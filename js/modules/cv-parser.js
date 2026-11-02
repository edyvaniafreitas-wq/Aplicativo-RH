/**
 * MONTE SUA EQUIPE — Motor Inteligente de Leitura, Limpeza e Análise de Currículo
 * 100% no navegador (Client-side), sem envio para terceiros, em conformidade com LGPD
 */

import { SKILLS_DICTIONARY, BEHAVIORAL_TRAITS } from '../data/constants.js';

export class CvParser {
  /**
   * Remove CPF, RG e dados sensíveis desnecessários antes de qualquer persistência
   */
  static cleanSensitiveData(rawText) {
    if (!rawText) return "";
    let cleaned = rawText
      // Remove CPF: 000.000.000-00 ou 00000000000
      .replace(/\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/g, "[DADO REMOVIDO]")
      // Remove menções diretas a CPF/RG
      .replace(/\b(CPF|RG|C\.P\.F\.|R\.G\.)\s*[:.-]?\s*[\w\d.-]+/gi, "[DADO REMOVIDO]")
      // Remove título de eleitor, carteira de trabalho número
      .replace(/\b(título de eleitor|ctps|pis|pasep)\s*[:.-]?\s*[\w\d.-]+/gi, "[DADO REMOVIDO]");
    return cleaned;
  }

  static parseText(rawText) {
    return this.parse(rawText);
  }

  /**
   * Extração estruturada de informações do texto bruto do currículo
   */
  static parse(rawText) {
    const text = this.cleanSensitiveData(rawText);
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

    const email = this.extractEmail(text);
    const phone = this.extractPhone(text);
    const linkedin = this.extractLinkedin(text);
    const name = this.extractName(lines);
    const headline = this.extractHeadline(lines, name);
    const location = this.extractLocation(text);
    const education = this.extractEducation(text);
    const ageBand = this.extractAgeBand(text);
    const sections = this.extractSections(text);
    const skills = this.extractSkills(text);
    const traits = this.extractTraits(text);
    const keywords = this.extractKeywords(text, skills, name);

    return {
      raw_cleaned_text: text.slice(0, 20000),
      full_name: name,
      headline: headline,
      email: email,
      phone: phone,
      linkedin: linkedin,
      city: location.city,
      uf: location.uf,
      education: education,
      age_band: ageBand,
      summary: sections.summary,
      experience: sections.experience,
      skills: skills,
      traits: traits,
      keywords: keywords,
      // Metadados sobre o que foi encontrado automaticamente
      detectedFields: {
        full_name: Boolean(name),
        headline: Boolean(headline),
        email: Boolean(email),
        phone: Boolean(phone),
        linkedin: Boolean(linkedin),
        city: Boolean(location.city),
        uf: Boolean(location.uf),
        education: Boolean(education),
        age_band: Boolean(ageBand),
        summary: Boolean(sections.summary),
        experience: Boolean(sections.experience),
        skillsCount: skills.length,
        traitsCount: traits.length
      }
    };
  }

  static extractEmail(text) {
    const match = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    return match ? match[0].toLowerCase() : "";
  }

  static extractPhone(text) {
    // Procura padrões de telefone brasileiro com DDD
    const match = text.match(/(?:\+?55\s?)?(?:\(?([1-9]{2})\)?\s?)?(?:(9\d{4})[-\s]?(\d{4})|(\d{4})[-\s]?(\d{4}))/);
    if (match) {
      const ddd = match[1] || "";
      const num1 = match[2] || match[4] || "";
      const num2 = match[3] || match[5] || "";
      if (num1 && num2) {
        return ddd ? `(${ddd}) ${num1}-${num2}` : `${num1}-${num2}`;
      }
    }
    return "";
  }

  static extractLinkedin(text) {
    const match = text.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/([a-zA-Z0-9_-]+)/i);
    return match ? `https://www.linkedin.com/in/${match[1]}` : "";
  }

  static extractName(lines) {
    // Busca na primeira linha que tenha de 2 a 6 palavras e não seja cabeçalho genérico
    const ignoreList = ["curriculo", "currículo", "cv", "resume", "dados pessoais", "perfil profissional", "apresentacao"];
    for (const line of lines.slice(0, 10)) {
      const lower = line.toLowerCase();
      if (ignoreList.some(ig => lower.includes(ig))) continue;
      const words = line.split(/\s+/).filter(w => w.length > 1);
      if (words.length >= 2 && words.length <= 6 && !/@|\.com|\.br|\d/.test(line)) {
        return line;
      }
    }
    return "";
  }

  static extractHeadline(lines, name) {
    let foundName = false;
    for (const line of lines.slice(0, 12)) {
      if (!foundName && line === name) {
        foundName = true;
        continue;
      }
      if (foundName) {
        // Se a linha tem tamanho adequado e não é contato
        if (line.length >= 5 && line.length <= 90 && !/@|\.com|\d{4}/.test(line)) {
          return line;
        }
      }
    }
    return "";
  }

  static extractLocation(text) {
    const ufs = [
      "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", 
      "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"
    ];
    // Padrão: "São Paulo - SP" ou "Curitiba/PR" ou "Belo Horizonte, MG"
    const regex = new RegExp(`([A-ZÁÉÍÓÚÂÊÔÃÕÇ][a-záéíóúâêôãõç]+(?:\\s+[A-ZÁÉÍÓÚÂÊÔÃÕÇ][a-záéíóúâêôãõç]+)*)\\s*[-–/,]\\s*(${ufs.join("|")})\\b`, "i");
    const match = text.match(regex);
    if (match) {
      return {
        city: match[1].trim(),
        uf: match[2].toUpperCase().trim()
      };
    }
    // Cidades conhecidas
    const commonCities = [
      { city: "São Paulo", uf: "SP" },
      { city: "Rio de Janeiro", uf: "RJ" },
      { city: "Belo Horizonte", uf: "MG" },
      { city: "Curitiba", uf: "PR" },
      { city: "Porto Alegre", uf: "RS" },
      { city: "Campinas", uf: "SP" },
      { city: "Salvador", uf: "BA" },
      { city: "Recife", uf: "PE" },
      { city: "Fortaleza", uf: "CE" },
      { city: "Brasília", uf: "DF" }
    ];
    for (const item of commonCities) {
      if (new RegExp(`\\b${item.city}\\b`, "i").test(text)) {
        return item;
      }
    }
    return { city: "", uf: "" };
  }

  static extractEducation(text) {
    const t = text.toLowerCase();
    if (/doutorado|ph\.?d/i.test(t)) return "doutorado";
    if (/mestrado|msc/i.test(t)) return "mestrado";
    if (/pós-graduação|pos-graduacao|pós gradu|mba|especialização/i.test(t)) return "pos";
    if (/cursando|graduação em andamento|superior incompleto/i.test(t)) return "cursando";
    if (/superior|bacharelado|licenciatura|graduação|tecnólogo/i.test(t)) return "superior";
    if (/técnico|curso técnico|formação técnica/i.test(t)) return "tecnico";
    if (/ensino médio|segundo grau/i.test(t)) return "medio";
    if (/fundamental/i.test(t)) return "fundamental";
    return "";
  }

  static extractAgeBand(text) {
    const match = text.match(/\b([1-9]\d)\s*anos\b/i);
    if (match) {
      const age = parseInt(match[1], 10);
      if (age >= 14 && age <= 17) return "14-17";
      if (age >= 18 && age <= 24) return "18-24";
      if (age >= 25 && age <= 29) return "25-29";
      if (age >= 30 && age <= 39) return "30-39";
      if (age >= 40 && age <= 49) return "40-49";
      if (age >= 50 && age <= 59) return "50-59";
      if (age >= 60) return "60+";
    }
    return "";
  }

  static extractSections(text) {
    let summary = "";
    let experience = "";

    const summaryMatch = text.match(/(?:resumo|perfil\s+profissional|objetivo|sobre\s+mim)[\s:]*([\s\S]*?)(?=(?:experiência|histórico\s+profissional|formação|educação|habilidades|$))/i);
    if (summaryMatch && summaryMatch[1]) {
      summary = summaryMatch[1].trim().slice(0, 1000);
    }

    const expMatch = text.match(/(?:experiência(?:\s+profissional)?|histórico\s+profissional|atuação)[\s:]*([\s\S]*?)(?=(?:formação|educação|cursos|habilidades|idiomas|$))/i);
    if (expMatch && expMatch[1]) {
      experience = expMatch[1].trim().slice(0, 2500);
    }

    return { summary, experience };
  }

  static extractSkills(text) {
    const found = [];
    const tLower = text.toLowerCase();
    for (const skill of SKILLS_DICTIONARY) {
      const sLower = skill.toLowerCase();
      // Expressão que busca a palavra respeitando limites
      const escaped = sLower.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
      const regex = new RegExp(`(^|[^a-záéíóúâêôãõç0-9])${escaped}([^a-záéíóúâêôãõç0-9]|$)`, 'i');
      if (regex.test(tLower)) {
        found.push(skill);
      }
    }
    return found;
  }

  static extractTraits(text) {
    const found = [];
    // Normaliza texto para busca sem acentos
    const norm = text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    for (const trait of BEHAVIORAL_TRAITS) {
      const match = trait.triggers.some(trigger => {
        return norm.includes(trigger.normalize("NFD").replace(/[\u0300-\u036f]/g, ""));
      });
      if (match) {
        found.push(trait.key);
      }
    }
    return found;
  }

  static extractKeywords(text, skills, name) {
    const stopwords = new Set([
      "de", "a", "o", "que", "e", "do", "da", "em", "um", "para", "com", "nao", "uma", "os", "no", 
      "se", "na", "por", "mais", "as", "dos", "como", "mas", "ao", "ele", "das", "sua", "seu", 
      "suas", "seus", "ano", "anos", "empresa", "trabalho", "experiencia", "profissional", "cargo", 
      "curriculo", "dados", "contato", "atividades", "responsavel", "gerenciamento"
    ]);

    const words = text
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter(w => w.length > 4 && !stopwords.has(w));

    const freq = {};
    for (const w of words) {
      freq[w] = (freq[w] || 0) + 1;
    }

    const sortedWords = Object.keys(freq).sort((a, b) => freq[b] - freq[a]).slice(0, 12);
    // Unir com as habilidades já identificadas
    const allKw = new Set([...skills.map(s => s.toLowerCase()), ...sortedWords]);
    return Array.from(allKw).slice(0, 20);
  }
}
