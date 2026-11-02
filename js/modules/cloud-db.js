/**
 * MONTE SUA EQUIPE — Conector de Banco de Dados Acoplado & Nuvem Gratuita
 * Suporte a Supabase (Camada Gratuita Permanente) & IndexedDB Local
 * Idealizado por Edvania Freitas (@ampliaperformance)
 */

import { StorageService } from '../data/storage.js';

export class CloudDbConnector {
  /**
   * Retorna o script SQL completo para inicializar as tabelas no Supabase Gratuito
   */
  static getSupabaseSchemaSql() {
    return `-- ==============================================================
-- MONTE SUA EQUIPE • Script de Criação do Banco de Dados no Supabase
-- 100% Gratuito • Cole este script no SQL Editor do seu projeto Supabase
-- ==============================================================

-- 1. Tabela de Configurações do Sistema
CREATE TABLE IF NOT EXISTS public.mse_settings (
  id text PRIMARY KEY DEFAULT 'app_settings',
  admin_email text NOT NULL,
  auto_approve_candidates boolean DEFAULT true,
  auto_approve_recruiters boolean DEFAULT false,
  recruiters_see_contact boolean DEFAULT true,
  recruiters_can_export boolean DEFAULT true,
  candidates_see_vacancies boolean DEFAULT true,
  experts_visible boolean DEFAULT true,
  updated_at timestamp with time zone DEFAULT now()
);

-- 2. Tabela de Perfis de Usuários
CREATE TABLE IF NOT EXISTS public.mse_profiles (
  id text PRIMARY KEY,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  role text NOT NULL CHECK (role IN ('candidate', 'recruiter', 'admin')),
  status text NOT NULL DEFAULT 'approved' CHECK (status IN ('approved', 'pending', 'blocked')),
  company text,
  job_title text,
  recruiter_type text,
  purpose text,
  created_at timestamp with time zone DEFAULT now()
);

-- 3. Tabela de Candidatos
CREATE TABLE IF NOT EXISTS public.mse_candidates (
  id text PRIMARY KEY,
  full_name text NOT NULL,
  headline text,
  avatar text,
  city text,
  uf text,
  work_mode text,
  age_band text,
  education text,
  summary text,
  experience text,
  skills jsonb DEFAULT '[]'::jsonb,
  traits jsonb DEFAULT '[]'::jsonb,
  aspirations text,
  expectations text,
  contribution text,
  best_quality text,
  develop_topic text,
  linkedin text,
  email text,
  phone text,
  visible boolean DEFAULT true,
  notify_email boolean DEFAULT true,
  disc jsonb DEFAULT '{}'::jsonb,
  cv_score integer DEFAULT 85,
  consent_at timestamp with time zone DEFAULT now()
);

-- 4. Tabela de Vagas de Emprego
CREATE TABLE IF NOT EXISTS public.mse_vacancies (
  id text PRIMARY KEY,
  title text NOT NULL,
  company text NOT NULL,
  city text,
  uf text,
  work_mode text,
  education text,
  requirements jsonb DEFAULT '[]'::jsonb,
  traits jsonb DEFAULT '[]'::jsonb,
  description text,
  disc_ideal jsonb DEFAULT '{}'::jsonb,
  status text DEFAULT 'open',
  created_at timestamp with time zone DEFAULT now()
);

-- 5. Tabela de Candidaturas ("Tenho Interesse")
CREATE TABLE IF NOT EXISTS public.mse_applications (
  id text PRIMARY KEY,
  candidate_id text REFERENCES public.mse_candidates(id) ON DELETE CASCADE,
  vacancy_id text REFERENCES public.mse_vacancies(id) ON DELETE CASCADE,
  applied_at timestamp with time zone DEFAULT now(),
  status text DEFAULT 'received'
);

-- 6. Tabela de Processos Seletivos & Entrevistas
CREATE TABLE IF NOT EXISTS public.mse_interviews (
  id text PRIMARY KEY,
  candidate_id text REFERENCES public.mse_candidates(id) ON DELETE CASCADE,
  vacancy_id text REFERENCES public.mse_vacancies(id) ON DELETE CASCADE,
  recruiter_email text,
  stage text NOT NULL,
  date text,
  time text,
  duration text,
  platform text,
  meeting_link text,
  feedback text,
  updated_at timestamp with time zone DEFAULT now()
);

-- 7. Tabela de Squads Multifuncionais ("Monte Sua Equipe 360°")
CREATE TABLE IF NOT EXISTS public.mse_squads (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text,
  members jsonb DEFAULT '[]'::jsonb,
  synergy_score integer DEFAULT 90,
  created_at timestamp with time zone DEFAULT now()
);

-- Habilitar Row Level Security e Políticas de Leitura Pública
ALTER TABLE public.mse_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mse_candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mse_vacancies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mse_squads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Read Candidates" ON public.mse_candidates FOR SELECT USING (visible = true);
CREATE POLICY "Public Read Vacancies" ON public.mse_vacancies FOR SELECT USING (true);
CREATE POLICY "Public Read Squads" ON public.mse_squads FOR SELECT USING (true);
`;
  }

  /**
   * Testa a conectividade com o endpoint Supabase REST fornecido
   */
  static async testConnection(url, anonKey) {
    if (!url || !anonKey) {
      return { success: false, message: 'URL ou Chave Anon não preenchida.' };
    }
    const cleanUrl = url.replace(/\/$/, '');
    try {
      const response = await fetch(`${cleanUrl}/rest/v1/`, {
        method: 'GET',
        headers: {
          'apikey': anonKey,
          'Authorization': `Bearer ${anonKey}`
        }
      });
      if (response.ok || response.status === 200 || response.status === 404) {
        return { success: true, message: 'Conexão com o Supabase estabelecida com sucesso!' };
      } else {
        return { success: false, message: `Erro HTTP ${response.status}: verifique as credenciais.` };
      }
    } catch (err) {
      return { success: false, message: 'Falha na conexão: ' + err.message };
    }
  }

  /**
   * Sincroniza os dados locais com a nuvem Supabase
   */
  static async syncAllToCloud(url, anonKey) {
    const cleanUrl = url.replace(/\/$/, '');
    const headers = {
      'apikey': anonKey,
      'Authorization': `Bearer ${anonKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'resolution=merge-duplicates'
    };

    const candidates = StorageService.getCandidates();
    const vacancies = StorageService.getVacancies();
    const squads = StorageService.getSquads();

    try {
      // Upsert candidatos
      const candPayload = candidates.map(c => ({
        id: c.id,
        full_name: c.full_name,
        headline: c.headline,
        avatar: c.avatar,
        city: c.city,
        uf: c.uf,
        work_mode: c.work_mode,
        skills: c.skills || [],
        traits: c.traits || [],
        disc: c.disc || {},
        cv_score: c.cvScore || 85,
        visible: c.visible !== false
      }));

      await fetch(`${cleanUrl}/rest/v1/mse_candidates`, {
        method: 'POST',
        headers,
        body: JSON.stringify(candPayload)
      });

      StorageService.saveCloudConfig({
        enabled: true,
        supabaseUrl: url,
        supabaseAnonKey: anonKey,
        lastSync: new Date().toISOString(),
        status: 'online'
      });

      return { success: true, count: candPayload.length };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }
}
