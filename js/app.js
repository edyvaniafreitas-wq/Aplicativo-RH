/**
 * MONTE SUA EQUIPE — Controlador Principal da Aplicação
 * Roteamento reativo, renderização de visões por papel e gestão de estado
 * Idealizado por Edvania Freitas (@ampliaperformance)
 */

import { StorageService } from './data/storage.js';
import { SKILLS_DICTIONARY, BEHAVIORAL_TRAITS, DISC_STATEMENTS, DISC_PROFILES_INFO, FREE_COURSES_PROVIDERS } from './data/constants.js';
import { CvParser } from './modules/cv-parser.js';
import { CvAnalyzer } from './modules/cv-analyzer.js';
import { DiscEngine } from './modules/disc-engine.js';
import { MatchingEngine } from './modules/matching-engine.js';
import { TalentSearchEngine } from './modules/talent-search.js';
import { ProcessService, PIPELINE_STAGES } from './modules/processes.js';
import { AdminService } from './modules/admin.js';
import { QuantumSquadEngine } from './modules/quantum-squad.js';
import { InteractiveFx } from './modules/interactive-fx.js';
import { CloudDbConnector } from './modules/cloud-db.js';

class AppController {
  constructor() {
    this.currentRole = 'recruiter'; // candidate, recruiter, admin
    this.currentTab = 'rec_visao';
    this.currentUser = null;
    this.init();
  }

  init() {
    StorageService.init();
    this.currentUser = StorageService.getCurrentUser();
    this.currentRole = this.currentUser?.role || 'recruiter';

    this.bindHeaderEvents();
    this.applyTheme();
    this.switchRole(this.currentRole);
    this.checkPendingApprovals();
  }

  /**
   * Componente Canônico Reutilizável de Semáforo:
   * 3 lâmpadas lado a lado (vermelho, amarelo, verde) com apenas a lâmpada correta acesa.
   */
  renderTrafficLight(state, label) {
    // state: 'green' | 'yellow' | 'red' | 'off'
    return `
      <div class="traffic-light-badge light-${state}">
        <span class="light-dots-cluster">
          <span class="light-dot dot-red"></span>
          <span class="light-dot dot-yellow"></span>
          <span class="light-dot dot-green"></span>
        </span>
        <span>${label}</span>
      </div>
    `;
  }

  bindHeaderEvents() {
    // Alternador de Papel
    document.querySelectorAll('.role-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const role = btn.dataset.role;
        this.switchRole(role);
      });
    });

    // Logo inicial
    document.getElementById('btnGoHome').addEventListener('click', () => {
      this.switchTab(this.getDefaultTabForRole(this.currentRole));
    });

    // Tema Escuro / Claro
    document.getElementById('btnToggleTheme').addEventListener('click', () => {
      const current = document.body.getAttribute('data-theme') || 'light';
      const next = current === 'light' ? 'dark' : 'light';
      document.body.setAttribute('data-theme', next);
      localStorage.setItem('mse_theme', next);
      this.showToast(`Modo ${next === 'dark' ? 'Escuro' : 'Claro'} ativado.`);
    });

    // Termos e Privacidade
    document.getElementById('btnOpenPrivacyTerms').addEventListener('click', () => {
      this.openPrivacyModal();
    });

    // Efeitos Sonoros Futuristas
    const btnSound = document.getElementById('btnToggleSound');
    if (btnSound) {
      btnSound.addEventListener('click', () => {
        InteractiveFx.soundEnabled = !InteractiveFx.soundEnabled;
        btnSound.innerHTML = `<i data-lucide="${InteractiveFx.soundEnabled ? 'volume-2' : 'volume-x'}"></i>`;
        this.renderIcons();
        if (InteractiveFx.soundEnabled) {
          InteractiveFx.playChime();
          this.showToast('Efeitos sonoros futuristas ativados.', 'success');
        } else {
          this.showToast('Efeitos sonoros silenciados.', 'info');
        }
      });
    }

    // Modal Banco de Dados Acoplado & Nuvem
    const btnCloud = document.getElementById('btnOpenCloudDb');
    if (btnCloud) {
      btnCloud.addEventListener('click', () => {
        this.openCloudDbModal();
      });
    }

    this.bindCloudDbModalEvents();

    // Form Agendar Entrevista
    document.getElementById('formScheduleStage').addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleScheduleSubmit();
    });

    // Form Nova Vaga
    document.getElementById('formNewVacancy').addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleNewVacancySubmit();
    });

    // Form Novo Especialista
    document.getElementById('formNewExpert').addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleNewExpertSubmit();
    });
  }

  openCloudDbModal() {
    const modal = document.getElementById('modalCloudDb');
    if (!modal) return;
    const config = StorageService.getCloudConfig();
    const urlInput = document.getElementById('cloudSupabaseUrl');
    const keyInput = document.getElementById('cloudSupabaseKey');
    if (urlInput) urlInput.value = config.supabaseUrl || '';
    if (keyInput) keyInput.value = config.supabaseAnonKey || '';
    modal.classList.add('show');
    this.renderIcons();
  }

  bindCloudDbModalEvents() {
    // Exportar Backup JSON
    const btnExport = document.getElementById('btnExportFullDb');
    if (btnExport) {
      btnExport.addEventListener('click', () => {
        InteractiveFx.playClick();
        const data = StorageService.exportFullDatabase();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `backup-monte-sua-equipe-${Date.now()}.json`;
        a.click();
        this.showToast('Backup completo exportado com sucesso!', 'success');
      });
    }

    // Restaurar Backup JSON
    const btnTriggerImport = document.getElementById('btnTriggerImportDb');
    const fileImport = document.getElementById('fileInputImportDb');
    if (btnTriggerImport && fileImport) {
      btnTriggerImport.addEventListener('click', () => fileImport.click());
      fileImport.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (evt) => {
          try {
            const parsed = JSON.parse(evt.target.result);
            StorageService.importFullDatabase(parsed);
            InteractiveFx.playChime();
            this.showToast('Banco de dados restaurado com sucesso!', 'success');
            document.getElementById('modalCloudDb').classList.remove('show');
            this.switchTab(this.currentTab);
          } catch (err) {
            this.showToast('Erro ao importar backup: ' + err.message, 'error');
          }
        };
        reader.readAsText(file);
      });
    }

    // Restaurar Dados Originais de Demonstração
    const btnReset = document.getElementById('btnResetToFactory');
    if (btnReset) {
      btnReset.addEventListener('click', () => {
        if (confirm('Deseja restaurar os dados de fábrica do aplicativo? Isso redefinirá candidatos, vagas e especialistas.')) {
          StorageService.resetDatabase();
          InteractiveFx.playChime();
          this.showToast('Dados restaurados para o padrão de fábrica.', 'success');
          document.getElementById('modalCloudDb').classList.remove('show');
          this.switchTab(this.currentTab);
        }
      });
    }

    // Testar Conexão Supabase
    const btnTest = document.getElementById('btnTestCloudConn');
    if (btnTest) {
      btnTest.addEventListener('click', async () => {
        InteractiveFx.playClick();
        const url = document.getElementById('cloudSupabaseUrl').value.trim();
        const key = document.getElementById('cloudSupabaseKey').value.trim();
        const feedback = document.getElementById('cloudConnStatusFeedback');
        feedback.style.display = 'block';
        feedback.innerHTML = '<span style="color: #2563eb;">Testando conectividade com Supabase...</span>';

        const result = await CloudDbConnector.testConnection(url, key);
        if (result.success) {
          StorageService.saveCloudConfig({ supabaseUrl: url, supabaseAnonKey: key, enabled: true });
          feedback.innerHTML = `<span style="color: #166534; font-weight: 700;">✓ ${result.message}</span>`;
          InteractiveFx.playChime();
          this.showToast('Supabase conectado com sucesso!', 'success');
        } else {
          feedback.innerHTML = `<span style="color: #b91c1c; font-weight: 700;">⚠ ${result.message}</span>`;
        }
      });
    }

    // Sincronizar Tudo para o Supabase
    const btnSync = document.getElementById('btnSyncCloudNow');
    if (btnSync) {
      btnSync.addEventListener('click', async () => {
        InteractiveFx.playScan();
        const url = document.getElementById('cloudSupabaseUrl').value.trim();
        const key = document.getElementById('cloudSupabaseKey').value.trim();
        if (!url || !key) {
          this.showToast('Informe a URL e Chave Anon do seu projeto Supabase primeiro.', 'error');
          return;
        }
        this.showToast('Sincronizando dados com o Supabase...', 'info');
        const res = await CloudDbConnector.syncAllToCloud(url, key);
        if (res.success) {
          InteractiveFx.playChime();
          this.showToast(`Sincronização concluída! ${res.count} registros enviados à nuvem.`, 'success');
        } else {
          this.showToast('Erro na sincronização: ' + res.error, 'error');
        }
      });
    }

    // Copiar Script SQL do Banco
    const btnCopySql = document.getElementById('btnCopySqlSchema');
    if (btnCopySql) {
      btnCopySql.addEventListener('click', () => {
        InteractiveFx.playClick();
        const sql = CloudDbConnector.getSupabaseSchemaSql();
        navigator.clipboard.writeText(sql).then(() => {
          this.showToast('Script SQL copiado para a área de transferência! Cole no SQL Editor do Supabase.', 'success');
        }).catch(() => {
          this.showToast('Falha ao copiar SQL. Permita o acesso à área de transferência.', 'error');
        });
      });
    }
  }

  applyTheme() {
    const saved = localStorage.getItem('mse_theme') || 'light';
    document.body.setAttribute('data-theme', saved);
  }

  getDefaultTabForRole(role) {
    if (role === 'candidate') return 'jornada';
    if (role === 'admin') return 'adm_inicio';
    return 'rec_visao';
  }

  switchRole(role) {
    this.currentRole = role;
    
    document.querySelectorAll('.role-tab-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.role === role);
    });

    const profiles = StorageService.getProfiles();
    const userForRole = profiles.find(p => p.role === role) || profiles[0];
    StorageService.setCurrentUser(userForRole);
    this.currentUser = userForRole;

    this.renderSubNavTabs();
    this.switchTab(this.getDefaultTabForRole(role));
  }

  renderSubNavTabs() {
    const container = document.getElementById('navTabsContainer');
    let tabs = [];

    if (this.currentRole === 'candidate') {
      tabs = [
        { id: 'jornada', label: 'Minha Jornada', icon: 'compass' },
        { id: 'curriculo', label: 'Meu Currículo', icon: 'file-text' },
        { id: 'disc', label: 'Perfil DISC', icon: 'smile' },
        { id: 'analise', label: 'Análise do Currículo', icon: 'award' },
        { id: 'vagas', label: 'Vagas para Mim', icon: 'briefcase' },
        { id: 'convites', label: 'Convites & Entrevistas', icon: 'calendar' },
        { id: 'vitrine', label: 'Vitrine de Especialistas', icon: 'sparkles' },
        { id: 'privacidade', label: 'Privacidade & Dados', icon: 'lock' }
      ];
    } else if (this.currentRole === 'recruiter') {
      tabs = [
        { id: 'rec_visao', label: 'Visão Geral & Constelação', icon: 'sparkles' },
        { id: 'rec_squad', label: 'Monte Seu Squad 360°', icon: 'users' },
        { id: 'rec_busca', label: 'Buscar Talentos (Voz & IA)', icon: 'search' },
        { id: 'rec_vagas', label: 'Minhas Vagas', icon: 'briefcase' },
        { id: 'rec_processos', label: 'Processos Seletivos (Kanban)', icon: 'columns-3' },
        { id: 'vitrine', label: 'Vitrine de Especialistas', icon: 'award' },
        { id: 'rec_cloud', label: 'Banco & Nuvem Grátis', icon: 'database' }
      ];
    } else if (this.currentRole === 'admin') {
      tabs = [
        { id: 'adm_inicio', label: 'Início & Cuidados', icon: 'heart-handshake' },
        { id: 'adm_painel', label: 'Painel Executivo', icon: 'bar-chart-3' },
        { id: 'adm_cloud', label: 'Banco de Dados & Nuvem', icon: 'database' },
        { id: 'adm_usuarios', label: 'Usuários & Aprovações', icon: 'users' },
        { id: 'adm_atividade', label: 'Trilha de Atividades', icon: 'activity' },
        { id: 'adm_buscas', label: 'Auditoria de Buscas', icon: 'search' },
        { id: 'adm_config', label: 'Configurações & Marca', icon: 'settings' }
      ];
    }

    container.innerHTML = tabs.map(t => `
      <button class="sub-nav-item ${this.currentTab === t.id ? 'active' : ''}" data-tab="${t.id}">
        <i data-lucide="${t.icon}"></i>
        <span>${t.label}</span>
      </button>
    `).join('');

    container.querySelectorAll('.sub-nav-item').forEach(btn => {
      btn.addEventListener('click', () => {
        InteractiveFx.playClick();
        this.switchTab(btn.dataset.tab);
      });
    });

    this.renderIcons();
  }

  switchTab(tabId) {
    this.currentTab = tabId;

    document.querySelectorAll('.sub-nav-item').forEach(b => {
      b.classList.toggle('active', b.dataset.tab === tabId);
    });

    const viewContainer = document.getElementById('viewContainer');
    viewContainer.innerHTML = '';

    switch (tabId) {
      // Visões do Candidato
      case 'jornada': this.renderCandidateJornada(viewContainer); break;
      case 'curriculo': this.renderCandidateCurriculo(viewContainer); break;
      case 'disc': this.renderCandidateDisc(viewContainer); break;
      case 'analise': this.renderCandidateAnalise(viewContainer); break;
      case 'vagas': this.renderCandidateVagas(viewContainer); break;
      case 'convites': this.renderCandidateConvites(viewContainer); break;
      case 'privacidade': this.renderCandidatePrivacidade(viewContainer); break;
      
      // Visões do Recrutador / Empresa
      case 'rec_visao': this.renderRecruiterOverview(viewContainer); break;
      case 'rec_squad': this.renderSquadSimulator(viewContainer); break;
      case 'rec_busca': this.renderRecruiterSearch(viewContainer); break;
      case 'rec_vagas': this.renderRecruiterVacancies(viewContainer); break;
      case 'rec_processos': this.renderRecruiterProcesses(viewContainer); break;
      case 'rec_cloud': this.renderCloudDbView(viewContainer); break;
      case 'rec_empresa': this.renderRecruiterCompany(viewContainer); break;

      // Visões da Administradora
      case 'adm_inicio': this.renderAdminInicio(viewContainer); break;
      case 'adm_painel': this.renderAdminPainel(viewContainer); break;
      case 'adm_cloud': this.renderCloudDbView(viewContainer); break;
      case 'adm_usuarios': this.renderAdminUsuarios(viewContainer); break;
      case 'adm_atividade': this.renderAdminAtividade(viewContainer); break;
      case 'adm_buscas': this.renderAdminBuscas(viewContainer); break;
      case 'adm_config': this.renderAdminConfig(viewContainer); break;

      // Visão compartilhada
      case 'vitrine': this.renderVitrine(viewContainer); break;

      default: this.renderRecruiterOverview(viewContainer); break;
    }

    this.renderIcons();
    InteractiveFx.applyTiltCards(viewContainer);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  renderIcons() {
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  showToast(message, type = 'info') {
    const hub = document.getElementById('toastHub');
    const toast = document.createElement('div');
    toast.className = 'toast-msg';
    
    let icon = 'info';
    if (type === 'success') icon = 'check-circle-2';
    if (type === 'error') icon = 'alert-triangle';

    toast.innerHTML = `<i data-lucide="${icon}" style="color: var(--blue-royal);"></i><span>${message}</span>`;
    hub.appendChild(toast);
    this.renderIcons();

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  checkPendingApprovals() {
    const metrics = AdminService.getMetrics();
    const alertBox = document.getElementById('pendingApprovalAlert');
    const alertText = document.getElementById('pendingApprovalText');

    if (metrics.pendingCount > 0) {
      alertBox.style.display = 'inline-flex';
      alertText.textContent = `${metrics.pendingCount} empresa(s) com cadastro pendente de aprovação pela administradora.`;
    } else {
      alertBox.style.display = 'none';
    }
  }

  // ==============================================
  // VISÕES: PROFISSIONAL
  // ==============================================

  renderCandidateJornada(container) {
    const candidate = StorageService.getCandidateById('cand_1') || StorageService.getCandidates()[0] || {};
    const cvScore = candidate?.cvScore || 92;
    const avatarUrl = candidate.avatar || 'assets/avatar-mariana.jpg';

    container.innerHTML = `
      <section class="future-hero-section">
        <div class="future-hero-content">
          <div class="future-hero-badge">
            <i data-lucide="sparkles"></i> Minha Jornada Profissional • Monte Sua Equipe
          </div>
          <h2 class="future-hero-title">
            Bem-vinda, <span>${(candidate.full_name || 'Mariana').split(' ')[0]}</span>!
          </h2>
          <p class="future-hero-subtitle">
            Seu perfil está 100% ativo e visível para empresas éticas e auditadas.
            Explore oportunidades, fortaleça suas competências e acompanhe convites de entrevista em tempo real.
          </p>

          <div style="display: flex; gap: 12px; flex-wrap: wrap;">
            <button class="btn-primary" onclick="window.appController.switchTab('curriculo')">
              <i data-lucide="file-up"></i> Atualizar Meu Currículo
            </button>
            <button class="btn-secondary" onclick="window.appController.switchTab('disc')">
              <i data-lucide="smile"></i> Ver Perfil DISC
            </button>
            <button class="btn-secondary" onclick="window.appController.switchTab('vagas')">
              <i data-lucide="briefcase"></i> Vagas para Mim
            </button>
          </div>

          <div class="future-hero-metrics">
            <div class="future-hero-metric-item">
              <span class="future-hero-metric-val">${cvScore}/100</span>
              <span class="future-hero-metric-lbl">Qualidade do CV</span>
            </div>
            <div class="future-hero-metric-item">
              <span class="future-hero-metric-val">${candidate.disc?.primary || 'C'}/${candidate.disc?.secondary || 'S'}</span>
              <span class="future-hero-metric-lbl">Estilo DISC</span>
            </div>
            <div class="future-hero-metric-item">
              <span class="future-hero-metric-val">100%</span>
              <span class="future-hero-metric-lbl">LGPD Protegida</span>
            </div>
            <div class="future-hero-metric-item">
              <span class="future-hero-metric-val">3</span>
              <span class="future-hero-metric-lbl">Vagas no Radar</span>
            </div>
          </div>
        </div>

        <div class="future-hero-image-wrap" style="display: flex; align-items: center; justify-content: center; padding: 24px;">
          <div style="position: relative; text-align: center;">
            <img src="${avatarUrl}" alt="${candidate.full_name}" style="width: 180px; height: 180px; border-radius: 32px; object-fit: cover; border: 4px solid #ffffff; box-shadow: 0 16px 40px rgba(37, 99, 235, 0.2);">
            <div style="margin-top: 14px;">
              <span class="cloud-status-badge online" style="font-size: 0.82rem;">
                <span style="width: 8px; height: 8px; border-radius: 50%; background: #10b981;"></span>
                Perfil Ativo na Comunidade
              </span>
            </div>
          </div>
        </div>
      </section>
              <span class="mono-value" style="color: var(--blue-royal); font-weight: 700;">${candidate.disc ? candidate.disc.relative[candidate.disc.primary] + '%' : '0%'}</span>
            </div>
            <div style="display: flex; gap: 8px; margin-top: 14px;">
              <div style="flex: 1; text-align: center; background: #fff0f3; padding: 8px; border-radius: 8px; color: #e11d48; font-weight: 700;">D: ${candidate.disc?.relative?.D || 25}%</div>
              <div style="flex: 1; text-align: center; background: #fef3c7; padding: 8px; border-radius: 8px; color: #d97706; font-weight: 700;">I: ${candidate.disc?.relative?.I || 25}%</div>
              <div style="flex: 1; text-align: center; background: #ecfdf5; padding: 8px; border-radius: 8px; color: #059669; font-weight: 700;">S: ${candidate.disc?.relative?.S || 25}%</div>
              <div style="flex: 1; text-align: center; background: #eff6ff; padding: 8px; border-radius: 8px; color: #2563eb; font-weight: 700;">C: ${candidate.disc?.relative?.C || 25}%</div>
            </div>
          </div>
        </div>
      </div>

      <h2 style="font-size: 1.4rem; margin-bottom: 16px;">Um passo de cada vez na sua trajetória</h2>
      <div class="grid-steps-cards">
        
        <div class="card-step border-blue" onclick="window.appController.switchTab('curriculo')">
          <div>
            ${this.renderTrafficLight('green', '85% Concluído')}
            <h3 style="margin-top: 10px;">1. Conte sua história</h3>
            <p>Seus dados profissionais, competências e experiências formatados de forma clara e atrativa.</p>
          </div>
          <span style="color: var(--blue-royal); font-size: 0.85rem; font-weight: 700;">Revisar perfil &rarr;</span>
        </div>

        <div class="card-step border-coral" onclick="window.appController.switchTab('analise')">
          <div>
            ${this.renderTrafficLight(cvScore >= 80 ? 'green' : 'yellow', `Nota ${cvScore}/100`)}
            <h3 style="margin-top: 10px;">2. Valorize sua trajetória</h3>
            <p>Diagnóstico gratuito de qualidade do seu currículo com dicas para se destacar nas buscas.</p>
          </div>
          <span style="color: var(--coral-accent); font-size: 0.85rem; font-weight: 700;">Ver análise detalhada &rarr;</span>
        </div>

        <div class="card-step border-lilac" onclick="window.appController.switchTab('disc')">
          <div>
            ${this.renderTrafficLight('green', 'DISC Respondido')}
            <h3 style="margin-top: 10px;">3. Descubra seu estilo</h3>
            <p>Questionário científico de 24 afirmações para autoconhecimento e alinhamento com equipes.</p>
          </div>
          <span style="color: var(--lilac-accent); font-size: 0.85rem; font-weight: 700;">Ver meu perfil DISC &rarr;</span>
        </div>

        <div class="card-step border-gold" onclick="window.appController.switchTab('vagas')">
          <div>
            ${this.renderTrafficLight('green', '3 Vagas Compatíveis')}
            <h3 style="margin-top: 10px;">4. Explore possibilidades</h3>
            <p>Oportunidades internas ordenadas por compatibilidade técnica e links para vagas abertas na web.</p>
          </div>
          <span style="color: var(--gold-accent); font-size: 0.85rem; font-weight: 700;">Ver vagas para mim &rarr;</span>
        </div>

        <div class="card-step border-blue" onclick="window.appController.switchTab('convites')">
          <div>
            ${this.renderTrafficLight('yellow', '1 Convite Ativo')}
            <h3 style="margin-top: 10px;">5. Prepare o próximo passo</h3>
            <p>Confirme convites de entrevistas, solicite remarcações e sincronize com sua agenda.</p>
          </div>
          <span style="color: var(--blue-royal); font-size: 0.85rem; font-weight: 700;">Acessar convites &rarr;</span>
        </div>

      </div>
    `;
  }

  renderCandidateCurriculo(container) {
    const candidate = StorageService.getCandidateById('cand_1') || StorageService.getCandidates()[0] || {};
    const skillsList = candidate.skills || [];

    container.innerHTML = `
      <div style="background: var(--surface); border: 1px solid var(--border-line); border-radius: var(--radius-banner); padding: 32px; box-shadow: var(--shadow-card); margin-bottom: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px;">
          <div>
            ${this.renderTrafficLight('green', 'Etapa 1 de 2 • Importação ou Preenchimento')}
            <h2 style="font-size: 1.8rem; margin-top: 10px;">Sua história tem valor</h2>
            <p>Importe seu arquivo (PDF, DOCX ou TXT de até 8MB) ou cole o texto do seu currículo. O texto é lido diretamente no navegador, números de CPF e RG são expurgados e nenhum dado é enviado para terceiros.</p>
          </div>
        </div>

        <!-- Área de Upload e Leitura -->
        <div style="border: 2px dashed var(--border-line); border-radius: var(--radius-card); padding: 36px 20px; text-align: center; background: var(--surface-2); margin-bottom: 18px;">
          <i data-lucide="upload-cloud" style="width: 48px; height: 48px; color: var(--blue-royal); margin-bottom: 12px;"></i>
          <h3 style="font-size: 1.15rem; margin-bottom: 6px;">Arraste seu currículo ou clique para selecionar</h3>
          <p style="font-size: 0.88rem; margin-bottom: 16px;">Formatos: PDF, DOCX, TXT (até 8 MB). O arquivo original NÃO é guardado, apenas o texto essencial.</p>
          
          <input type="file" id="cvFileInput" accept=".pdf,.docx,.txt" style="display: none;">
          <button class="btn-primary" onclick="document.getElementById('cvFileInput').click()"><i data-lucide="file-text"></i> Escolher Arquivo do Computador</button>
        </div>

        <div style="text-align: center; margin-bottom: 20px;">
          <a style="font-size: 0.88rem; color: var(--blue-royal); cursor: pointer; text-decoration: underline;" onclick="window.appController.startProfileFromScratch()">Ou clique aqui para montar seu perfil do zero (primeiro emprego / Jovem Aprendiz)</a>
        </div>

        <!-- Opção Alternativa: Colar Texto -->
        <div class="form-group">
          <label class="form-label">Ou cole o texto do seu currículo ou perfil do LinkedIn:</label>
          <textarea id="cvPasteText" class="form-control" rows="5" placeholder="Cole aqui o texto completo do seu currículo..."></textarea>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px; flex-wrap: wrap; gap: 10px;">
            <a style="font-size: 0.88rem; color: var(--blue-royal); cursor: pointer;" onclick="window.appController.loadSampleCvText()">Carregar exemplo pronto para teste</a>
            <button class="btn-primary" id="btnProcessCv"><i data-lucide="sparkles"></i> Processar & Analisar Texto</button>
          </div>
        </div>
      </div>

      <!-- Etapa 2: Resultado da Leitura -->
      <div id="cvStage2Section" style="background: var(--surface); border: 1px solid var(--border-line); border-radius: var(--radius-banner); padding: 32px; box-shadow: var(--shadow-card);">
        <h2 style="font-size: 1.5rem; margin-bottom: 8px;">Encontramos no seu currículo</h2>
        <p style="margin-bottom: 20px;">Confira as informações extraídas automaticamente. Você pode corrigir ou complementar qualquer dado.</p>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; margin-bottom: 24px;">
          <div style="background: var(--surface-2); padding: 16px; border-radius: 12px; border: 1px solid var(--border-line);">
            <div style="font-size: 0.78rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">Nome Completo</div>
            <div style="font-size: 1.1rem; font-weight: 700; margin-top: 4px;">${candidate.full_name || 'Não informado'}</div>
          </div>
          <div style="background: var(--surface-2); padding: 16px; border-radius: 12px; border: 1px solid var(--border-line);">
            <div style="font-size: 0.78rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">Título Profissional</div>
            <div style="font-size: 1rem; font-weight: 600; margin-top: 4px;">${candidate.headline || 'Não informado'}</div>
          </div>
          <div style="background: var(--surface-2); padding: 16px; border-radius: 12px; border: 1px solid var(--border-line);">
            <div style="font-size: 0.78rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">Localização & Contato</div>
            <div style="font-size: 0.95rem; margin-top: 4px;">${candidate.city || 'Cidade'} - ${candidate.uf || 'UF'} • ${candidate.phone || 'Sem telefone'}</div>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Competências Técnicas Identificadas (${skillsList.length})</label>
          <div style="display: flex; flex-wrap: wrap; gap: 8px;">
            ${skillsList.map(s => `<span style="background: var(--blue-soft); color: var(--blue-royal); border: 1px solid var(--border-line); border-radius: var(--radius-pill); padding: 5px 12px; font-size: 0.85rem; font-weight: 600;">${s}</span>`).join('')}
          </div>
        </div>

        <div class="form-group" style="margin-top: 20px;">
          <label class="form-label">Resumo Profissional</label>
          <p style="font-size: 0.95rem; color: var(--text-main); background: var(--surface-2); padding: 16px; border-radius: 12px; line-height: 1.6;">${candidate.summary || 'Resumo pendente de preenchimento.'}</p>
        </div>

        <div style="text-align: right; margin-top: 24px;">
          <button class="btn-primary" onclick="window.appController.switchTab('analise')"><i data-lucide="award"></i> Ver Diagnóstico de Qualidade do Currículo</button>
        </div>
      </div>
    `;

    document.getElementById('cvFileInput').addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const text = event.target.result;
          this.handleCvParse(text);
        };
        reader.readAsText(file);
      }
    });

    document.getElementById('btnProcessCv').addEventListener('click', () => {
      const text = document.getElementById('cvPasteText').value;
      if (!text.trim()) {
        this.showToast("Por favor, cole o texto do currículo antes de processar.", "error");
        return;
      }
      this.handleCvParse(text);
    });
  }

  startProfileFromScratch() {
    const name = prompt("Informe seu nome completo:");
    if (!name) return;
    const headline = prompt("Informe seu objetivo ou área de interesse (ex: Jovem Aprendiz Administrativo):") || "Início de Carreira";

    const candidate = StorageService.getCandidateById('cand_1') || {};
    StorageService.saveCandidate({
      ...candidate,
      full_name: name,
      headline: headline,
      skills: ["Comunicação", "Trabalho em equipe", "Vontade de aprender", "Pacote Office"],
      summary: "Profissional em busca de primeira oportunidade ou transição de carreira, com alta dedicação e facilidade de aprendizado."
    });

    this.showToast("Perfil básico inicializado! Continue preenchendo.", "success");
    this.renderCandidateCurriculo(document.getElementById('viewContainer'));
    this.renderIcons();
  }

  loadSampleCvText() {
    const sample = `Mariana Alencar Guimarães
Analista Financeiro Pleno • FP&A, DRE e Fluxo de Caixa
São Paulo - SP | mariana.guimaraes@exemplo.com.br | (11) 98765-4321 | linkedin.com/in/mariana-alencar-exemplo
Graduação em Ciências Contábeis com pós-graduação em Finanças Corporativas. 32 anos.

RESUMO PROFISSIONAL
Profissional de Finanças com 6 anos de experiência em controladoria, conciliação e elaboração de DRE gerencial. Reduzi custos operacionais em 14% na última holding através de automação de planilhas e renegociação de prazos bancários.

EXPERIÊNCIA
Analista Financeiro Sênior na Aliança Logística (2022-2026).
- Gestão e fechamento do fluxo de caixa diário de R$ 4,5 milhões.
- Conciliação bancária de mais de 12 contas correntes simultâneas e conciliação de cartões.
- Elaboração mensal de relatórios gerenciais, orçamentos anuais e DRE por centro de custos.
- Implantação de rotinas no ERP TOTVS Protheus e relatórios dinâmicos em Power BI.

HABILIDADES
Excel avançado, Power BI, Fluxo de caixa, Conciliação bancária, Contas a pagar, Contas a receber, Protheus, DRE, Controladoria, Orçamento.`;

    document.getElementById('cvPasteText').value = sample;
    this.showToast("Texto de exemplo carregado. Clique em 'Processar & Analisar'.");
  }

  handleCvParse(rawText) {
    const parsed = CvParser.parse(rawText);
    const candidate = StorageService.getCandidateById('cand_1') || {};
    StorageService.saveCandidate({
      ...candidate,
      ...parsed,
      id: candidate.id || 'cand_1'
    });

    this.showToast("Currículo processado e dados atualizados com sucesso!", "success");
    this.renderCandidateCurriculo(document.getElementById('viewContainer'));
    this.renderIcons();
  }

  renderCandidateDisc(container) {
    const candidate = StorageService.getCandidateById('cand_1') || StorageService.getCandidates()[0] || {};
    const statements = DiscEngine.getStatements();

    container.innerHTML = `
      <div style="background: var(--surface); border: 1px solid var(--border-line); border-radius: var(--radius-banner); padding: 32px; box-shadow: var(--shadow-card); margin-bottom: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 12px;">
          <div>
            <span class="traffic-light-badge light-lilac" style="background: var(--lilac-soft); color: var(--lilac-accent); margin-bottom: 8px;">
              <i data-lucide="brain"></i> Avaliação Comportamental Científica
            </span>
            <h2 style="font-size: 1.8rem;">Descubra seu Estilo de Trabalho (DISC)</h2>
            <p>Responda pensando em como você age na maior parte do tempo. Não existem respostas certas ou erradas.</p>
          </div>
          <button class="btn-secondary" onclick="window.appController.openDiscScienceModal()"><i data-lucide="info"></i> Ver Base Científica & Ética</button>
        </div>

        <div style="background: var(--surface-2); border-left: 4px solid var(--blue-royal); padding: 14px 18px; border-radius: 0 10px 10px 0; margin-bottom: 24px; font-size: 0.92rem; color: var(--text-muted);">
          <strong>Aviso Ético e Legal:</strong> Este questionário apoia o autoconhecimento e o diálogo com as empresas. Ele NÃO é teste psicológico (Lei 4.119/1962 e Res. CFP 31/2022) e não decide nenhuma contratação isoladamente.
        </div>

        <!-- Formulário das 24 Afirmações -->
        <form id="formDiscQuiz">
          <div style="display: flex; flex-direction: column; gap: 16px;">
            ${statements.map(stmt => `
              <div id="card_stmt_${stmt.id}" style="background: var(--surface-2); border: 1px solid var(--border-line); border-radius: 14px; padding: 18px; transition: var(--transition-smooth);">
                <div style="font-size: 1rem; font-weight: 600; margin-bottom: 12px; color: var(--text-main);">
                  <span style="color: var(--blue-royal); font-family: var(--font-mono); font-weight: 700; margin-right: 6px;">#${stmt.id}</span>
                  ${stmt.text}
                </div>
                <div style="display: flex; justify-content: space-between; gap: 8px; flex-wrap: wrap;">
                  ${[
                    { val: 1, label: 'Discordo totalmente' },
                    { val: 2, label: 'Discordo' },
                    { val: 3, label: 'Neutro' },
                    { val: 4, label: 'Concordo' },
                    { val: 5, label: 'Concordo totalmente' }
                  ].map(opt => `
                    <label style="flex: 1; min-width: 120px; text-align: center; background: var(--surface); border: 1px solid var(--border-line); border-radius: 8px; padding: 10px 6px; cursor: pointer; font-size: 0.85rem; transition: var(--transition-smooth);">
                      <input type="radio" name="disc_q_${stmt.id}" value="${opt.val}" ${opt.val === 4 ? 'checked' : ''} style="margin-right: 4px;">
                      ${opt.label}
                    </label>
                  `).join('')}
                </div>
              </div>
            `).join('')}
          </div>

          <div style="margin-top: 24px; text-align: center;">
            <button type="submit" class="btn-primary" style="padding: 14px 36px; font-size: 1.05rem;"><i data-lucide="check"></i> Calcular e Salvar Perfil Comportamental</button>
          </div>
        </form>
      </div>
    `;

    document.getElementById('formDiscQuiz').addEventListener('submit', (e) => {
      e.preventDefault();
      const answers = {};
      let firstPendingStmt = null;

      statements.forEach(stmt => {
        const checked = document.querySelector(`input[name="disc_q_${stmt.id}"]:checked`);
        if (checked) {
          answers[stmt.id] = parseInt(checked.value, 10);
        } else if (!firstPendingStmt) {
          firstPendingStmt = stmt.id;
        }
      });

      if (firstPendingStmt) {
        const el = document.getElementById(`card_stmt_${firstPendingStmt}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.style.borderColor = 'var(--coral-accent)';
          this.showToast(`Por favor, responda à afirmação #${firstPendingStmt} para prosseguir.`, 'error');
        }
        return;
      }

      const discResult = DiscEngine.calculate(answers);
      StorageService.saveCandidate({
        ...candidate,
        disc: discResult
      });

      this.showToast("Perfil comportamental DISC calculado com sucesso!", "success");
      this.switchTab('jornada');
    });
  }

  renderCandidateAnalise(container) {
    const candidate = StorageService.getCandidateById('cand_1') || StorageService.getCandidates()[0] || {};
    const analysis = CvAnalyzer.analyze(candidate);

    container.innerHTML = `
      <div style="background: var(--surface); border: 1px solid var(--border-line); border-radius: var(--radius-banner); padding: 32px; box-shadow: var(--shadow-card); margin-bottom: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 16px;">
          <div>
            ${this.renderTrafficLight(analysis.trafficLight, analysis.statusLabel)}
            <h2 style="font-size: 2rem; margin-top: 10px;">Diagnóstico de Força do Currículo</h2>
            <p>${analysis.messageTone}</p>
          </div>

          <!-- Anel de Pontuação -->
          <div style="display: flex; align-items: center; justify-content: center; width: 110px; height: 110px; border-radius: 50%; border: 8px solid ${analysis.trafficLight === 'green' ? '#0ca30c' : '#fab219'}; font-family: var(--font-mono); font-size: 2rem; font-weight: 800; color: var(--text-main); background: var(--surface-2);">
            ${analysis.score}
          </div>
        </div>

        <!-- Lista de Verificação de Qualidade -->
        <h3 style="font-size: 1.25rem; margin-bottom: 16px;">Itens Avaliados & Orientações Práticas</h3>
        <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 32px;">
          ${analysis.items.map(item => `
            <div style="display: flex; align-items: flex-start; gap: 12px; background: var(--surface-2); border: 1px solid var(--border-line); border-radius: 12px; padding: 14px 18px;">
              <span style="width: 10px; height: 10px; border-radius: 50%; background: ${item.status === 'green' ? '#0ca30c' : (item.status === 'yellow' ? '#fab219' : '#d03b3b')}; margin-top: 6px; flex-shrink: 0;"></span>
              <div>
                <div style="font-weight: 700; font-size: 0.95rem; color: var(--text-main);">${item.text}</div>
                <div style="font-size: 0.88rem; color: var(--text-muted); margin-top: 2px;">${item.tip}</div>
              </div>
            </div>
          `).join('')}
        </div>

        <!-- Cursos Gratuitos Recomendados -->
        <div style="background: linear-gradient(135deg, #FFF0F3, #F2EDFF); border: 1px solid var(--border-line); border-radius: var(--radius-card); padding: 24px;">
          <h3 style="font-size: 1.2rem; margin-bottom: 6px; color: var(--coral-accent);"><i data-lucide="graduation-cap"></i> Espaço para Evoluir: Cursos Gratuitos</h3>
          <p style="margin-bottom: 16px;">Com base nas suas aspirações em <strong>"${analysis.topicToLearn}"</strong>, selecionamos plataformas públicas e gratuitas com cursos e certificações:</p>
          
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px;">
            ${analysis.courseRecommendations.map(c => `
              <a href="${c.url}" target="_blank" rel="noopener noreferrer" class="btn-secondary" style="background: #fff; font-size: 0.85rem; text-align: left; justify-content: space-between;">
                <span>${c.provider}</span>
                <i data-lucide="external-link" style="width: 16px; height: 16px;"></i>
              </a>
            `).join('')}
          </div>
        </div>

      </div>
    `;
  }

  renderCandidateVagas(container) {
    const candidate = StorageService.getCandidateById('cand_1') || StorageService.getCandidates()[0] || {};
    const vacancies = StorageService.getVacancies().filter(v => v.status === 'open');
    const applications = StorageService.getApplications();
    const candidateHeadline = (candidate.headline || 'Profissional').split('•')[0].trim();
    const candidateCity = candidate.city || 'São Paulo';

    container.innerHTML = `
      <div style="margin-bottom: 24px;">
        <h2 style="font-size: 1.8rem; margin-bottom: 6px;">Oportunidades Conectadas ao Seu Perfil</h2>
        <p>Vagas internas cadastradas por empresas aprovadas, ordenadas pela compatibilidade com a sua história.</p>
      </div>

      <div style="display: flex; flex-direction: column; gap: 18px;">
        ${vacancies.map(v => {
          const evalResult = MatchingEngine.evaluateCandidateForVacancy(candidate, v);
          const hasApplied = applications.some(a => a.candidate_id === candidate.id && a.vacancy_id === v.id);

          return `
            <div style="background: var(--surface); border: 1px solid var(--border-line); border-radius: var(--radius-card); padding: 24px; box-shadow: var(--shadow-card);">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px; margin-bottom: 12px;">
                <div>
                  <h3 style="font-size: 1.3rem; margin-bottom: 4px;">${v.title}</h3>
                  <div style="font-size: 0.92rem; color: var(--text-muted);">${v.company} • 📍 ${v.city} - ${v.uf} (${v.work_mode})</div>
                </div>

                <!-- Semáforos Duplos Separados Rigorosamente -->
                <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                  ${this.renderTrafficLight(evalResult.technical.trafficLight, `Técnica: ${evalResult.technical.score}%`)}
                  ${this.renderTrafficLight(evalResult.behavioral.trafficLight, `DISC: ${evalResult.behavioral.adherence ? evalResult.behavioral.adherence + '%' : 'Sem dados'}`)}
                </div>
              </div>

              <p style="font-size: 0.95rem; color: var(--text-muted); margin-bottom: 16px;">${v.description}</p>

              <div style="margin-bottom: 16px;">
                <strong style="font-size: 0.85rem; color: var(--text-main);">Requisitos:</strong>
                <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px;">
                  ${(v.requirements || []).map(r => `<span style="background: var(--surface-2); border: 1px solid var(--border-line); padding: 4px 10px; border-radius: var(--radius-pill); font-size: 0.82rem;">${r}</span>`).join('')}
                </div>
              </div>

              <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-line); padding-top: 16px; flex-wrap: wrap; gap: 12px;">
                <div style="font-size: 0.85rem; color: var(--text-muted);">
                  ${evalResult.technical.details[0]?.info || 'Critérios analisados'}
                </div>
                <div>
                  ${hasApplied 
                    ? this.renderTrafficLight('green', 'Interesse Registrado')
                    : `<button class="btn-primary" onclick="window.appController.handleApply('${candidate.id}', '${v.id}')"><i data-lucide="heart"></i> Tenho Interesse nesta Vaga</button>`
                  }
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <!-- Links Prontos para Buscas Externas na Web -->
      <div style="margin-top: 36px; background: var(--surface-2); border: 1px solid var(--border-line); border-radius: var(--radius-card); padding: 24px;">
        <h3 style="font-size: 1.15rem; margin-bottom: 6px;"><i data-lucide="globe"></i> Buscar Vagas Similares na Internet</h3>
        <p style="font-size: 0.88rem; margin-bottom: 16px;">Links diretos de pesquisa com o cargo "${candidateHeadline}" em ${candidateCity}:</p>

        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
          <a href="https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(candidateHeadline)}&location=${encodeURIComponent(candidateCity)}" target="_blank" rel="noopener noreferrer" class="btn-secondary">LinkedIn Vagas</a>
          <a href="https://www.indeed.com.br/jobs?q=${encodeURIComponent(candidateHeadline)}&l=${encodeURIComponent(candidateCity)}" target="_blank" rel="noopener noreferrer" class="btn-secondary">Indeed</a>
          <a href="https://gupy.io" target="_blank" rel="noopener noreferrer" class="btn-secondary">Gupy</a>
          <a href="https://www.vagas.com.br/vagas-de-${encodeURIComponent(candidateHeadline)}" target="_blank" rel="noopener noreferrer" class="btn-secondary">Vagas.com</a>
        </div>
      </div>
    `;
  }

  handleApply(candidateId, vacancyId) {
    const success = StorageService.applyToVacancy(candidateId, vacancyId);
    if (success) {
      this.showToast("Interesse enviado para a equipe de recrutamento!", "success");
      this.renderCandidateVagas(document.getElementById('viewContainer'));
      this.renderIcons();
    }
  }

  renderCandidateConvites(container) {
    const candidate = StorageService.getCandidateById('cand_1') || StorageService.getCandidates()[0] || {};
    const interviews = ProcessService.getInterviews().filter(i => i.candidate_id === candidate.id);

    container.innerHTML = `
      <div style="margin-bottom: 24px;">
        <h2 style="font-size: 1.8rem; margin-bottom: 6px;">Seus Convites & Entrevistas</h2>
        <p>Acompanhe suas etapas, confirme presenças ou solicite ajustes de horário diretamente com os recrutadores.</p>
      </div>

      ${interviews.length === 0 ? `
        <div style="background: var(--surface); border: 1px solid var(--border-line); border-radius: var(--radius-card); padding: 40px; text-align: center;">
          <i data-lucide="calendar" style="width: 48px; height: 48px; color: var(--text-muted); margin-bottom: 12px;"></i>
          <h3>Nenhum convite pendente no momento</h3>
          <p>Quando uma empresa agendar uma conversa com você, ela aparecerá aqui com todos os detalhes e links.</p>
        </div>
      ` : `
        <div style="display: flex; flex-direction: column; gap: 16px;">
          ${interviews.map(inv => {
            const dateStr = inv.scheduled_at ? new Date(inv.scheduled_at).toLocaleString('pt-BR') : 'A definir';
            const gCalUrl = ProcessService.generateGoogleCalendarUrl(inv);

            return `
              <div style="background: var(--surface); border: 1px solid var(--border-line); border-radius: var(--radius-card); padding: 24px; box-shadow: var(--shadow-card);">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; flex-wrap: wrap; gap: 10px;">
                  <div>
                    <h3 style="font-size: 1.25rem;">${inv.vacancy_title} — ${inv.company}</h3>
                    <div style="font-size: 0.9rem; color: var(--blue-royal); font-weight: 700; margin-top: 2px;">Etapa: ${PIPELINE_STAGES.find(s => s.id === inv.stage)?.name || inv.stage}</div>
                  </div>
                  ${this.renderTrafficLight(inv.status === 'confirmada' ? 'green' : (inv.status === 'recusada' ? 'red' : 'yellow'), `Status: ${inv.status.toUpperCase()}`)}
                </div>

                <div style="background: var(--surface-2); padding: 14px 18px; border-radius: 10px; margin-bottom: 16px; font-size: 0.92rem; color: var(--text-main);">
                  <div>📅 <strong>Data e Horário:</strong> ${dateStr} (${inv.duration_min || 45} min)</div>
                  <div style="margin-top: 4px;">📍 <strong>Formato / Local:</strong> ${inv.mode} — ${inv.location}</div>
                  ${inv.notes ? `<div style="margin-top: 6px; color: var(--text-muted);">💬 <strong>Pauta:</strong> ${inv.notes}</div>` : ''}
                </div>

                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                  <div style="display: flex; gap: 8px;">
                    <a href="${gCalUrl}" target="_blank" rel="noopener noreferrer" class="btn-secondary" style="font-size: 0.85rem;"><i data-lucide="calendar"></i> Salvar no Google Agenda</a>
                    <button class="btn-secondary" style="font-size: 0.85rem;" onclick="window.appController.downloadIcs('${inv.id}')"><i data-lucide="download"></i> Baixar .ICS</button>
                  </div>
                  <div style="display: flex; gap: 8px;">
                    <button class="btn-secondary" style="color: var(--signal-red); border-color: var(--signal-red);" onclick="window.appController.respondInvite('${inv.id}', 'recusada')">Declinar</button>
                    <button class="btn-secondary" style="color: var(--signal-yellow); border-color: var(--signal-yellow);" onclick="window.appController.promptReschedule('${inv.id}')">Pedir Remarcação</button>
                    <button class="btn-primary" onclick="window.appController.respondInvite('${inv.id}', 'confirmada')"><i data-lucide="check"></i> Confirmar Presença</button>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `}
    `;
  }

  downloadIcs(interviewId) {
    const inv = ProcessService.getInterviews().find(i => i.id === interviewId);
    if (inv) ProcessService.downloadIcsFile(inv);
  }

  respondInvite(interviewId, status, note = "") {
    ProcessService.updateStatus(interviewId, status, note);
    this.showToast(`Convite atualizado para: ${status}!`, "success");
    this.renderCandidateConvites(document.getElementById('viewContainer'));
    this.renderIcons();
  }

  promptReschedule(interviewId) {
    const reason = prompt("Informe o motivo ou sua disponibilidade de novos horários:");
    if (reason) {
      this.respondInvite(interviewId, 'remarcar', reason);
    }
  }

  renderCandidatePrivacidade(container) {
    const candidate = StorageService.getCandidateById('cand_1') || StorageService.getCandidates()[0] || {};

    container.innerHTML = `
      <div style="background: var(--surface); border: 1px solid var(--border-line); border-radius: var(--radius-banner); padding: 32px; box-shadow: var(--shadow-card); max-width: 800px; margin: 0 auto;">
        <h2 style="font-size: 1.8rem; margin-bottom: 8px;">Privacidade, Visibilidade & Seus Direitos (LGPD)</h2>
        <p style="margin-bottom: 24px;">Você tem controle total sobre quem acessa seus dados e como sua história é apresentada às empresas parceiras.</p>

        <div style="background: var(--surface-2); border-radius: 14px; padding: 20px; margin-bottom: 24px; border: 1px solid var(--border-line);">
          <h3 style="font-size: 1.1rem; margin-bottom: 10px;">Quem visualiza seus dados atualmente?</h3>
          <p style="font-size: 0.92rem; color: var(--text-muted); line-height: 1.6;">
            Apenas empresas e consultorias de Recursos Humanos com cadastro formal previamente aprovado pela administradora. Cada busca que localiza seu perfil registra obrigatoriamente a justificativa corporativa em relatório inalterável de auditoria.
          </p>
        </div>

        <div style="display: flex; flex-direction: column; gap: 14px; margin-bottom: 32px;">
          <div style="display: flex; justify-content: space-between; align-items: center; background: var(--surface-2); padding: 16px; border-radius: 12px;">
            <div>
              <div style="font-weight: 700;">Visibilidade Pública do Perfil</div>
              <div style="font-size: 0.85rem; color: var(--text-muted);">Permite que recrutadores encontrem você nas buscas por competências.</div>
            </div>
            <input type="checkbox" id="chkProfileVisible" ${candidate.visible !== false ? 'checked' : ''} style="width: 20px; height: 20px;">
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; background: var(--surface-2); padding: 16px; border-radius: 12px;">
            <div>
              <div style="font-weight: 700;">Alertas de Novas Oportunidades</div>
              <div style="font-size: 0.85rem; color: var(--text-muted);">Receber notificações quando uma vaga compatível for publicada.</div>
            </div>
            <input type="checkbox" id="chkProfileNotify" ${candidate.notify_email ? 'checked' : ''} style="width: 20px; height: 20px;">
          </div>
        </div>

        <div style="border-top: 1px solid var(--border-line); padding-top: 24px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
          <button class="btn-secondary" onclick="window.appController.handleExportMyData('${candidate.id}')"><i data-lucide="download"></i> Exportar Meus Dados (JSON - Art. 18)</button>
          <button class="btn-secondary" style="color: var(--signal-red); border-color: var(--signal-red);" onclick="window.appController.handleDeleteAccount('${candidate.id}')"><i data-lucide="trash-2"></i> Excluir Minha Conta em Definitivo</button>
        </div>
      </div>
    `;

    document.getElementById('chkProfileVisible').addEventListener('change', (e) => {
      StorageService.saveCandidate({ ...candidate, visible: e.target.checked });
      this.showToast(`Visibilidade do perfil alterada para: ${e.target.checked ? 'Visível' : 'Oculto'}.`);
    });

    document.getElementById('chkProfileNotify').addEventListener('change', (e) => {
      StorageService.saveCandidate({ ...candidate, notify_email: e.target.checked });
      this.showToast(`Alertas de vagas: ${e.target.checked ? 'Ativados' : 'Desativados'}.`);
    });
  }

  handleExportMyData(candidateId) {
    const data = StorageService.exportMyData(candidateId);
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `meus-dados-monte-sua-equipe-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    this.showToast("Cópia dos seus dados exportada com sucesso (Art. 18 LGPD).", "success");
  }

  handleDeleteAccount(candidateId) {
    if (confirm("ATENÇÃO: Deseja realmente excluir sua conta e todos os seus registros em definitivo? Esta ação é irreversível.")) {
      StorageService.deleteMyAccount(candidateId);
      this.showToast("Sua conta e dados foram excluídos com sucesso.", "info");
      this.switchRole('recruiter');
    }
  }

  // ==============================================
  // VISÕES: EMPRESA / RECRUTADOR
  // ==============================================

  renderRecruiterOverview(container) {
    const candidates = StorageService.getCandidates();
    const vacancies = StorageService.getVacancies();
    const interviews = ProcessService.getInterviews();
    const squads = StorageService.getSquads();

    container.innerHTML = `
      <!-- BANNER HERO LUMINOSO FUTURISTA -->
      <section class="future-hero-section">
        <div class="future-hero-content">
          <div class="future-hero-badge">
            <i data-lucide="sparkles"></i> Monte Sua Equipe • Por Edvania Freitas (@ampliaperformance)
          </div>
          <h2 class="future-hero-title">
            Grandes Equipes Nascem de <span>Conexões Quânticas</span>
          </h2>
          <p class="future-hero-subtitle">
            Plataforma aberta, sofisticada e gratuita para conexão entre profissionais e empresas.
            Unimos inteligência de dados, análise de currículo em tempo real e avaliação comportamental DISC sem custos de APIs.
          </p>

          <div style="display: flex; gap: 12px; flex-wrap: wrap;">
            <button class="btn-primary" onclick="window.appController.switchTab('rec_squad')">
              <i data-lucide="users"></i> Montar Squad 360°
            </button>
            <button class="btn-secondary" onclick="window.appController.switchTab('rec_busca')">
              <i data-lucide="search"></i> Buscar por Voz / IA
            </button>
            <button class="btn-secondary" onclick="window.appController.openCloudDbModal()">
              <i data-lucide="database"></i> Banco de Dados Acoplado
            </button>
          </div>

          <div class="future-hero-metrics">
            <div class="future-hero-metric-item">
              <span class="future-hero-metric-val">${candidates.length}</span>
              <span class="future-hero-metric-lbl">Profissionais Ativos</span>
            </div>
            <div class="future-hero-metric-item">
              <span class="future-hero-metric-val">${vacancies.length}</span>
              <span class="future-hero-metric-lbl">Vagas Publicadas</span>
            </div>
            <div class="future-hero-metric-item">
              <span class="future-hero-metric-val">${squads.length}</span>
              <span class="future-hero-metric-lbl">Squads Montados</span>
            </div>
            <div class="future-hero-metric-item">
              <span class="future-hero-metric-val">100%</span>
              <span class="future-hero-metric-lbl">Gratuito & LGPD</span>
            </div>
          </div>
        </div>

        <div class="future-hero-image-wrap">
          <img src="assets/hero-future.jpg" class="future-hero-image" alt="Monte Sua Equipe • Plataforma Executiva de Talentos">
          <div class="future-hero-image-overlay"></div>
        </div>
      </section>

      <!-- CONSTELAÇÃO NEURAL INTERATIVA DE TALENTOS -->
      <div class="future-glass-card" style="padding: 24px; margin-bottom: 28px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; flex-wrap: wrap; gap: 10px;">
          <div>
            <h3 style="font-size: 1.25rem; display: flex; align-items: center; gap: 8px;">
              <i data-lucide="activity" style="color: var(--blue-royal);"></i> Constelação Neural de Talentos & Vagas
            </h3>
            <p style="font-size: 0.85rem; color: var(--text-muted); margin: 0;">
              Visualização quântica de nós ativos. Clique em qualquer talento para abrir o dossiê executivo.
            </p>
          </div>
          <span class="cloud-status-badge online">
            <span style="width: 8px; height: 8px; border-radius: 50%; background: #10b981;"></span>
            Telemetria em Tempo Real
          </span>
        </div>

        <canvas id="recruiterConstellationCanvas" style="width: 100%; border-radius: 14px; cursor: pointer; display: block; border: 1px solid #e2e8f0;"></canvas>
      </div>

      <!-- KPIs RÁPIDOS DA EMPRESA -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 28px;">
        <div class="kpi-metric-card">
          <div class="kpi-title">Vagas Abertas</div>
          <div class="kpi-number">${vacancies.length}</div>
          <div class="kpi-delta">Processos ativos</div>
        </div>
        <div class="kpi-metric-card">
          <div class="kpi-title">Profissionais no Radar</div>
          <div class="kpi-number">${candidates.length}</div>
          <div class="kpi-delta">Perfis com DISC completo</div>
        </div>
        <div class="kpi-metric-card">
          <div class="kpi-title">Etapas Agendadas</div>
          <div class="kpi-number">${interviews.length}</div>
          <div class="kpi-delta">Fluxo no Kanban</div>
        </div>
        <div class="kpi-metric-card">
          <div class="kpi-title">Taxa de Presença</div>
          <div class="kpi-number">100%</div>
          <div class="kpi-delta">Google Agenda & .ICS</div>
        </div>
      </div>

      <!-- TALENTOS EM DESTAQUE COM FOTOS E BADGES DISC -->
      <div style="margin-bottom: 28px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 10px;">
          <div>
            <h3 style="font-size: 1.35rem; margin-bottom: 2px;">Talentos Disponíveis na Comunidade</h3>
            <p style="font-size: 0.88rem; color: var(--text-muted); margin: 0;">Profissionais com histórico verificado, pontuação técnica e perfil comportamental mapeado.</p>
          </div>
          <button class="btn-secondary" onclick="window.appController.switchTab('rec_busca')">
            Buscar Todos os Talentos &rarr;
          </button>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 18px;">
          ${candidates.map(c => {
            const avatarUrl = c.avatar || 'assets/avatar-mariana.jpg';
            const primaryDisc = (c.disc && c.disc.primary) || 'C';
            const secondaryDisc = (c.disc && c.disc.secondary) || 'S';
            const cvScore = c.cvScore || 90;

            return `
              <div class="future-glass-card" style="padding: 22px;">
                <div style="display: flex; gap: 16px; align-items: flex-start; margin-bottom: 14px;">
                  <div class="candidate-avatar-wrap">
                    <img src="${avatarUrl}" class="candidate-avatar-img" alt="${c.full_name}">
                    <span class="candidate-status-dot" title="Disponível para novas oportunidades"></span>
                  </div>
                  <div style="flex: 1; min-width: 0;">
                    <h4 style="font-size: 1.15rem; margin-bottom: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${c.full_name}</h4>
                    <div style="font-size: 0.85rem; color: #2563eb; font-weight: 600; margin-bottom: 4px;">${c.headline || 'Profissional'}</div>
                    <div style="font-size: 0.78rem; color: var(--text-muted);">📍 ${c.city} - ${c.uf} • ${c.work_mode || 'Híbrido'}</div>
                  </div>
                </div>

                <div style="display: flex; justify-content: space-between; align-items: center; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 10px 14px; margin-bottom: 14px;">
                  <div>
                    <span style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted); font-weight: 700;">Score CV</span>
                    <div style="font-size: 1.1rem; font-weight: 800; color: #1e40af;">${cvScore}/100</div>
                  </div>
                  <div>
                    <span style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted); font-weight: 700;">Perfil DISC</span>
                    <div style="font-size: 0.92rem; font-weight: 800; color: #0f172a;">${primaryDisc}/${secondaryDisc}</div>
                  </div>
                  <div>
                    ${this.renderTrafficLight('green', 'VERIFICADO')}
                  </div>
                </div>

                <div style="margin-bottom: 16px;">
                  <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                    ${(c.skills || []).slice(0, 4).map(s => `<span style="background: #eff6ff; color: #1e40af; border: 1px solid #bfdbfe; padding: 3px 8px; border-radius: 9999px; font-size: 0.75rem; font-weight: 600;">${s}</span>`).join('')}
                    ${(c.skills || []).length > 4 ? `<span style="font-size: 0.75rem; color: #64748b; padding-top: 2px;">+${(c.skills.length - 4)}</span>` : ''}
                  </div>
                </div>

                <div style="display: flex; gap: 8px; justify-content: flex-end; border-top: 1px solid #e2e8f0; padding-top: 14px;">
                  <button class="btn-secondary" style="font-size: 0.82rem; padding: 6px 12px;" onclick="window.appController.openDossierModal('${c.id}')">
                    <i data-lucide="file-text"></i> Dossiê
                  </button>
                  <button class="btn-primary" style="font-size: 0.82rem; padding: 6px 12px;" onclick="window.appController.openScheduleModal('${c.id}', '${c.full_name}')">
                    <i data-lucide="calendar"></i> Entrevista
                  </button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- PRÓXIMAS ETAPAS DO PROCESSO SELETIVO -->
      <div class="future-glass-card" style="padding: 28px; margin-bottom: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <h3 style="font-size: 1.25rem;">Próximas Entrevistas & Processos Ativos</h3>
          <button class="btn-secondary" onclick="window.appController.switchTab('rec_processos')">Ver Kanban Completo &rarr;</button>
        </div>

        <div style="display: flex; flex-direction: column; gap: 12px;">
          ${interviews.map(i => `
            <div style="display: flex; justify-content: space-between; align-items: center; background: #f8fafc; border: 1px solid #e2e8f0; padding: 14px 18px; border-radius: 14px; flex-wrap: wrap; gap: 12px;">
              <div>
                <strong style="font-size: 1rem; color: var(--text-main);">${i.candidate_name}</strong>
                <div style="font-size: 0.85rem; color: var(--text-muted);">${i.vacancy_title} • Etapa: ${PIPELINE_STAGES.find(s => s.id === i.stage)?.name || i.stage}</div>
              </div>
              <div style="display: flex; align-items: center; gap: 12px;">
                ${this.renderTrafficLight(i.status === 'confirmada' ? 'green' : 'yellow', i.status.toUpperCase())}
                <button class="btn-secondary" style="font-size: 0.82rem;" onclick="window.appController.openDossierModal('${i.candidate_id}', '${i.vacancy_id}')"><i data-lucide="file-text"></i> Dossiê</button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    // Inicia a animação da Constelação Neural Interativa
    setTimeout(() => {
      InteractiveFx.startConstellationCanvas('recruiterConstellationCanvas', candidates, (cand) => {
        this.openDossierModal(cand.id);
      });
    }, 50);
  }

  renderRecruiterSearch(container) {
    container.innerHTML = `
      <div style="background: var(--surface); border: 1px solid var(--border-line); border-radius: var(--radius-banner); padding: 32px; box-shadow: var(--shadow-card); margin-bottom: 24px;">
        <span class="traffic-light-badge light-blue" style="background: var(--blue-soft); color: var(--blue-royal); margin-bottom: 10px;">
          <i data-lucide="mic"></i> Busca Natural com Reconhecimento de Voz & Regras Especialistas
        </span>
        <h2 style="font-size: 1.8rem; margin-bottom: 6px;">Buscar Talentos na Comunidade</h2>
        <p style="margin-bottom: 20px;">Descreva o perfil em texto livre (ex: <em>"Preciso de um analista financeiro em São Paulo que domine Excel avançado, DRE e fluxo de caixa"</em>) ou use o microfone para falar.</p>

        <div style="position: relative; margin-bottom: 16px;">
          <textarea id="searchPromptInput" class="form-control" rows="3" placeholder="Digite ou fale o que você procura..." style="font-size: 1.05rem; padding-right: 56px;">Quero um analista financeiro em São Paulo com Excel avançado, DRE e fluxo de caixa</textarea>
          <button id="btnVoiceSearch" title="Falar pelo Microfone (Web Speech API)" style="position: absolute; right: 12px; top: 12px; width: 40px; height: 40px; border-radius: 50%; border: none; background: var(--blue-royal); color: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center;">
            <i data-lucide="mic"></i>
          </button>
        </div>

        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 16px; margin-bottom: 20px;">
          <div class="form-group" style="margin: 0;">
            <label class="form-label">Motivo da Busca * (Obrigatório para registro e conformidade LGPD)</label>
            <input type="text" id="searchReasonInput" class="form-control" placeholder="Ex: Expansão da equipe de controladoria da holding" value="Expansão da equipe de controladoria da holding">
          </div>
          <div class="form-group" style="margin: 0;">
            <label class="form-label">Vincular a uma Vaga Aberta</label>
            <select id="searchVacancySelect" class="form-control">
              <option value="">Buscar de forma avulsa</option>
              ${StorageService.getVacancies().map(v => `<option value="${v.id}">${v.title}</option>`).join('')}
            </select>
          </div>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
          <div id="voiceStatusMsg" style="font-size: 0.88rem; color: var(--text-muted); font-style: italic;">
            Clique no microfone azul para ditar a qualquer momento.
          </div>
          <button class="btn-primary" id="btnExecuteSearch" style="padding: 12px 28px; font-size: 1rem;"><i data-lucide="search"></i> Localizar Profissionais</button>
        </div>
      </div>

      <!-- Resultados da Busca -->
      <div id="searchResultsSection"></div>
    `;

    const btnVoice = document.getElementById('btnVoiceSearch');
    const voiceMsg = document.getElementById('voiceStatusMsg');

    btnVoice.addEventListener('click', () => {
      voiceMsg.textContent = "Gravando... Fale pausadamente sobre a vaga.";
      btnVoice.style.background = "#d03b3b";

      TalentSearchEngine.startVoiceRecognition(
        (transcript) => {
          document.getElementById('searchPromptInput').value = transcript;
          voiceMsg.textContent = `Voz reconhecida: "${transcript}"`;
          this.executeTalentSearch();
        },
        (error) => {
          voiceMsg.textContent = error;
          btnVoice.style.background = "var(--blue-royal)";
        },
        () => {
          btnVoice.style.background = "var(--blue-royal)";
        }
      );
    });

    document.getElementById('btnExecuteSearch').addEventListener('click', () => {
      this.executeTalentSearch();
    });

    this.executeTalentSearch();
  }

  executeTalentSearch() {
    const prompt = document.getElementById('searchPromptInput')?.value || "analista financeiro";
    const reason = document.getElementById('searchReasonInput')?.value || "Seleção interna";
    const vacId = document.getElementById('searchVacancySelect')?.value || null;

    try {
      const resultsData = TalentSearchEngine.search(prompt, reason, vacId, this.currentUser?.id);
      this.renderSearchResults(resultsData);
    } catch (e) {
      this.showToast(e.message, "error");
    }
  }

  renderSearchResults(data) {
    const section = document.getElementById('searchResultsSection');
    if (!section) return;

    section.innerHTML = `
      <div style="margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
        <h3 style="font-size: 1.3rem;">Profissionais Encontrados (${data.totalFound})</h3>
        ${data.parsed.ageLegalWarning ? `
          <div style="background: #fef8e7; border: 1px solid #fab219; border-radius: 8px; padding: 10px 14px; font-size: 0.85rem; color: #854d0e; max-width: 600px;">
            ${data.parsed.ageLegalWarning}
          </div>
        ` : ''}
      </div>

      <div style="display: flex; flex-direction: column; gap: 18px;">
        ${data.results.map(res => {
          const c = res.candidate;
          const tech = res.technical;
          const beh = res.behavioral;

          return `
            <div style="background: var(--surface); border: 1px solid var(--border-line); border-radius: var(--radius-card); padding: 24px; box-shadow: var(--shadow-card);">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 14px; margin-bottom: 14px;">
                <div>
                  <h3 style="font-size: 1.3rem; margin-bottom: 2px;">${c.full_name}</h3>
                  <div style="font-size: 0.92rem; color: var(--text-muted);">${c.headline}</div>
                  <div style="font-size: 0.85rem; color: var(--text-muted); margin-top: 4px;">📍 ${c.city} - ${c.uf} • Formação: ${c.education} • Faixa: ${c.age_band || 'Não informada'}</div>
                </div>

                <!-- Semáforos Duplos Independentes -->
                <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                  ${this.renderTrafficLight(tech.trafficLight, `Compatibilidade Técnica: ${tech.score}%`)}
                  ${this.renderTrafficLight(beh.trafficLight, `DISC: ${beh.adherence ? beh.adherence + '%' : 'N/A'}`)}
                </div>
              </div>

              <p style="font-size: 0.95rem; color: var(--text-main); margin-bottom: 16px; line-height: 1.6;">${c.summary}</p>

              <div style="margin-bottom: 16px;">
                <div style="font-size: 0.85rem; font-weight: 700; color: var(--text-main); margin-bottom: 6px;">Competências Mapeadas:</div>
                <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                  ${(c.skills || []).map(s => `<span style="background: var(--surface-2); border: 1px solid var(--border-line); padding: 4px 10px; border-radius: var(--radius-pill); font-size: 0.82rem;">${s}</span>`).join('')}
                </div>
              </div>

              <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-line); padding-top: 16px; flex-wrap: wrap; gap: 12px;">
                <div style="font-size: 0.88rem; color: var(--text-muted);">
                  📧 ${c.email} • 📱 ${c.phone}
                </div>
                <div style="display: flex; gap: 10px;">
                  <button class="btn-secondary" onclick="window.appController.openDossierModal('${c.id}')"><i data-lucide="file-text"></i> Ver Dossiê Completo</button>
                  <button class="btn-primary" onclick="window.appController.openScheduleModal('${c.id}', '${c.full_name}')"><i data-lucide="calendar"></i> Agendar Entrevista</button>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;

    this.renderIcons();
  }

  renderRecruiterVacancies(container) {
    const vacancies = StorageService.getVacancies();

    container.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 12px;">
        <div>
          <h2 style="font-size: 1.8rem; margin-bottom: 6px;">Gestão de Vagas Abertas</h2>
          <p>Cadastre requisitos e acompanhe a atratividade das oportunidades de sua organização.</p>
        </div>
        <button class="btn-primary" onclick="window.appController.openNewVacancyModal()"><i data-lucide="plus-circle"></i> Publicar Nova Vaga</button>
      </div>

      <div style="display: flex; flex-direction: column; gap: 16px;">
        ${vacancies.map(v => `
          <div style="background: var(--surface); border: 1px solid var(--border-line); border-radius: var(--radius-card); padding: 24px; box-shadow: var(--shadow-card);">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
              <div>
                <h3 style="font-size: 1.3rem;">${v.title}</h3>
                <div style="font-size: 0.9rem; color: var(--text-muted);">${v.company} • ${v.city} - ${v.uf} (${v.work_mode})</div>
              </div>
              ${this.renderTrafficLight('green', 'Vaga Ativa')}
            </div>
            <p style="font-size: 0.92rem; color: var(--text-muted); margin-bottom: 14px;">${v.description}</p>
            <div style="display: flex; justify-content: flex-end; gap: 10px;">
              <button class="btn-secondary" onclick="window.appController.switchTab('rec_busca')"><i data-lucide="search"></i> Buscar Candidatos para Esta Vaga</button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  renderRecruiterProcesses(container) {
    const interviews = ProcessService.getInterviews();
    const stages = ProcessService.getStages();

    container.innerHTML = `
      <div style="margin-bottom: 24px;">
        <h2 style="font-size: 1.8rem; margin-bottom: 6px;">Esteira Kanban de Recrutamento & Seleção</h2>
        <p>Acompanhe cada talento pelas 7 etapas do processo seletivo estruturado.</p>
      </div>

      <div class="kanban-board">
        ${stages.map(st => {
          const itemsInStage = interviews.filter(i => i.stage === st.id);

          return `
            <div class="kanban-column">
              <div class="kanban-column-header">
                <h4>${st.name}</h4>
                <span class="mono-value" style="font-weight: 700; background: var(--surface); padding: 2px 8px; border-radius: var(--radius-pill); font-size: 0.8rem;">${itemsInStage.length}</span>
              </div>

              ${itemsInStage.map(item => `
                <div class="kanban-card">
                  <div style="font-weight: 700; font-size: 1rem; color: var(--text-main); margin-bottom: 2px;">${item.candidate_name}</div>
                  <div style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 10px;">${item.vacancy_title}</div>
                  
                  <div style="margin-bottom: 12px;">
                    ${this.renderTrafficLight(item.status === 'confirmada' ? 'green' : 'yellow', item.status.toUpperCase())}
                  </div>

                  <div style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 12px;">
                    📅 ${item.scheduled_at ? new Date(item.scheduled_at).toLocaleDateString('pt-BR') : 'Data pendente'}
                  </div>

                  <div style="display: flex; flex-direction: column; gap: 6px;">
                    <button class="btn-primary" style="font-size: 0.82rem; padding: 6px 12px; min-height: 36px;" onclick="window.appController.handleAdvanceStage('${item.id}')">
                      Próxima Etapa &rarr;
                    </button>
                    <div style="display: flex; gap: 6px;">
                      <button class="btn-secondary" style="flex: 1; font-size: 0.78rem; min-height: 34px; padding: 4px;" onclick="window.appController.openDossierModal('${item.candidate_id}', '${item.vacancy_id}')">Dossiê</button>
                      <button class="btn-secondary" style="flex: 1; font-size: 0.78rem; min-height: 34px; padding: 4px;" onclick="window.appController.downloadIcs('${item.id}')">ICS</button>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  handleAdvanceStage(interviewId) {
    const updated = ProcessService.advanceStage(interviewId);
    if (updated) {
      this.showToast(`Candidato avançou para a etapa: ${PIPELINE_STAGES.find(s => s.id === updated.stage)?.name}!`, "success");
      this.renderRecruiterProcesses(document.getElementById('viewContainer'));
      this.renderIcons();
    }
  }

  // ==============================================
  // MÓDULO QUÂNTICO: SIMULADOR DE SQUADS 360° ("MONTE SUA EQUIPE")
  // ==============================================

  renderSquadSimulator(container) {
    const squads = StorageService.getSquads();
    const allCandidates = StorageService.getCandidates();
    const currentSquad = squads[0] || {
      id: 'squad_1',
      name: 'Squad Alfa • Transformação Digital & Eficiência',
      description: 'Time multidisciplinar focado em inovação, governança e expansão.',
      members: [
        { candidate_id: 'cand_1', role: 'Liderança Estratégica & FP&A' },
        { candidate_id: 'cand_3', role: 'Governança & Compliance CLT' },
        { candidate_id: 'cand_4', role: 'Expansão Comercial B2B' }
      ]
    };

    const metrics = QuantumSquadEngine.calculateSquadMetrics(currentSquad.members, allCandidates);

    // Definição dos 4 papéis essenciais de um squad equilibrado
    const squadRoles = [
      { key: 'lideranca', title: '👑 Liderança & Tomada de Decisão', discFocus: 'Foco D/I', defaultCandId: 'cand_4' },
      { key: 'tecnico', title: '⚡ Finanças & Especialidade Técnica', discFocus: 'Foco Hard Skills', defaultCandId: 'cand_1' },
      { key: 'governanca', title: '🛡️ Governança, Compliance & DP', discFocus: 'Foco C', defaultCandId: 'cand_3' },
      { key: 'cultura', title: '🤝 Cultura, Sucesso do Cliente & CX', discFocus: 'Foco S/I', defaultCandId: 'cand_2' }
    ];

    container.innerHTML = `
      <!-- Cabeçalho do Squad Simulator -->
      <div class="future-glass-card" style="padding: 32px; margin-bottom: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 16px;">
          <div>
            <span class="future-hero-badge"><i data-lucide="sparkles"></i> Monte Sua Equipe • Simulador Quântico 360°</span>
            <h2 style="font-size: 2.1rem; margin-bottom: 6px;">Monte Sua Equipe em Tempo Real</h2>
            <p style="font-size: 1rem; color: var(--text-muted); max-width: 680px; margin: 0;">
              Combine talentos reais com perfis comportamentais DISC complementares.
              O algoritmo avalia em tempo real a harmonia de liderança, blindagem de governança e sinergia de execução.
            </p>
          </div>
          <div style="display: flex; gap: 10px; flex-wrap: wrap;">
            <button class="btn-primary" id="btnExportSquadDossier">
              <i data-lucide="file-check"></i> Exportar Dossiê de Squad (HTML)
            </button>
          </div>
        </div>
      </div>

      <!-- Layout Grid: Slots do Squad + Painel de Telemetria Quântica -->
      <div class="squad-builder-grid">
        <!-- Coluna Esquerda: Slots de Membros do Squad -->
        <div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
            <h3 style="font-size: 1.3rem; margin: 0; display: flex; align-items: center; gap: 8px;">
              <i data-lucide="layers" style="color: var(--blue-royal);"></i> Posições Estratégicas do Squad
            </h3>
            <span style="font-size: 0.82rem; color: var(--text-muted);">${currentSquad.members.length} membros alocados</span>
          </div>

          <div class="squad-slots-container">
            ${squadRoles.map((roleDef, idx) => {
              const currentMember = currentSquad.members[idx] || null;
              const assignedCand = currentMember ? allCandidates.find(c => c.id === currentMember.candidate_id) : null;

              if (assignedCand) {
                const avatarUrl = assignedCand.avatar || 'assets/avatar-mariana.jpg';
                const discP = (assignedCand.disc && assignedCand.disc.primary) || 'C';
                const discS = (assignedCand.disc && assignedCand.disc.secondary) || 'S';

                return `
                  <div class="squad-slot-card filled">
                    <div style="font-size: 0.78rem; font-weight: 700; color: #2563eb; text-transform: uppercase; margin-bottom: 10px;">
                      ${roleDef.title}
                    </div>
                    <img src="${avatarUrl}" class="candidate-avatar-img" style="width: 56px; height: 56px; margin-bottom: 8px;" alt="${assignedCand.full_name}">
                    <strong style="font-size: 1rem; color: #0f172a; margin-bottom: 2px;">${assignedCand.full_name}</strong>
                    <div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 8px;">${assignedCand.headline || 'Especialista'}</div>
                    <span style="background: #eff6ff; color: #1e40af; border: 1px solid #bfdbfe; padding: 2px 8px; border-radius: 999px; font-size: 0.75rem; font-weight: 700; margin-bottom: 12px;">
                      DISC: ${discP}/${discS} • CV: ${assignedCand.cvScore || 90}
                    </span>

                    <div style="display: flex; gap: 6px; width: 100%;">
                      <select class="form-control squad-member-select" data-slot-index="${idx}" style="font-size: 0.8rem; padding: 6px;">
                        ${allCandidates.map(c => `
                          <option value="${c.id}" ${c.id === assignedCand.id ? 'selected' : ''}>${c.full_name} (DISC: ${c.disc?.primary || 'C'})</option>
                        `).join('')}
                      </select>
                    </div>
                  </div>
                `;
              } else {
                return `
                  <div class="squad-slot-card">
                    <div style="font-size: 0.78rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-bottom: 8px;">
                      ${roleDef.title}
                    </div>
                    <div style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 14px;">
                      Posição Vaga • ${roleDef.discFocus}
                    </div>
                    <select class="form-control squad-member-select" data-slot-index="${idx}" style="font-size: 0.82rem;">
                      <option value="">+ Selecionar Profissional...</option>
                      ${allCandidates.map(c => `
                        <option value="${c.id}">${c.full_name} (${c.headline || 'Talento'})</option>
                      `).join('')}
                    </select>
                  </div>
                `;
              }
            }).join('')}
          </div>
        </div>

        <!-- Coluna Direita: Telemetria de Sinergia e Balanço DISC -->
        <div class="squad-telemetry-panel future-glass-card">
          <div class="synergy-gauge-circle">
            <div class="synergy-gauge-val">${metrics.synergyScore}%</div>
            <div class="synergy-gauge-lbl">Sinergia</div>
          </div>

          <div style="text-align: center; margin-bottom: 18px;">
            <div style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase; color: var(--text-muted);">Arquétipo do Time</div>
            <strong style="font-size: 0.95rem; color: #1e3a8a;">${metrics.archetype}</strong>
          </div>

          <!-- Radar Holográfico de Competências -->
          <div style="margin-bottom: 18px;">
            <div style="font-size: 0.78rem; font-weight: 700; text-transform: uppercase; color: var(--text-muted); margin-bottom: 6px; text-align: center;">
              Radar Holográfico do Squad
            </div>
            ${InteractiveFx.renderRadarSvg({
              tecnico: Math.min(95, 60 + metrics.skillsCoverage.length * 3.5),
              lideranca: Math.min(95, metrics.discBalance.D * 2.3),
              governanca: Math.min(95, metrics.discBalance.C * 2.3),
              resiliencia: Math.min(95, (metrics.discBalance.D + metrics.discBalance.S) * 1.3),
              comunicacao: Math.min(95, metrics.discBalance.I * 2.4)
            })}
          </div>

          <!-- Barras de Fatores DISC do Squad -->
          <div style="font-size: 0.78rem; font-weight: 700; text-transform: uppercase; color: var(--text-muted); margin-bottom: 8px;">
            Balanço Coletivo DISC:
          </div>
          <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px;">
            <div>
              <div style="display: flex; justify-content: space-between; font-size: 0.78rem; margin-bottom: 2px;">
                <span>Dominância (D)</span>
                <strong>${metrics.discBalance.D}%</strong>
              </div>
              <div style="height: 6px; background: #e2e8f0; border-radius: 999px; overflow: hidden;">
                <div style="width: ${metrics.discBalance.D}%; height: 100%; background: #ef4444;"></div>
              </div>
            </div>

            <div>
              <div style="display: flex; justify-content: space-between; font-size: 0.78rem; margin-bottom: 2px;">
                <span>Influência (I)</span>
                <strong>${metrics.discBalance.I}%</strong>
              </div>
              <div style="height: 6px; background: #e2e8f0; border-radius: 999px; overflow: hidden;">
                <div style="width: ${metrics.discBalance.I}%; height: 100%; background: #f59e0b;"></div>
              </div>
            </div>

            <div>
              <div style="display: flex; justify-content: space-between; font-size: 0.78rem; margin-bottom: 2px;">
                <span>Estabilidade (S)</span>
                <strong>${metrics.discBalance.S}%</strong>
              </div>
              <div style="height: 6px; background: #e2e8f0; border-radius: 999px; overflow: hidden;">
                <div style="width: ${metrics.discBalance.S}%; height: 100%; background: #10b981;"></div>
              </div>
            </div>

            <div>
              <div style="display: flex; justify-content: space-between; font-size: 0.78rem; margin-bottom: 2px;">
                <span>Conformidade (C)</span>
                <strong>${metrics.discBalance.C}%</strong>
              </div>
              <div style="height: 6px; background: #e2e8f0; border-radius: 999px; overflow: hidden;">
                <div style="width: ${metrics.discBalance.C}%; height: 100%; background: #3b82f6;"></div>
              </div>
            </div>
          </div>

          <!-- Diagnóstico de Gestão -->
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px;">
            <div style="font-size: 0.78rem; font-weight: 700; color: #166534; margin-bottom: 4px;">✓ Força Competitiva</div>
            <div style="font-size: 0.8rem; color: #475569; margin-bottom: 10px;">${metrics.strengths[0] || 'Equilíbrio funcional.'}</div>
            <div style="font-size: 0.78rem; font-weight: 700; color: #991b1b; margin-bottom: 4px;">⚠ Ponto de Governança</div>
            <div style="font-size: 0.8rem; color: #475569;">${metrics.blindspots[0] || 'Baixo risco comportamental.'}</div>
          </div>
        </div>
      </div>
    `;

    // Eventos de alteração de membros no Squad
    container.querySelectorAll('.squad-member-select').forEach(sel => {
      sel.addEventListener('change', (e) => {
        const slotIdx = parseInt(e.target.dataset.slotIndex, 10);
        const candId = e.target.value;
        const defaultRoles = [
          'Liderança Estratégica & Decisão',
          'Finanças & Especialidade Técnica',
          'Governança & Compliance CLT',
          'Cultura, Sucesso do Cliente & CX'
        ];

        if (candId) {
          currentSquad.members[slotIdx] = {
            candidate_id: candId,
            role: defaultRoles[slotIdx] || 'Especialista'
          };
        } else {
          currentSquad.members.splice(slotIdx, 1);
        }

        StorageService.saveSquad(currentSquad);
        InteractiveFx.playChime();
        this.renderSquadSimulator(container);
        this.renderIcons();
      });
    });

    // Evento de exportação do dossiê de squad
    const btnExp = document.getElementById('btnExportSquadDossier');
    if (btnExp) {
      btnExp.addEventListener('click', () => {
        InteractiveFx.playClick();
        const html = QuantumSquadEngine.generateSquadReportHtml(currentSquad, allCandidates);
        try {
          const win = window.open('', '_blank');
          if (win && win.document) {
            win.document.open();
            win.document.write(html);
            win.document.close();
            this.showToast('Dossiê do Squad aberto em nova aba para impressão.', 'success');
            return;
          }
        } catch (e) {}

        // Fallback: download direto do HTML
        const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `dossie-squad-${currentSquad.id}.html`;
        a.click();
        this.showToast('Dossiê do Squad baixado em HTML.', 'success');
      });
    }
  }

  // ==============================================
  // VISÃO: BANCO DE DADOS ACOPLADO & NUVEM GRATUITA
  // ==============================================

  renderCloudDbView(container) {
    const cands = StorageService.getCandidates();
    const vacs = StorageService.getVacancies();
    const apps = StorageService.getApplications();
    const interviews = ProcessService.getInterviews();
    const squads = StorageService.getSquads();
    const cloudConfig = StorageService.getCloudConfig();

    container.innerHTML = `
      <!-- Topo da Gestão do Banco -->
      <div class="future-glass-card" style="padding: 32px; margin-bottom: 24px;">
        <span class="future-hero-badge"><i data-lucide="database"></i> Arquitetura Autônoma • Sem Custos</span>
        <h2 style="font-size: 2rem; margin-bottom: 8px;">Banco de Dados Acoplado & Publicação Sem Custo</h2>
        <p style="font-size: 1rem; color: var(--text-muted); max-width: 720px; margin: 0;">
          Construído para funcionar sem custos para quem publica ou utiliza.
          Todos os dados rodam diretamente no navegador através de IndexedDB reativo, com suporte nativo a sincronização em nuvem gratuita no Supabase.
        </p>
      </div>

      <!-- Grid: Motor Local + Nuvem Supabase -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px;">
        <!-- Card 1: Motor Local IndexedDB -->
        <div class="cloud-db-card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
            <h3 style="font-size: 1.25rem; margin: 0; color: #1e3a8a;">Motor Local Autônomo</h3>
            <span class="cloud-status-badge local">
              <span style="width: 8px; height: 8px; border-radius: 50%; background: #2563eb;"></span>
              Ativo & Persistente
            </span>
          </div>

          <p style="font-size: 0.88rem; color: var(--text-muted); margin-bottom: 18px; line-height: 1.5;">
            Os dados são persistidos permanentemente no dispositivo de quem acessa. Zero risco de perda ao fechar a janela ou reiniciar.
          </p>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px;">
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 12px; border-radius: 10px; text-align: center;">
              <div style="font-size: 1.4rem; font-weight: 800; color: #1d4ed8;">${cands.length}</div>
              <div style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted);">Candidatos</div>
            </div>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 12px; border-radius: 10px; text-align: center;">
              <div style="font-size: 1.4rem; font-weight: 800; color: #1d4ed8;">${vacs.length}</div>
              <div style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted);">Vagas</div>
            </div>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 12px; border-radius: 10px; text-align: center;">
              <div style="font-size: 1.4rem; font-weight: 800; color: #1d4ed8;">${squads.length}</div>
              <div style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted);">Squads</div>
            </div>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 12px; border-radius: 10px; text-align: center;">
              <div style="font-size: 1.4rem; font-weight: 800; color: #1d4ed8;">${interviews.length}</div>
              <div style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted);">Entrevistas</div>
            </div>
          </div>

          <div style="display: flex; flex-direction: column; gap: 8px;">
            <button class="btn-primary" onclick="document.getElementById('btnExportFullDb').click()">
              <i data-lucide="download"></i> Fazer Backup Completo (JSON)
            </button>
            <button class="btn-secondary" onclick="document.getElementById('btnTriggerImportDb').click()">
              <i data-lucide="upload"></i> Restaurar Backup Anterior
            </button>
          </div>
        </div>

        <!-- Card 2: Sincronização em Nuvem Gratuita -->
        <div class="cloud-db-card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
            <h3 style="font-size: 1.25rem; margin: 0; color: #1e3a8a;">Sincronização em Nuvem (Supabase)</h3>
            <span class="cloud-status-badge ${cloudConfig.enabled ? 'online' : 'local'}">
              <span style="width: 8px; height: 8px; border-radius: 50%; background: ${cloudConfig.enabled ? '#10b981' : '#64748b'};"></span>
              ${cloudConfig.enabled ? 'Conectado' : 'Opcional (Gratuito)'}
            </span>
          </div>

          <p style="font-size: 0.88rem; color: var(--text-muted); margin-bottom: 18px; line-height: 1.5;">
            Conecte qualquer projeto gratuito do Supabase para manter celulares e computadores sincronizados em tempo real sem custos.
          </p>

          <div style="margin-bottom: 14px;">
            <label class="form-label" style="font-size: 0.8rem;">Supabase Project URL</label>
            <input type="url" id="cloudViewSupabaseUrl" class="form-control" value="${cloudConfig.supabaseUrl || ''}" placeholder="https://xyz.supabase.co" style="font-size: 0.85rem;">
          </div>

          <div style="margin-bottom: 16px;">
            <label class="form-label" style="font-size: 0.8rem;">Supabase Anon Public Key</label>
            <input type="password" id="cloudViewSupabaseKey" class="form-control" value="${cloudConfig.supabaseAnonKey || ''}" placeholder="eyJhbGciOi..." style="font-size: 0.85rem;">
          </div>

          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            <button class="btn-primary" id="btnCloudViewTest" style="font-size: 0.82rem; padding: 8px 14px;">
              <i data-lucide="wifi"></i> Salvar & Testar
            </button>
            <button class="btn-secondary" id="btnCloudViewSync" style="font-size: 0.82rem; padding: 8px 14px;">
              <i data-lucide="refresh-cw"></i> Sincronizar Agora
            </button>
            <button class="btn-secondary" id="btnCloudViewCopySql" style="font-size: 0.82rem; padding: 8px 14px;">
              <i data-lucide="code-2"></i> Copiar Script SQL
            </button>
          </div>
          <div id="cloudViewFeedback" style="margin-top: 10px; font-size: 0.82rem;"></div>
        </div>
      </div>

      <!-- Guia de Publicação Gratuita -->
      <div class="future-glass-card" style="padding: 28px;">
        <h3 style="font-size: 1.25rem; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
          <i data-lucide="rocket" style="color: var(--blue-royal);"></i> Como Publicar Esta Plataforma 100% de Graça
        </h3>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 16px; margin-top: 16px;">
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 18px;">
            <div style="font-weight: 700; color: #1e40af; margin-bottom: 6px;">1. GitHub Pages (Recomendado)</div>
            <p style="font-size: 0.84rem; color: #475569; line-height: 1.5; margin: 0;">
              O repositório já conta com o fluxo de automação em <code style="background: #fff; padding: 1px 4px; border-radius: 4px;">.github/workflows/deploy.yml</code>. Basta subir seu código para o GitHub e seu site estará no ar em segundos com SSL grátis.
            </p>
          </div>

          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 18px;">
            <div style="font-weight: 700; color: #1e40af; margin-bottom: 6px;">2. Vercel / Cloudflare Pages</div>
            <p style="font-size: 0.84rem; color: #475569; line-height: 1.5; margin: 0;">
              O arquivo <code style="background: #fff; padding: 1px 4px; border-radius: 4px;">vercel.json</code> já está pronto na raiz do projeto. Conecte sua conta do GitHub na Vercel e aproveite CDN ultrarrápida mundial sem pagar 1 centavo.
            </p>
          </div>

          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 18px;">
            <div style="font-weight: 700; color: #1e40af; margin-bottom: 6px;">3. PWA (Aplicativo Instalável)</div>
            <p style="font-size: 0.84rem; color: #475569; line-height: 1.5; margin: 0;">
              Com o <code style="background: #fff; padding: 1px 4px; border-radius: 4px;">manifest.json</code> e <code style="background: #fff; padding: 1px 4px; border-radius: 4px;">sw.js</code>, os usuários podem clicar em "Instalar no Celular/Computador" e usar como aplicativo com ícone na tela inicial.
            </p>
          </div>
        </div>
      </div>
    `;

    // Eventos na tela de Cloud DB
    const btnTest = document.getElementById('btnCloudViewTest');
    if (btnTest) {
      btnTest.addEventListener('click', async () => {
        InteractiveFx.playClick();
        const url = document.getElementById('cloudViewSupabaseUrl').value.trim();
        const key = document.getElementById('cloudViewSupabaseKey').value.trim();
        const fb = document.getElementById('cloudViewFeedback');
        fb.innerHTML = '<span style="color: #2563eb;">Testando conexão...</span>';
        const res = await CloudDbConnector.testConnection(url, key);
        if (res.success) {
          StorageService.saveCloudConfig({ supabaseUrl: url, supabaseAnonKey: key, enabled: true });
          fb.innerHTML = `<span style="color: #166534; font-weight: 700;">✓ ${res.message}</span>`;
          InteractiveFx.playChime();
          this.showToast('Supabase conectado com sucesso!', 'success');
        } else {
          fb.innerHTML = `<span style="color: #b91c1c; font-weight: 700;">⚠ ${res.message}</span>`;
        }
      });
    }

    const btnSync = document.getElementById('btnCloudViewSync');
    if (btnSync) {
      btnSync.addEventListener('click', async () => {
        InteractiveFx.playScan();
        const url = document.getElementById('cloudViewSupabaseUrl').value.trim();
        const key = document.getElementById('cloudViewSupabaseKey').value.trim();
        if (!url || !key) {
          this.showToast('Preencha a URL e a chave do Supabase primeiro.', 'error');
          return;
        }
        this.showToast('Sincronizando com a nuvem...', 'info');
        const res = await CloudDbConnector.syncAllToCloud(url, key);
        if (res.success) {
          InteractiveFx.playChime();
          this.showToast(`Sincronização concluída! ${res.count} registros enviados.`, 'success');
        } else {
          this.showToast('Erro: ' + res.error, 'error');
        }
      });
    }

    const btnSql = document.getElementById('btnCloudViewCopySql');
    if (btnSql) {
      btnSql.addEventListener('click', () => {
        InteractiveFx.playClick();
        const sql = CloudDbConnector.getSupabaseSchemaSql();
        navigator.clipboard.writeText(sql).then(() => {
          this.showToast('Script SQL copiado com sucesso!', 'success');
        });
      });
    }
  }

  renderRecruiterCompany(container) {
    const user = this.currentUser || {};

    container.innerHTML = `
      <div style="background: var(--surface); border: 1px solid var(--border-line); border-radius: var(--radius-banner); padding: 32px; box-shadow: var(--shadow-card); max-width: 720px; margin: 0 auto;">
        <h2 style="font-size: 1.8rem; margin-bottom: 8px;">Dados da Organização</h2>
        <p style="margin-bottom: 24px;">Informações exibidas aos candidatos em convites de entrevistas e comunicados.</p>

        <div class="form-group">
          <label class="form-label">Razão Social / Nome da Empresa</label>
          <input type="text" class="form-control" value="${user.company || 'Grupo Âmplia Performance'}" readonly style="background: var(--surface-2);">
        </div>

        <div class="form-group">
          <label class="form-label">Seu Nome e Cargo</label>
          <input type="text" class="form-control" value="${user.full_name} (${user.job_title || 'RH'})" readonly style="background: var(--surface-2);">
        </div>

        <div class="form-group">
          <label class="form-label">Finalidade Registrada da Busca</label>
          <p style="font-size: 0.92rem; color: var(--text-muted); background: var(--surface-2); padding: 14px; border-radius: 10px;">${user.purpose || 'Atração e seleção de talentos para expansão corporativa.'}</p>
        </div>
      </div>
    `;
  }

  // ==============================================
  // VISÕES: ADMINISTRADORA
  // ==============================================

  renderAdminInicio(container) {
    const metrics = AdminService.getMetrics();

    container.innerHTML = `
      <div class="hero-welcome-banner">
        <div class="hero-text-content">
          <div class="hero-badge"><i data-lucide="shield-check"></i> Governança Executiva do Monte Sua Equipe</div>
          <h2>Conexões que abrem caminhos</h2>
          <p>Painel de gestão da comunidade, aprovação rigorosa de cadastros corporativos e garantia de integridade da plataforma.</p>
        </div>
        <div class="hero-graphic-box">
          <div style="background: var(--surface); border: 1px solid var(--border-line); border-radius: var(--radius-banner); padding: 24px; box-shadow: var(--shadow-card); text-align: center;">
            <div style="font-size: 0.82rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">Usuários com Dados Salvos</div>
            <div class="mono-value" style="font-size: 2.4rem; font-weight: 800; color: var(--signal-${metrics.savedLight}); margin: 8px 0;">${metrics.savedPercentage}%</div>
            ${this.renderTrafficLight(metrics.savedLight, 'Status de Engajamento')}
          </div>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; margin-bottom: 24px;">
        <div class="card-step border-coral" onclick="window.appController.switchTab('adm_usuarios')">
          <div>
            ${this.renderTrafficLight(metrics.pendingCount > 0 ? 'red' : 'green', metrics.pendingCount > 0 ? `${metrics.pendingCount} Pendentes` : 'Tudo em dia')}
            <h3 style="margin-top: 10px;">1. Cuide da Comunidade</h3>
            <p>Aprove ou bloqueie acessos de empresas para garantir um ambiente seguro e de alta confiança.</p>
          </div>
          <span style="color: var(--coral-accent); font-weight: 700; font-size: 0.85rem;">Gerenciar acessos &rarr;</span>
        </div>

        <div class="card-step border-blue" onclick="window.appController.switchTab('adm_painel')">
          <div>
            ${this.renderTrafficLight('green', `${metrics.totalConnections} Conexões Feitas`)}
            <h3 style="margin-top: 10px;">2. Acompanhe o Movimento</h3>
            <p>Métricas de entrevistas agendadas, interesses manifestados e novos cadastros semanais.</p>
          </div>
          <span style="color: var(--blue-royal); font-weight: 700; font-size: 0.85rem;">Ver métricas &rarr;</span>
        </div>

        <div class="card-step border-lilac" onclick="window.appController.switchTab('adm_buscas')">
          <div>
            ${this.renderTrafficLight('green', `${metrics.totalSearches} Buscas Auditadas`)}
            <h3 style="margin-top: 10px;">3. Auditoria & Transparência</h3>
            <p>Trilhas de auditoria das consultas corporativas realizadas com exportação instantânea em CSV.</p>
          </div>
          <span style="color: var(--lilac-accent); font-weight: 700; font-size: 0.85rem;">Auditar buscas &rarr;</span>
        </div>
      </div>
    `;
  }

  renderAdminPainel(container) {
    const metrics = AdminService.getMetrics();
    const profiles = StorageService.getProfiles();

    container.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 12px;">
        <div>
          <h2 style="font-size: 1.8rem; margin-bottom: 6px;">Uso do Aplicativo & Conexões Geradas</h2>
          <p>Métricas globais de engajamento, funil de conversão e estilos comportamentais dos profissionais.</p>
        </div>
        <button class="btn-primary" onclick="window.appController.exportAllDataCsv()"><i data-lucide="download"></i> Exportar Relatório Geral (CSV)</button>
      </div>

      <!-- 6 KPIs Principais -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin-bottom: 28px;">
        <div class="kpi-metric-card">
          <div class="kpi-title">Total de Usuários</div>
          <div class="kpi-number">${metrics.totalUsers}</div>
          <div class="kpi-delta">+3 em 7 dias</div>
        </div>
        <div class="kpi-metric-card">
          <div class="kpi-title">Profissionais</div>
          <div class="kpi-number">${metrics.totalCandidates}</div>
          <div class="kpi-delta">+2 em 7 dias</div>
        </div>
        <div class="kpi-metric-card">
          <div class="kpi-title">Empresas & Consultorias</div>
          <div class="kpi-number">${metrics.totalRecruiters}</div>
          <div class="kpi-delta">+1 em 7 dias</div>
        </div>
        <div class="kpi-metric-card">
          <div class="kpi-title">Buscas Realizadas</div>
          <div class="kpi-number">${metrics.totalSearches}</div>
          <div class="kpi-delta">+5 em 7 dias</div>
        </div>
        <div class="kpi-metric-card">
          <div class="kpi-title">Conexões Geradas</div>
          <div class="kpi-number">${metrics.totalConnections}</div>
          <div class="kpi-delta">+2 em 7 dias</div>
        </div>
        <div class="kpi-metric-card">
          <div class="kpi-title">Salvaram Dados</div>
          <div class="kpi-number">${metrics.savedPercentage}%</div>
          <div class="kpi-delta" style="color: var(--signal-${metrics.savedLight});">Semáforo Ativo</div>
        </div>
      </div>

      <!-- Gráfico 1: Novos Cadastros por Semana (Colunas Agrupadas) -->
      <div style="background: var(--surface); border: 1px solid var(--border-line); border-radius: var(--radius-card); padding: 24px; box-shadow: var(--shadow-card); margin-bottom: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 10px;">
          <h3 style="font-size: 1.2rem;">Novos Cadastros Semanais (Últimas 8 Semanas)</h3>
          <div style="display: flex; gap: 16px; font-size: 0.85rem;">
            <span style="display: flex; align-items: center; gap: 6px;"><span style="width: 12px; height: 12px; background: #2a78d6; border-radius: 3px;"></span> Profissionais (#2a78d6)</span>
            <span style="display: flex; align-items: center; gap: 6px;"><span style="width: 12px; height: 12px; background: #eb6834; border-radius: 3px;"></span> Empresas (#eb6834)</span>
          </div>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: flex-end; height: 160px; padding-top: 20px; border-bottom: 1px solid var(--border-line); gap: 12px;">
          ${[
            { s: 'Sem 1', p: 4, e: 2 },
            { s: 'Sem 2', p: 7, e: 3 },
            { s: 'Sem 3', p: 9, e: 4 },
            { s: 'Sem 4', p: 12, e: 5 },
            { s: 'Sem 5', p: 15, e: 6 },
            { s: 'Sem 6', p: 18, e: 8 },
            { s: 'Sem 7', p: 22, e: 9 },
            { s: 'Sem 8', p: 26, e: 12 }
          ].map(w => `
            <div style="flex: 1; display: flex; flex-direction: column; align-items: center; height: 100%; justify-content: flex-end;">
              <div style="display: flex; gap: 4px; align-items: flex-end; height: 100%;">
                <div style="width: 16px; height: ${(w.p / 30) * 100}%; background: #2a78d6; border-radius: 4px 4px 0 0;" title="${w.p} profissionais"></div>
                <div style="width: 16px; height: ${(w.e / 30) * 100}%; background: #eb6834; border-radius: 4px 4px 0 0;" title="${w.e} empresas"></div>
              </div>
              <span style="font-size: 0.72rem; color: var(--text-muted); margin-top: 6px;">${w.s}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Gráfico 2: Funil de Conexões em Escala de Azuis -->
      <div style="background: var(--surface); border: 1px solid var(--border-line); border-radius: var(--radius-card); padding: 24px; box-shadow: var(--shadow-card); margin-bottom: 24px;">
        <h3 style="font-size: 1.2rem; margin-bottom: 16px;">Funil de Conexões e Relacionamento (Escala de Azuis)</h3>
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <div>
            <div style="display: flex; justify-content: space-between; font-size: 0.88rem; margin-bottom: 4px;">
              <span>1. Buscas de Talentos Realizadas (#86b6ef)</span>
              <strong>100% (24 buscas)</strong>
            </div>
            <div style="background: var(--surface-2); height: 16px; border-radius: 8px; overflow: hidden;">
              <div style="width: 100%; height: 100%; background: #86b6ef;"></div>
            </div>
          </div>

          <div>
            <div style="display: flex; justify-content: space-between; font-size: 0.88rem; margin-bottom: 4px;">
              <span>2. Perfis de Candidatos Visualizados (#5598e7)</span>
              <strong>75% (18 visualizações)</strong>
            </div>
            <div style="background: var(--surface-2); height: 16px; border-radius: 8px; overflow: hidden;">
              <div style="width: 75%; height: 100%; background: #5598e7;"></div>
            </div>
          </div>

          <div>
            <div style="display: flex; justify-content: space-between; font-size: 0.88rem; margin-bottom: 4px;">
              <span>3. Contatos e Dossiês Acessados (#2a78d6)</span>
              <strong>58% (14 acessos)</strong>
            </div>
            <div style="background: var(--surface-2); height: 16px; border-radius: 8px; overflow: hidden;">
              <div style="width: 58%; height: 100%; background: #2a78d6;"></div>
            </div>
          </div>

          <div>
            <div style="display: flex; justify-content: space-between; font-size: 0.88rem; margin-bottom: 4px;">
              <span>4. Etapas de Entrevistas Agendadas (#1c5cab)</span>
              <strong>38% (9 agendamentos)</strong>
            </div>
            <div style="background: var(--surface-2); height: 16px; border-radius: 8px; overflow: hidden;">
              <div style="width: 38%; height: 100%; background: #1c5cab;"></div>
            </div>
          </div>

          <div>
            <div style="display: flex; justify-content: space-between; font-size: 0.88rem; margin-bottom: 4px;">
              <span>5. Presenças Confirmadas (#104281)</span>
              <strong>33% (8 confirmados)</strong>
            </div>
            <div style="background: var(--surface-2); height: 16px; border-radius: 8px; overflow: hidden;">
              <div style="width: 33%; height: 100%; background: #104281;"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabela: Engajamento por Pessoa com Semáforos -->
      <div style="background: var(--surface); border: 1px solid var(--border-line); border-radius: var(--radius-card); padding: 24px; box-shadow: var(--shadow-card);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <h3 style="font-size: 1.2rem;">Engajamento Individual de Usuários</h3>
          <button class="btn-secondary" style="font-size: 0.82rem;" onclick="window.appController.exportActivityCsv()"><i data-lucide="download"></i> Exportar CSV</button>
        </div>

        <table style="width: 100%; border-collapse: collapse; font-size: 0.9rem; text-align: left;">
          <thead>
            <tr style="border-bottom: 1px solid var(--border-line); color: var(--text-muted);">
              <th style="padding: 10px;">Nome / Usuário</th>
              <th style="padding: 10px;">Papel</th>
              <th style="padding: 10px;">Acessos</th>
              <th style="padding: 10px;">Visualizações</th>
              <th style="padding: 10px;">Salvamentos</th>
              <th style="padding: 10px;">Situação</th>
            </tr>
          </thead>
          <tbody>
            ${profiles.map(p => `
              <tr style="border-bottom: 1px solid var(--border-line);">
                <td style="padding: 12px 10px; font-weight: 700;">${p.full_name}</td>
                <td style="padding: 12px 10px;">${p.role}</td>
                <td style="padding: 12px 10px;">14</td>
                <td style="padding: 12px 10px;">8</td>
                <td style="padding: 12px 10px;">5</td>
                <td style="padding: 12px 10px;">
                  ${this.renderTrafficLight('green', 'Salvou Dados')}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  exportAllDataCsv() {
    AdminService.exportActivityLogsCsv();
  }

  renderAdminUsuarios(container) {
    const profiles = StorageService.getProfiles();

    container.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
        <div>
          <h2 style="font-size: 1.8rem; margin-bottom: 6px;">Gestão de Usuários & Aprovações</h2>
          <p>Libere ou bloqueie contas corporativas de acordo com as diretrizes da comunidade.</p>
        </div>
      </div>

      <div style="background: var(--surface); border: 1px solid var(--border-line); border-radius: var(--radius-card); overflow: hidden; box-shadow: var(--shadow-card);">
        <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.92rem;">
          <thead>
            <tr style="background: var(--surface-2); border-bottom: 1px solid var(--border-line); color: var(--text-muted);">
              <th style="padding: 14px 18px;">Usuário / Nome</th>
              <th style="padding: 14px 18px;">E-mail</th>
              <th style="padding: 14px 18px;">Papel</th>
              <th style="padding: 14px 18px;">Status</th>
              <th style="padding: 14px 18px; text-align: right;">Ações</th>
            </tr>
          </thead>
          <tbody>
            ${profiles.map(p => `
              <tr style="border-bottom: 1px solid var(--border-line);">
                <td style="padding: 14px 18px; font-weight: 700; color: var(--text-main);">${p.full_name}</td>
                <td style="padding: 14px 18px; color: var(--text-muted);">${p.email}</td>
                <td style="padding: 14px 18px;">
                  <span style="background: var(--surface-2); padding: 4px 8px; border-radius: 6px; font-size: 0.82rem; font-weight: 600;">${p.role.toUpperCase()}</span>
                </td>
                <td style="padding: 14px 18px;">
                  ${this.renderTrafficLight(p.status === 'approved' ? 'green' : (p.status === 'blocked' ? 'red' : 'yellow'), p.status.toUpperCase())}
                </td>
                <td style="padding: 14px 18px; text-align: right;">
                  ${p.status !== 'approved' ? `<button class="btn-primary" style="font-size: 0.8rem; padding: 6px 12px; min-height: 32px;" onclick="window.appController.handleSetProfileStatus('${p.id}', 'approved')">Aprovar</button>` : ''}
                  ${p.status !== 'blocked' ? `<button class="btn-secondary" style="font-size: 0.8rem; padding: 6px 12px; min-height: 32px; color: var(--signal-red);" onclick="window.appController.handleSetProfileStatus('${p.id}', 'blocked')">Bloquear</button>` : ''}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  handleSetProfileStatus(profileId, status) {
    StorageService.updateProfileStatus(profileId, status);
    this.showToast(`Status do usuário alterado para ${status}!`, "success");
    this.checkPendingApprovals();
    this.renderAdminUsuarios(document.getElementById('viewContainer'));
    this.renderIcons();
  }

  renderAdminAtividade(container) {
    const activity = StorageService.getActivityLogs();

    container.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 12px;">
        <div>
          <h2 style="font-size: 1.8rem; margin-bottom: 6px;">Trilha de Auditoria de Atividades</h2>
          <p>Histórico inalterável de todas as ações registradas no sistema.</p>
        </div>
        <button class="btn-secondary" onclick="window.appController.exportActivityCsv()"><i data-lucide="download"></i> Exportar CSV</button>
      </div>

      <div style="background: var(--surface); border: 1px solid var(--border-line); border-radius: var(--radius-card); padding: 16px; box-shadow: var(--shadow-card);">
        <div style="display: flex; flex-direction: column; gap: 8px;">
          ${activity.slice(0, 50).map(a => `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; background: var(--surface-2); border-radius: 8px; font-size: 0.88rem;">
              <div>
                <strong style="color: var(--blue-royal);">${a.type.toUpperCase()}:</strong> ${a.description}
                <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 2px;">Por: ${a.user_name} (${a.user_role})</div>
              </div>
              <div class="mono-value" style="font-size: 0.78rem; color: var(--text-muted);">${new Date(a.at).toLocaleString('pt-BR')}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  exportActivityCsv() {
    AdminService.exportActivityLogsCsv();
    this.showToast("Trilha de auditoria exportada em CSV com sucesso!", "success");
  }

  renderAdminBuscas(container) {
    const searchLogs = StorageService.getSearchLogs();

    container.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 12px;">
        <div>
          <h2 style="font-size: 1.8rem; margin-bottom: 6px;">Auditoria de Buscas de Talentos</h2>
          <p>Registro rigoroso das palavras-chave pesquisadas e do motivo corporativo declarado pelas empresas.</p>
        </div>
        <button class="btn-secondary" onclick="window.appController.exportSearchesCsv()"><i data-lucide="download"></i> Exportar CSV</button>
      </div>

      <div style="background: var(--surface); border: 1px solid var(--border-line); border-radius: var(--radius-card); padding: 16px; box-shadow: var(--shadow-card);">
        <div style="display: flex; flex-direction: column; gap: 10px;">
          ${searchLogs.map(l => `
            <div style="background: var(--surface-2); border: 1px solid var(--border-line); border-radius: 10px; padding: 14px 18px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                <span style="font-weight: 700; color: var(--text-main); font-size: 0.95rem;">"${l.query}"</span>
                <span class="mono-value" style="font-size: 0.8rem; color: var(--text-muted);">${new Date(l.at).toLocaleString('pt-BR')}</span>
              </div>
              <div style="font-size: 0.88rem; color: var(--text-muted);">
                <strong>Motivo Declarado:</strong> "${l.reason}" • <strong>Resultados:</strong> ${l.results_count} perfis encontrados
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  exportSearchesCsv() {
    AdminService.exportSearchLogsCsv();
    this.showToast("Logs de busca exportados em CSV com sucesso!", "success");
  }

  renderAdminConfig(container) {
    const settings = StorageService.getSettings();
    const branding = StorageService.getBranding();

    container.innerHTML = `
      <div style="background: var(--surface); border: 1px solid var(--border-line); border-radius: var(--radius-banner); padding: 32px; box-shadow: var(--shadow-card); max-width: 780px; margin: 0 auto;">
        <h2 style="font-size: 1.8rem; margin-bottom: 8px;">Configurações Globais & Identidade Visual</h2>
        <p style="margin-bottom: 24px;">Controles administrativos de permissões e personalização da marca.</p>

        <h3 style="font-size: 1.15rem; margin-bottom: 14px;">Permissões do Sistema (app_settings)</h3>
        <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 32px;">
          
          <label style="display: flex; justify-content: space-between; align-items: center; background: var(--surface-2); padding: 14px 18px; border-radius: 10px; cursor: pointer;">
            <div>
              <strong>Aprovar candidatos automaticamente</strong>
              <div style="font-size: 0.82rem; color: var(--text-muted);">Profissionais são liberados logo após o cadastro.</div>
            </div>
            <input type="checkbox" id="setCandidateAutoApprove" ${settings.auto_approve_candidates ? 'checked' : ''} style="width: 20px; height: 20px;">
          </label>

          <label style="display: flex; justify-content: space-between; align-items: center; background: var(--surface-2); padding: 14px 18px; border-radius: 10px; cursor: pointer;">
            <div>
              <strong>Aprovar empresas e RH automaticamente</strong>
              <div style="font-size: 0.82rem; color: var(--text-muted);">Por padrão mantido desligado para triagem de idoneidade.</div>
            </div>
            <input type="checkbox" id="setRecruiterAutoApprove" ${settings.auto_approve_recruiters ? 'checked' : ''} style="width: 20px; height: 20px;">
          </label>

          <label style="display: flex; justify-content: space-between; align-items: center; background: var(--surface-2); padding: 14px 18px; border-radius: 10px; cursor: pointer;">
            <div>
              <strong>Recrutadores aprovados visualizam telefone e e-mail</strong>
              <div style="font-size: 0.82rem; color: var(--text-muted);">Permite contato direto com os profissionais nas buscas.</div>
            </div>
            <input type="checkbox" id="setRecruiterSeeContact" ${settings.recruiters_see_contact ? 'checked' : ''} style="width: 20px; height: 20px;">
          </label>

        </div>

        <h3 style="font-size: 1.15rem; margin-bottom: 14px;">Identidade Visual & Marca</h3>
        <div class="form-group">
          <label class="form-label">Título da Plataforma</label>
          <input type="text" id="brandTitleInput" class="form-control" value="${branding.appTitle}">
        </div>
        <div class="form-group">
          <label class="form-label">Subtítulo / Slogan</label>
          <input type="text" id="brandSubtitleInput" class="form-control" value="${branding.brandSubtitle}">
        </div>

        <div style="text-align: right; margin-top: 24px;">
          <button class="btn-primary" id="btnSaveConfig"><i data-lucide="check"></i> Salvar Alterações</button>
        </div>
      </div>
    `;

    document.getElementById('btnSaveConfig').addEventListener('click', () => {
      StorageService.updateSettings({
        auto_approve_candidates: document.getElementById('setCandidateAutoApprove').checked,
        auto_approve_recruiters: document.getElementById('setRecruiterAutoApprove').checked,
        recruiters_see_contact: document.getElementById('setRecruiterSeeContact').checked
      });

      StorageService.saveBranding({
        appTitle: document.getElementById('brandTitleInput').value,
        brandSubtitle: document.getElementById('brandSubtitleInput').value
      });

      this.showToast("Configurações atualizadas com sucesso!", "success");
    });
  }

  // ==============================================
  // VISÃO COMPARTILHADA: VITRINE DE ESPECIALISTAS
  // ==============================================

  renderVitrine(container) {
    const experts = StorageService.getExperts();

    container.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 12px;">
        <div>
          <h2 style="font-size: 1.8rem; margin-bottom: 6px;">Vitrine de Especialistas</h2>
          <p>Conheça mentores, consultores, palestrantes e profissionais seniores da nossa comunidade.</p>
        </div>
        <button class="btn-primary" onclick="window.appController.openNewExpertModal()"><i data-lucide="user-plus"></i> Apresente seu Trabalho</button>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 24px;">
        ${experts.map(e => {
          const avatarUrl = e.avatar || (e.id === 'exp_1' ? 'assets/avatar-edvania.jpg' : 'assets/avatar-carlos.jpg');

          return `
            <div class="future-glass-card" style="padding: 26px; display: flex; flex-direction: column; justify-content: space-between;">
              <div>
                <div style="display: flex; gap: 16px; align-items: flex-start; margin-bottom: 14px;">
                  <img src="${avatarUrl}" alt="${e.name}" style="width: 72px; height: 72px; border-radius: 20px; object-fit: cover; border: 3px solid #ffffff; box-shadow: 0 8px 24px rgba(37, 99, 235, 0.15); flex-shrink: 0;">
                  <div style="flex: 1; min-width: 0;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                      <h3 style="font-size: 1.25rem; margin-bottom: 2px;">${e.name}</h3>
                      <div class="brand-icon-box" style="width: 32px; height: 32px; font-size: 0.85rem;"><i data-lucide="award"></i></div>
                    </div>
                    <div style="font-size: 0.86rem; color: #2563eb; font-weight: 600; line-height: 1.4;">${e.title}</div>
                  </div>
                </div>

                <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 14px;">
                  ${(e.formats || []).map(f => `<span style="background: #f5f3ff; color: #7c3aed; border: 1px solid #ddd6fe; font-size: 0.78rem; font-weight: 700; padding: 3px 10px; border-radius: 9999px;">${f}</span>`).join('')}
                </div>

                <p style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 12px; line-height: 1.5;">${e.about}</p>
                
                <div style="font-size: 0.85rem; color: var(--text-main); margin-bottom: 16px; background: #f8fafc; border: 1px solid #e2e8f0; padding: 10px 14px; border-radius: 12px;">
                  <strong style="color: #1e3a8a;">Serviços & Atuação:</strong> ${e.services}
                </div>
              </div>

              <div style="border-top: 1px solid #e2e8f0; padding-top: 14px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                <span style="font-size: 0.82rem; color: var(--text-muted);">📍 ${e.city || 'Brasil'}</span>
                <div style="display: flex; gap: 8px;">
                  ${e.email ? `<a href="mailto:${e.email}" class="btn-secondary" style="padding: 6px 12px; font-size: 0.8rem;"><i data-lucide="mail"></i> Contato</a>` : ''}
                  ${e.linkedin ? `<a href="${e.linkedin}" target="_blank" rel="noopener noreferrer" class="btn-secondary" style="padding: 6px 12px; font-size: 0.8rem;"><i data-lucide="external-link"></i> LinkedIn</a>` : ''}
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  // ==============================================
  // AÇÕES DE MODAIS & FORMULÁRIOS
  // ==============================================

  openPrivacyModal() {
    document.getElementById('modalPrivacy').classList.add('show');
  }

  openDiscScienceModal() {
    const data = DiscEngine.getScientificBackground();
    const body = document.getElementById('discScienceBody');
    body.innerHTML = data.sections.map(s => `
      <div>
        <h4 style="font-size: 1rem; color: var(--text-main); margin-bottom: 4px;">${s.heading}</h4>
        <p style="font-size: 0.9rem; color: var(--text-muted); margin: 0;">${s.body}</p>
      </div>
    `).join('');
    document.getElementById('modalDiscScience').classList.add('show');
    this.renderIcons();
  }

  openScheduleModal(candidateId, candidateName, vacancyId = null) {
    document.getElementById('schCandidateId').value = candidateId;
    document.getElementById('schCandidateName').value = candidateName;
    document.getElementById('schVacancyId').value = vacancyId || 'vac_1';

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(14, 0, 0, 0);
    const dateInputStr = tomorrow.toISOString().slice(0, 16);
    document.getElementById('schDateTime').value = dateInputStr;

    document.getElementById('scheduleFormSection').style.display = 'block';
    document.getElementById('invitationReadySection').style.display = 'none';
    document.getElementById('modalScheduleInterview').classList.add('show');
    this.renderIcons();
  }

  handleScheduleSubmit() {
    const candId = document.getElementById('schCandidateId').value;
    const candName = document.getElementById('schCandidateName').value;
    const vacId = document.getElementById('schVacancyId').value || 'vac_1';
    const vac = StorageService.getVacancyById(vacId) || { title: 'Oportunidade Profissional', company: 'Empresa Contratante' };

    const interviewData = {
      recruiter_id: this.currentUser?.id || 'recruiter_1',
      candidate_id: candId,
      candidate_name: candName,
      vacancy_id: vacId,
      vacancy_title: vac.title,
      company: vac.company,
      stage: document.getElementById('schStageSelect').value,
      scheduled_at: document.getElementById('schDateTime').value,
      duration_min: parseInt(document.getElementById('schDuration').value, 10),
      mode: document.getElementById('schModeSelect').value,
      location: document.getElementById('schLocation').value,
      notes: document.getElementById('schNotes').value,
      status: 'agendada'
    };

    const saved = StorageService.saveInterview(interviewData);
    const inviteText = ProcessService.formatInvitationText(saved);

    document.getElementById('scheduleFormSection').style.display = 'none';
    document.getElementById('invitationReadySection').style.display = 'block';
    document.getElementById('invitationTextOutput').value = inviteText;

    document.getElementById('btnCopyInviteText').onclick = () => {
      navigator.clipboard.writeText(inviteText);
      this.showToast("Texto do convite copiado para a área de transferência!", "success");
    };

    document.getElementById('btnInviteWhatsApp').href = `https://wa.me/?text=${encodeURIComponent(inviteText)}`;
    document.getElementById('btnInviteEmail').href = `mailto:?subject=${encodeURIComponent(`Convite: ${saved.vacancy_title}`)}&body=${encodeURIComponent(inviteText)}`;
    document.getElementById('btnInviteGoogleCal').href = ProcessService.generateGoogleCalendarUrl(saved);
    document.getElementById('btnInviteDownloadIcs').onclick = () => {
      ProcessService.downloadIcsFile(saved);
    };

    this.renderIcons();
  }

  openDossierModal(candidateId, vacancyId = null) {
    const candidate = StorageService.getCandidateById(candidateId);
    if (!candidate) return;

    const vac = vacancyId ? StorageService.getVacancyById(vacancyId) : StorageService.getVacancies()[0];
    const interview = ProcessService.getInterviews().find(i => i.candidate_id === candidateId);

    const dossierHtml = ProcessService.generateDossierHtml(candidate, interview, vac);
    
    // Tratamento seguro contra bloqueadores de pop-up
    try {
      const win = window.open("", "_blank");
      if (win) {
        win.document.write(dossierHtml);
        win.document.close();
        this.showToast("Dossiê gerado com sucesso em nova janela!", "success");
      } else {
        this.downloadDossierHtml(candidate, dossierHtml);
      }
    } catch {
      this.downloadDossierHtml(candidate, dossierHtml);
    }
  }

  downloadDossierHtml(candidate, htmlContent) {
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `dossie-${(candidate.full_name || 'candidato').toLowerCase().replace(/\s+/g, '-')}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    this.showToast("Dossiê baixado como arquivo HTML corporativo com sucesso!", "success");
  }

  openNewVacancyModal() {
    document.getElementById('modalNewVacancy').classList.add('show');
  }

  handleNewVacancySubmit() {
    const title = document.getElementById('vacTitle').value;
    const company = document.getElementById('vacCompany').value;
    const mode = document.getElementById('vacMode').value;
    const city = document.getElementById('vacCity').value;
    const uf = document.getElementById('vacUf').value;
    const rawReqs = document.getElementById('vacRequirements').value;
    const desc = document.getElementById('vacDescription').value;
    const dPrimary = document.getElementById('vacDiscPrimary').value;
    const dSecondary = document.getElementById('vacDiscSecondary').value;

    const reqs = rawReqs.split(',').map(r => r.trim()).filter(Boolean);

    StorageService.saveVacancy({
      title: title,
      company: company,
      work_mode: mode,
      city: city,
      uf: uf,
      requirements: reqs,
      description: desc,
      disc_ideal: {
        primary: dPrimary || null,
        secondary: dSecondary || null
      }
    });

    document.getElementById('modalNewVacancy').classList.remove('show');
    this.showToast("Nova vaga publicada com sucesso na comunidade!", "success");
    if (this.currentTab === 'rec_vagas') {
      this.renderRecruiterVacancies(document.getElementById('viewContainer'));
      this.renderIcons();
    }
  }

  openNewExpertModal() {
    document.getElementById('modalNewExpert').classList.add('show');
  }

  handleNewExpertSubmit() {
    const name = document.getElementById('expName').value;
    const title = document.getElementById('expTitle').value;
    const services = document.getElementById('expServices').value;
    const about = document.getElementById('expAbout').value;
    const email = document.getElementById('expEmail').value;
    const linkedin = document.getElementById('expLinkedin').value;

    const checkedFormats = Array.from(document.querySelectorAll('input[name="expFormat"]:checked')).map(cb => cb.value);

    StorageService.saveExpert({
      name: name,
      title: title,
      formats: checkedFormats.length > 0 ? checkedFormats : ["Consultoria"],
      services: services,
      about: about,
      email: email,
      linkedin: linkedin
    });

    document.getElementById('modalNewExpert').classList.remove('show');
    this.showToast("Seu trabalho foi cadastrado na vitrine com sucesso!", "success");
    if (this.currentTab === 'vitrine') {
      this.renderVitrine(document.getElementById('viewContainer'));
      this.renderIcons();
    }
  }
}

// Inicialização Global
window.addEventListener('DOMContentLoaded', () => {
  window.appController = new AppController();
});
