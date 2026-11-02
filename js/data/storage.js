/**
 * MONTE SUA EQUIPE — Motor de Persistência Local & Governança de Dados
 * 100% Autônomo, sem dependências externas obrigatórias, com suporte a LGPD
 */

import {
  INITIAL_SEED_CANDIDATES,
  INITIAL_SEED_VACANCIES,
  INITIAL_SEED_EXPERTS
} from './constants.js';

const STORAGE_KEYS = {
  CURRENT_USER: 'mse_current_user',
  SETTINGS: 'mse_app_settings',
  PROFILES: 'mse_profiles',
  CANDIDATES: 'mse_candidates',
  VACANCIES: 'mse_vacancies',
  APPLICATIONS: 'mse_applications',
  INTERVIEWS: 'mse_interviews',
  EXPERTS: 'mse_experts',
  SQUADS: 'mse_squads',
  SEARCH_LOGS: 'mse_search_logs',
  ACTIVITY: 'mse_activity',
  BRANDING: 'mse_branding',
  CLOUD_CONFIG: 'mse_cloud_config'
};

const DEFAULT_SETTINGS = {
  admin_email: 'admin@montesuaequipe.com.br',
  auto_approve_candidates: true,
  auto_approve_recruiters: false,
  recruiters_see_contact: true,
  recruiters_can_export: true,
  candidates_see_vacancies: true,
  experts_visible: true,
  audio_fx_enabled: true
};

export class StorageService {
  static init() {
    if (!this.get(STORAGE_KEYS.SETTINGS)) {
      this.set(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
    }

    if (!this.get(STORAGE_KEYS.CANDIDATES)) {
      this.set(STORAGE_KEYS.CANDIDATES, INITIAL_SEED_CANDIDATES);
    } else {
      // Hidratar avatares em registros existentes
      const currentCands = this.get(STORAGE_KEYS.CANDIDATES);
      let updated = false;
      const enriched = currentCands.map(c => {
        const seed = INITIAL_SEED_CANDIDATES.find(s => s.id === c.id);
        if (seed && seed.avatar && !c.avatar) {
          updated = true;
          return { ...c, avatar: seed.avatar };
        }
        return c;
      });
      if (updated) this.set(STORAGE_KEYS.CANDIDATES, enriched);
    }

    if (!this.get(STORAGE_KEYS.VACANCIES)) {
      this.set(STORAGE_KEYS.VACANCIES, INITIAL_SEED_VACANCIES);
    }

    if (!this.get(STORAGE_KEYS.EXPERTS)) {
      this.set(STORAGE_KEYS.EXPERTS, INITIAL_SEED_EXPERTS);
    } else {
      const currentExperts = this.get(STORAGE_KEYS.EXPERTS);
      let updatedExp = false;
      const enrichedExp = currentExperts.map(e => {
        const seed = INITIAL_SEED_EXPERTS.find(s => s.id === e.id);
        if (seed && seed.avatar && !e.avatar) {
          updatedExp = true;
          return { ...e, avatar: seed.avatar };
        }
        return e;
      });
      if (updatedExp) this.set(STORAGE_KEYS.EXPERTS, enrichedExp);
    }

    if (!this.get(STORAGE_KEYS.SQUADS)) {
      this.set(STORAGE_KEYS.SQUADS, [
        {
          id: 'squad_1',
          name: 'Squad Alfa • Transformação Digital & Eficiência',
          description: 'Time multifuncional focado em automação financeira, compliance trabalhista e excelência comercial.',
          members: [
            { candidate_id: 'cand_1', role: 'Liderança Financeira & FP&A' },
            { candidate_id: 'cand_3', role: 'Governança & Compliance CLT' },
            { candidate_id: 'cand_4', role: 'Expansão Comercial B2B' }
          ],
          synergy_score: 94,
          created_at: new Date().toISOString()
        }
      ]);
    }

    if (!this.get(STORAGE_KEYS.PROFILES)) {
      const defaultProfiles = [
        {
          id: 'admin_user',
          email: 'admin@montesuaequipe.com.br',
          full_name: 'Edvania Freitas (Administradora)',
          role: 'admin',
          status: 'approved',
          company: 'Âmplia Performance / Monte Sua Equipe',
          job_title: 'Gestora Executiva & Fundadora',
          created_at: new Date().toISOString()
        },
        {
          id: 'cand_1',
          email: 'mariana.guimaraes@exemplo.com.br',
          full_name: 'Mariana Alencar Guimarães',
          role: 'candidate',
          status: 'approved',
          created_at: new Date().toISOString()
        },
        {
          id: 'recruiter_1',
          email: 'recrutamento@ampliaperformance.com.br',
          full_name: 'Equipe de Atração de Talentos',
          role: 'recruiter',
          status: 'approved',
          company: 'Grupo Âmplia Performance',
          job_title: 'Business Partner de RH',
          recruiter_type: 'Empresa',
          purpose: 'Atração de talentos para expansão de novos núcleos corporativos',
          created_at: new Date().toISOString()
        }
      ];
      this.set(STORAGE_KEYS.PROFILES, defaultProfiles);
    }

    if (!this.get(STORAGE_KEYS.INTERVIEWS)) {
      this.set(STORAGE_KEYS.INTERVIEWS, [
        {
          id: 'proc_1',
          recruiter_id: 'recruiter_1',
          candidate_id: 'cand_1',
          candidate_name: 'Mariana Alencar Guimarães',
          candidate_email: 'mariana.guimaraes@exemplo.com.br',
          candidate_phone: '(11) 98765-4321',
          vacancy_id: 'vac_1',
          vacancy_title: 'Analista de Controladoria e Finanças',
          company: 'Grupo Âmplia Performance',
          stage: 'gestor', // triagem, rh, teste, gestor, dinamica, final, proposta
          scheduled_at: '2026-03-05T14:30:00',
          duration_min: 45,
          mode: 'Online (Google Meet)',
          location: 'https://meet.google.com/abc-wxyz-def',
          notes: 'Apresentar estudo de caso e alinhamento de rotinas da controladoria.',
          status: 'confirmada', // agendada, confirmada, recusada, remarcar, concluida, cancelada
          candidate_note: 'Confirmado! Estou revisando os balanços recentes da empresa.',
          created_at: new Date().toISOString()
        }
      ]);
    }

    if (!this.get(STORAGE_KEYS.APPLICATIONS)) {
      this.set(STORAGE_KEYS.APPLICATIONS, [
        {
          id: 'app_1',
          candidate_id: 'cand_1',
          vacancy_id: 'vac_1',
          applied_at: new Date().toISOString()
        }
      ]);
    }

    if (!this.get(STORAGE_KEYS.CURRENT_USER)) {
      // Default to recruiter to provide immediate WOW value, but easily switchable
      const profiles = this.get(STORAGE_KEYS.PROFILES, []);
      this.set(STORAGE_KEYS.CURRENT_USER, profiles[2] || profiles[0]);
    }
  }

  static get(key, defaultValue = null) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch (e) {
      console.warn(`Erro ao ler ${key} do localStorage:`, e);
      return defaultValue;
    }
  }

  static set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error(`Erro ao salvar ${key} no localStorage:`, e);
      return false;
    }
  }

  // --- Sessão do Usuário ---
  static getCurrentUser() {
    return this.get(STORAGE_KEYS.CURRENT_USER);
  }

  static setCurrentUser(user) {
    this.set(STORAGE_KEYS.CURRENT_USER, user);
    this.logActivity('sessao', `Usuário ativo alternado para ${user?.full_name || 'Desconectado'} (${user?.role})`);
  }

  static getSettings() {
    return this.get(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
  }

  static updateSettings(newSettings) {
    const current = this.getSettings();
    const updated = { ...current, ...newSettings };
    this.set(STORAGE_KEYS.SETTINGS, updated);
    this.logActivity('salvou', 'Configurações do sistema atualizadas pela administradora');
    return updated;
  }

  // --- Candidatos ---
  static getCandidates() {
    return this.get(STORAGE_KEYS.CANDIDATES, []);
  }

  static getCandidateById(id) {
    return this.getCandidates().find(c => c.id === id);
  }

  static saveCandidate(candidateData) {
    const candidates = this.getCandidates();
    const idx = candidates.findIndex(c => c.id === candidateData.id);
    let updated;
    if (idx >= 0) {
      candidates[idx] = { ...candidates[idx], ...candidateData, updated_at: new Date().toISOString() };
      updated = candidates[idx];
    } else {
      updated = {
        ...candidateData,
        id: candidateData.id || `cand_${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      candidates.push(updated);
    }
    this.set(STORAGE_KEYS.CANDIDATES, candidates);
    this.logActivity('salvou_perfil', `Perfil de ${updated.full_name} atualizado`);
    return updated;
  }

  // --- Vagas ---
  static getVacancies() {
    return this.get(STORAGE_KEYS.VACANCIES, []);
  }

  static getVacancyById(id) {
    return this.getVacancies().find(v => v.id === id);
  }

  static saveVacancy(vacancyData) {
    const vacancies = this.getVacancies();
    const idx = vacancies.findIndex(v => v.id === vacancyData.id);
    let updated;
    if (idx >= 0) {
      vacancies[idx] = { ...vacancies[idx], ...vacancyData, updated_at: new Date().toISOString() };
      updated = vacancies[idx];
    } else {
      updated = {
        ...vacancyData,
        id: vacancyData.id || `vac_${Date.now()}`,
        status: vacancyData.status || 'open',
        created_at: new Date().toISOString()
      };
      vacancies.unshift(updated);
    }
    this.set(STORAGE_KEYS.VACANCIES, vacancies);
    this.logActivity('salvou_vaga', `Vaga "${updated.title}" salva com sucesso`);
    return updated;
  }

  // --- Candidaturas ("Tenho Interesse") ---
  static getApplications() {
    return this.get(STORAGE_KEYS.APPLICATIONS, []);
  }

  static applyToVacancy(candidateId, vacancyId) {
    const apps = this.getApplications();
    const exists = apps.some(a => a.candidate_id === candidateId && a.vacancy_id === vacancyId);
    if (!exists) {
      apps.push({
        id: `app_${Date.now()}`,
        candidate_id: candidateId,
        vacancy_id: vacancyId,
        applied_at: new Date().toISOString()
      });
      this.set(STORAGE_KEYS.APPLICATIONS, apps);
      this.logActivity('interesse', `Candidato demonstrou interesse na vaga ${vacancyId}`);
      return true;
    }
    return false;
  }

  // --- Processos & Entrevistas ---
  static getInterviews() {
    return this.get(STORAGE_KEYS.INTERVIEWS, []);
  }

  static saveInterview(interviewData) {
    const list = this.getInterviews();
    const idx = list.findIndex(i => i.id === interviewData.id);
    let updated;
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...interviewData, updated_at: new Date().toISOString() };
      updated = list[idx];
    } else {
      updated = {
        ...interviewData,
        id: interviewData.id || `proc_${Date.now()}`,
        created_at: new Date().toISOString()
      };
      list.push(updated);
    }
    this.set(STORAGE_KEYS.INTERVIEWS, list);
    this.logActivity('agendou', `Etapa de entrevista "${updated.stage}" atualizada para ${updated.candidate_name}`);
    return updated;
  }

  // --- Especialistas ---
  static getExperts() {
    return this.get(STORAGE_KEYS.EXPERTS, []);
  }

  static saveExpert(expertData) {
    const experts = this.getExperts();
    const newExpert = {
      ...expertData,
      id: expertData.id || `exp_${Date.now()}`,
      visible: true,
      created_at: new Date().toISOString()
    };
    experts.unshift(newExpert);
    this.set(STORAGE_KEYS.EXPERTS, experts);
    this.logActivity('salvou_vitrine', `Especialista ${newExpert.name} cadastrado na vitrine`);
    return newExpert;
  }

  // --- Auditoria: Search Logs & Activity ---
  static logSearch(query, reason, count, recruiterId, vacancyId = null) {
    const logs = this.get(STORAGE_KEYS.SEARCH_LOGS, []);
    const entry = {
      id: `srch_${Date.now()}`,
      at: new Date().toISOString(),
      recruiter_id: recruiterId || 'anonimo',
      query: String(query || '').slice(0, 250),
      reason: String(reason || '').slice(0, 300),
      vacancy_id: vacancyId,
      results_count: count
    };
    logs.unshift(entry);
    this.set(STORAGE_KEYS.SEARCH_LOGS, logs.slice(0, 500));
    this.logActivity('busca', `Busca de talentos realizada: "${query}" (Motivo: "${reason}") - ${count} encontrados`);
  }

  static getSearchLogs() {
    return this.get(STORAGE_KEYS.SEARCH_LOGS, []);
  }

  static logActivity(type, description) {
    const list = this.get(STORAGE_KEYS.ACTIVITY, []);
    const user = this.getCurrentUser();
    const entry = {
      id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      at: new Date().toISOString(),
      type: type, // login, sessao, ver_perfil, busca, salvou_perfil, agendou, etc.
      description: description,
      user_name: user?.full_name || 'Visitante',
      user_role: user?.role || 'guest',
      user_email: user?.email || 'anonimo'
    };
    list.unshift(entry);
    this.set(STORAGE_KEYS.ACTIVITY, list.slice(0, 600));
  }

  static getActivityLogs() {
    return this.get(STORAGE_KEYS.ACTIVITY, []);
  }

  // --- Perfis de Usuários (Aprovação / Bloqueio) ---
  static getProfiles() {
    return this.get(STORAGE_KEYS.PROFILES, []);
  }

  static updateProfileStatus(profileId, newStatus) {
    const profiles = this.getProfiles();
    const p = profiles.find(x => x.id === profileId);
    if (p) {
      p.status = newStatus;
      this.set(STORAGE_KEYS.PROFILES, profiles);
      this.logActivity('salvou', `Status do usuário ${p.full_name} alterado para ${newStatus}`);
      return p;
    }
    return null;
  }

  static updateProfileRole(profileId, newRole) {
    const profiles = this.getProfiles();
    const p = profiles.find(x => x.id === profileId);
    if (p) {
      p.role = newRole;
      this.set(STORAGE_KEYS.PROFILES, profiles);
      this.logActivity('salvou', `Papel do usuário ${p.full_name} alterado para ${newRole}`);
      return p;
    }
    return null;
  }

  // --- Marca & Branding ---
  static getBranding() {
    return this.get(STORAGE_KEYS.BRANDING, {
      logoUrl: null,
      coverUrl: null,
      appTitle: 'Monte Sua Equipe',
      brandSubtitle: 'Gente que conecta • Talentos que transformam'
    });
  }

  static saveBranding(brandingData) {
    const current = this.getBranding();
    const updated = { ...current, ...brandingData };
    this.set(STORAGE_KEYS.BRANDING, updated);
    this.logActivity('salvou', 'Identidade visual e branding atualizados');
    return updated;
  }

  // --- LGPD Art. 18: Exportar e Excluir Dados ---
  static exportMyData(candidateId) {
    const cand = this.getCandidateById(candidateId);
    const apps = this.getApplications().filter(a => a.candidate_id === candidateId);
    const interviews = this.getInterviews().filter(i => i.candidate_id === candidateId);
    return {
      candidato: cand,
      interessesEmVagas: apps,
      processosSeletivos: interviews,
      exportadoEm: new Date().toISOString(),
      leiGeralProtecaoDados: "Atendimento formal ao Art. 18 da LGPD (Lei 13.709/2018)"
    };
  }

  static deleteMyAccount(candidateId) {
    let cands = this.getCandidates().filter(c => c.id !== candidateId);
    this.set(STORAGE_KEYS.CANDIDATES, cands);

    let apps = this.getApplications().filter(a => a.candidate_id !== candidateId);
    this.set(STORAGE_KEYS.APPLICATIONS, apps);

    let interviews = this.getInterviews().filter(i => i.candidate_id !== candidateId);
    this.set(STORAGE_KEYS.INTERVIEWS, interviews);

    this.logActivity('exclusao_lgpd', `Conta do candidato ${candidateId} eliminada em conformidade com o Art. 18 da LGPD`);
    return true;
  }

  // --- MÓDULO SQUADS: "MONTE SUA EQUIPE 360°" ---
  static getSquads() {
    return this.get(STORAGE_KEYS.SQUADS, []);
  }

  static getSquadById(id) {
    const squads = this.getSquads();
    return squads.find(s => s.id === id) || null;
  }

  static saveSquad(squadData) {
    const squads = this.getSquads();
    if (!squadData.id) {
      squadData.id = 'squad_' + Date.now();
      squadData.created_at = new Date().toISOString();
      squads.push(squadData);
      this.logActivity('salvou', `Novo Squad "${squadData.name}" montado com sucesso`);
    } else {
      const idx = squads.findIndex(s => s.id === squadData.id);
      if (idx >= 0) {
        squads[idx] = { ...squads[idx], ...squadData, updated_at: new Date().toISOString() };
        this.logActivity('salvou', `Squad "${squadData.name}" atualizado`);
      } else {
        squads.push(squadData);
      }
    }
    this.set(STORAGE_KEYS.SQUADS, squads);
    return squadData;
  }

  static deleteSquad(id) {
    const squads = this.getSquads().filter(s => s.id !== id);
    this.set(STORAGE_KEYS.SQUADS, squads);
    this.logActivity('excluiu', `Squad ${id} removido`);
    return true;
  }

  // --- BANCO DE DADOS ACOPLADO & SINCRONIZAÇÃO EM NUVEM (100% GRATUITO) ---
  static getCloudConfig() {
    return this.get(STORAGE_KEYS.CLOUD_CONFIG, {
      enabled: false,
      provider: 'supabase',
      supabaseUrl: '',
      supabaseAnonKey: '',
      lastSync: null,
      status: 'offline'
    });
  }

  static saveCloudConfig(config) {
    const current = this.getCloudConfig();
    const updated = { ...current, ...config };
    this.set(STORAGE_KEYS.CLOUD_CONFIG, updated);
    this.logActivity('salvou', 'Configurações de sincronização em nuvem atualizadas');
    return updated;
  }

  static exportFullDatabase() {
    const data = {
      app: 'Monte Sua Equipe',
      version: '2.0.0-quantum',
      author: 'Edvania Freitas (@ampliaperformance)',
      exportedAt: new Date().toISOString(),
      payload: {
        settings: this.get(STORAGE_KEYS.SETTINGS),
        branding: this.get(STORAGE_KEYS.BRANDING),
        profiles: this.get(STORAGE_KEYS.PROFILES),
        candidates: this.get(STORAGE_KEYS.CANDIDATES),
        vacancies: this.get(STORAGE_KEYS.VACANCIES),
        applications: this.get(STORAGE_KEYS.APPLICATIONS),
        interviews: this.get(STORAGE_KEYS.INTERVIEWS),
        experts: this.get(STORAGE_KEYS.EXPERTS),
        squads: this.get(STORAGE_KEYS.SQUADS),
        activity: this.get(STORAGE_KEYS.ACTIVITY),
        search_logs: this.get(STORAGE_KEYS.SEARCH_LOGS)
      }
    };
    return data;
  }

  static importFullDatabase(importedData) {
    if (!importedData || !importedData.payload) {
      throw new Error('Formato de arquivo de backup inválido.');
    }
    const p = importedData.payload;
    if (p.settings) this.set(STORAGE_KEYS.SETTINGS, p.settings);
    if (p.branding) this.set(STORAGE_KEYS.BRANDING, p.branding);
    if (p.profiles) this.set(STORAGE_KEYS.PROFILES, p.profiles);
    if (p.candidates) this.set(STORAGE_KEYS.CANDIDATES, p.candidates);
    if (p.vacancies) this.set(STORAGE_KEYS.VACANCIES, p.vacancies);
    if (p.applications) this.set(STORAGE_KEYS.APPLICATIONS, p.applications);
    if (p.interviews) this.set(STORAGE_KEYS.INTERVIEWS, p.interviews);
    if (p.experts) this.set(STORAGE_KEYS.EXPERTS, p.experts);
    if (p.squads) this.set(STORAGE_KEYS.SQUADS, p.squads);
    if (p.activity) this.set(STORAGE_KEYS.ACTIVITY, p.activity);
    if (p.search_logs) this.set(STORAGE_KEYS.SEARCH_LOGS, p.search_logs);

    this.logActivity('importou', 'Banco de dados restaurado integralmente a partir de arquivo de backup');
    return true;
  }

  static resetDatabase() {
    this.set(STORAGE_KEYS.CANDIDATES, INITIAL_SEED_CANDIDATES);
    this.set(STORAGE_KEYS.VACANCIES, INITIAL_SEED_VACANCIES);
    this.set(STORAGE_KEYS.EXPERTS, INITIAL_SEED_EXPERTS);
    this.set(STORAGE_KEYS.APPLICATIONS, []);
    this.set(STORAGE_KEYS.INTERVIEWS, []);
    this.logActivity('salvou', 'Banco de dados reinicializado para os seeds de fábrica');
    return true;
  }
}
