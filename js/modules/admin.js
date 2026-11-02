/**
 * MONTE SUA EQUIPE — Cockpit da Administradora (Auditoria, Métricas & Gestão de Acessos)
 * Painéis executivos com gráficos acessíveis, auditoria completa e exportações em CSV
 */

import { StorageService } from '../data/storage.js';

export class AdminService {
  static getMetrics() {
    const profiles = StorageService.getProfiles();
    const candidates = StorageService.getCandidates();
    const vacancies = StorageService.getVacancies();
    const interviews = StorageService.getInterviews();
    const applications = StorageService.getApplications();
    const searchLogs = StorageService.getSearchLogs();
    const activity = StorageService.getActivityLogs();

    const totalUsers = profiles.length;
    const totalCandidates = candidates.length;
    const totalRecruiters = profiles.filter(p => p.role === 'recruiter').length;
    const totalSearches = searchLogs.length;

    // Conexões: entrevistas + candidaturas
    const totalConnections = interviews.length + applications.length;

    // Usuários com dados salvos
    const candidatesWithCvOrDisc = candidates.filter(c => c.cvScore || c.disc).length;
    const savedPercentage = totalUsers > 0 ? Math.round((candidatesWithCvOrDisc / totalUsers) * 100) : 0;

    let savedLight = "red";
    if (savedPercentage >= 50) savedLight = "green";
    else if (savedPercentage >= 25) savedLight = "yellow";

    // Contas pendentes de aprovação
    const pendingProfiles = profiles.filter(p => p.status === 'pending');

    return {
      totalUsers: totalUsers,
      totalCandidates: totalCandidates,
      totalRecruiters: totalRecruiters,
      totalVacancies: vacancies.length,
      totalInterviews: interviews.length,
      totalSearches: totalSearches,
      totalConnections: totalConnections,
      savedPercentage: savedPercentage,
      savedLight: savedLight,
      pendingCount: pendingProfiles.length,
      pendingProfiles: pendingProfiles
    };
  }

  static getAdminStats() {
    return this.getMetrics();
  }

  /**
   * Exporta array de objetos para arquivo CSV formatado em UTF-8 com BOM
   */
  static exportToCsv(filename, rows) {
    if (!rows || !rows.length) {
      alert("Nenhum dado disponível para exportação.");
      return;
    }

    const separator = ";";
    const keys = Object.keys(rows[0]);
    const csvContent = [
      keys.join(separator),
      ...rows.map(row => keys.map(k => {
        let val = row[k] === null || row[k] === undefined ? "" : String(row[k]);
        // Escapa aspas
        val = val.replace(/"/g, '""');
        if (val.search(/("|,|;|\n)/g) >= 0) {
          val = `"${val}"`;
        }
        return val;
      }).join(separator))
    ].join("\r\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Exportação dos Logs de Busca de Talentos em CSV
   */
  static exportSearchLogsCsv() {
    const logs = StorageService.getSearchLogs();
    const rows = logs.map(l => ({
      Data: new Date(l.at).toLocaleString('pt-BR'),
      Recrutador: l.recruiter_id,
      Pedido_Buscado: l.query,
      Motivo_Declarado: l.reason,
      Resultados_Encontrados: l.results_count
    }));
    this.exportToCsv(`auditoria-buscas-talentos-${Date.now()}.csv`, rows);
  }

  /**
   * Exportação dos Logs de Atividades do Sistema em CSV
   */
  static exportActivityLogsCsv() {
    const logs = StorageService.getActivityLogs();
    const rows = logs.map(a => ({
      Data: new Date(a.at).toLocaleString('pt-BR'),
      Tipo_Acao: a.type,
      Descricao: a.description,
      Usuario: a.user_name,
      Papel: a.user_role,
      Email: a.user_email
    }));
    this.exportToCsv(`trilha-auditoria-atividades-${Date.now()}.csv`, rows);
  }
}
