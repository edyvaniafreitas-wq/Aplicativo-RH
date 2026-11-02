/**
 * MONTE SUA EQUIPE — Gestão de Processos Seletivos, Kanban, Agendamentos & Dossiê
 * Automação de convites, exportação para Google Agenda, arquivos .ics e Dossiê LGPD
 */

import { StorageService } from '../data/storage.js';
import { MatchingEngine } from './matching-engine.js';

export const PIPELINE_STAGES = [
  { id: 'triagem', name: 'Triagem Inicial', desc: 'Análise de currículo, critérios técnicos essenciais e contato preliminar.' },
  { id: 'rh', name: 'Entrevista com RH', desc: 'Apresentação da empresa, alinhamento cultural, pretensão salarial e disponibilidade.' },
  { id: 'teste', name: 'Teste Técnico / Estudo de Caso', desc: 'Avaliação prática dos conhecimentos e ferramentas exigidas para a função.' },
  { id: 'gestor', name: 'Entrevista com a Liderança', desc: 'Diálogo direto com o gestor imediato sobre desafios, rotina e entregas da área.' },
  { id: 'dinamica', name: 'Dinâmica de Grupo', desc: 'Atividade colaborativa para observar comunicação, escuta e resolução de problemas.' },
  { id: 'final', name: 'Entrevista Final', desc: 'Alinhamento estratégico com a diretoria, sócios ou comitê executivo.' },
  { id: 'proposta', name: 'Proposta & Alinhamento', desc: 'Apresentação formal de proposta, pacote de benefícios e definição da data de início.' }
];

export class ProcessService {
  static getStages() {
    return PIPELINE_STAGES;
  }

  static getInterviews() {
    return StorageService.getInterviews();
  }

  /**
   * Conclui a etapa atual e avança para a próxima
   */
  static advanceStage(interviewId) {
    const list = StorageService.getInterviews();
    const item = list.find(i => i.id === interviewId);
    if (!item) return null;

    const currentIdx = PIPELINE_STAGES.findIndex(s => s.id === item.stage);
    if (currentIdx < PIPELINE_STAGES.length - 1) {
      item.stage = PIPELINE_STAGES[currentIdx + 1].id;
      item.status = 'agendada';
      item.updated_at = new Date().toISOString();
      StorageService.saveInterview(item);
      StorageService.logActivity('agendou', `Processo de ${item.candidate_name} avançou para ${PIPELINE_STAGES[currentIdx + 1].name}`);
      return item;
    }
    return item;
  }

  static updateStatus(interviewId, newStatus, note = "") {
    const list = StorageService.getInterviews();
    const item = list.find(i => i.id === interviewId);
    if (!item) return null;

    item.status = newStatus;
    if (note) item.candidate_note = note;
    item.updated_at = new Date().toISOString();
    StorageService.saveInterview(item);
    StorageService.logActivity('respondeu', `Status da entrevista de ${item.candidate_name} alterado para ${newStatus}`);
    return item;
  }

  /**
   * Monta o texto oficial do convite
   */
  static formatInvitationText(interview) {
    const dateFormatted = interview.scheduled_at 
      ? new Date(interview.scheduled_at).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
      : "A combinar";

    const stageObj = PIPELINE_STAGES.find(s => s.id === interview.stage) || { name: "Entrevista", desc: "Conversa de alinhamento" };

    return `Olá, ${interview.candidate_name}!\n\n` +
      `Temos uma ótima notícia sobre a oportunidade de ${interview.vacancy_title} na ${interview.company}.\n\n` +
      `Gostaríamos de convidá-lo(a) para a etapa: ${stageObj.name}.\n` +
      `📅 Data e horário: ${dateFormatted}\n` +
      `⏱️ Duração prevista: ${interview.duration_min || 45} minutos\n` +
      `📍 Formato e Local: ${interview.mode || 'Online'} — ${interview.location || 'Link a ser enviado'}\n\n` +
      `O que acontecerá nesta conversa:\n${interview.notes || stageObj.desc}\n\n` +
      `Por favor, acesse o aplicativo Monte Sua Equipe para confirmar sua presença ou solicitar ajuste de horário:\n` +
      `https://montesuaequipe.com.br/convites\n\n` +
      `Estamos ansiosos para conversar com você!\n` +
      `Equipe ${interview.company}`;
  }

  /**
   * Link para adicionar evento diretamente no Google Agenda
   */
  static generateGoogleCalendarUrl(interview) {
    const title = encodeURIComponent(`Entrevista: ${interview.vacancy_title} (${interview.company})`);
    const details = encodeURIComponent(this.formatInvitationText(interview));
    const location = encodeURIComponent(interview.location || interview.mode || "Online");

    const start = interview.scheduled_at ? new Date(interview.scheduled_at) : new Date();
    const end = new Date(start.getTime() + (interview.duration_min || 45) * 60000);

    const formatGDate = (d) => d.toISOString().replace(/-|:|\.\d\d\d/g, "");
    const dates = `${formatGDate(start)}/${formatGDate(end)}`;

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}`;
  }

  /**
   * Gera e baixa arquivo de calendário padrão universal (.ics) com alarme de 1 hora
   */
  static downloadIcsFile(interview) {
    const start = interview.scheduled_at ? new Date(interview.scheduled_at) : new Date();
    const end = new Date(start.getTime() + (interview.duration_min || 45) * 60000);

    const formatIcsDate = (d) => d.toISOString().replace(/-|:|\.\d\d\d/g, "");

    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Monte Sua Equipe//Entrevistas Corporativas//PT-BR",
      "CALSCALE:GREGORIAN",
      "METHOD:REQUEST",
      "BEGIN:VEVENT",
      `UID:entrevista-${interview.id}@montesuaequipe.com.br`,
      `DTSTAMP:${formatIcsDate(new Date())}`,
      `DTSTART:${formatIcsDate(start)}`,
      `DTEND:${formatIcsDate(end)}`,
      `SUMMARY:Entrevista: ${interview.vacancy_title} - ${interview.company}`,
      `DESCRIPTION:${this.formatInvitationText(interview).replace(/\n/g, '\\n')}`,
      `LOCATION:${interview.location || interview.mode || 'Online'}`,
      "STATUS:CONFIRMED",
      "BEGIN:VALARM",
      "TRIGGER:-PT60M",
      "ACTION:DISPLAY",
      "DESCRIPTION:Lembrete: Entrevista em 1 hora",
      "END:VALARM",
      "END:VEVENT",
      "END:VCALENDAR"
    ].join("\r\n");

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `convite-entrevista-${interview.candidate_name.toLowerCase().replace(/\s+/g, '-')}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Geração do Dossiê C-Level Oficial do Candidato para Download / Impressão
   */
  static generateDossierHtml(candidate, interview, vacancy = null) {
    const evalData = vacancy ? MatchingEngine.evaluateCandidateForVacancy(candidate, vacancy) : null;
    const stageObj = PIPELINE_STAGES.find(s => s.id === interview?.stage) || { name: "Em Avaliação", desc: "" };

    const printDate = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Dossiê Executivo de Candidatura • ${candidate.full_name}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@700;800&family=Source+Sans+3:wght@400;600;700&family=IBM+Plex+Mono:wght@400;600&display=swap');
    body { font-family: 'Source Sans 3', sans-serif; color: #203458; margin: 0; padding: 40px; background: #fff; line-height: 1.5; }
    .dossier-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #2459CF; padding-bottom: 16px; margin-bottom: 24px; }
    .brand-title { font-family: 'Bricolage Grotesque', sans-serif; font-size: 24px; color: #2459CF; font-weight: 800; letter-spacing: -0.5px; }
    .badge-confidential { background: #fff0f3; color: #af3557; border: 1px solid #f27687; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 700; text-transform: uppercase; }
    .candidate-card { background: #f7faff; border: 1px solid #dfe7f4; border-radius: 12px; padding: 20px; margin-bottom: 24px; }
    .candidate-name { font-size: 22px; font-weight: 700; margin: 0 0 4px 0; color: #203458; }
    .candidate-title { font-size: 15px; color: #536581; margin: 0 0 12px 0; }
    .score-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
    .score-box { border: 1px solid #dfe7f4; border-radius: 10px; padding: 16px; background: #fff; text-align: center; }
    .score-value { font-family: 'IBM Plex Mono', monospace; font-size: 32px; font-weight: 700; margin: 8px 0; }
    .score-green { color: #0ca30c; }
    .score-yellow { color: #fab219; }
    .section-title { font-family: 'Bricolage Grotesque', sans-serif; font-size: 16px; font-weight: 700; color: #2459CF; border-bottom: 1px solid #dfe7f4; padding-bottom: 6px; margin: 24px 0 12px 0; }
    .skills-chips { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
    .skill-chip { background: #edf3ff; color: #2459CF; border: 1px solid #dfe7f4; border-radius: 20px; padding: 4px 10px; font-size: 13px; font-weight: 600; }
    .interview-q { background: #fdfdfd; border-left: 3px solid #7045af; padding: 10px 14px; margin-bottom: 10px; border-radius: 0 8px 8px 0; }
    .footer-lgpd { margin-top: 40px; padding-top: 16px; border-top: 1px solid #dfe7f4; font-size: 11px; color: #536581; text-align: center; }
    @media print { body { padding: 0; } .no-print { display: none; } }
  </style>
</head>
<body>
  <div class="dossier-header">
    <div>
      <div class="brand-title">Monte Sua Equipe • Dossiê do Talento</div>
      <div style="font-size: 13px; color: #536581;">Plataforma Executiva de Conexão Profissional • Idealizado por Edvania Freitas</div>
    </div>
    <div class="badge-confidential">Uso Corporativo Confidencial (LGPD)</div>
  </div>

  <div class="candidate-card">
    <h1 class="candidate-name">${candidate.full_name}</h1>
    <p class="candidate-title">${candidate.headline || 'Profissional Cadastrado'}</p>
    <div style="font-size: 14px; color: #536581; display: flex; gap: 20px; flex-wrap: wrap;">
      <span>📍 ${candidate.city || 'Cidade não informada'} - ${candidate.uf || 'UF'}</span>
      <span>💼 Modalidade: ${candidate.work_mode || 'Presencial/Remoto'}</span>
      <span>🎓 Formação: ${candidate.education || 'Superior'}</span>
      <span>📧 ${candidate.email || 'Não informado'}</span>
      <span>📱 ${candidate.phone || 'Não informado'}</span>
    </div>
  </div>

  ${evalData ? `
  <div class="score-grid">
    <div class="score-box">
      <div style="font-size: 12px; font-weight: 700; color: #536581; text-transform: uppercase;">Compatibilidade Técnica</div>
      <div class="score-value ${evalData.technical.score >= 80 ? 'score-green' : 'score-yellow'}">${evalData.technical.score}%</div>
      <div style="font-size: 13px; color: #536581;">${evalData.technical.label}</div>
    </div>
    <div class="score-box">
      <div style="font-size: 12px; font-weight: 700; color: #536581; text-transform: uppercase;">Aderência Comportamental (DISC)</div>
      <div class="score-value ${evalData.behavioral.adherence >= 75 ? 'score-green' : 'score-yellow'}">${evalData.behavioral.adherence ? evalData.behavioral.adherence + '%' : 'N/A'}</div>
      <div style="font-size: 13px; color: #536581;">${evalData.behavioral.label}</div>
    </div>
  </div>` : ''}

  <div class="section-title">Resumo Profissional & Conquistas</div>
  <p style="font-size: 14px; color: #203458; margin: 0 0 16px 0;">${candidate.summary || 'Não informado.'}</p>

  <div class="section-title">Competências Técnicas Mapeadas</div>
  <div class="skills-chips">
    ${(candidate.skills || []).map(s => `<span class="skill-chip">${s}</span>`).join('')}
  </div>

  <div class="section-title">Trajetória e Experiência Relevante</div>
  <p style="font-size: 14px; color: #203458; white-space: pre-line;">${candidate.experience || 'Histórico profissional sob consulta.'}</p>

  ${candidate.disc ? `
  <div class="section-title">Estilo Comportamental Observado (DISC)</div>
  <div style="display: flex; gap: 12px; margin-bottom: 8px;">
    <span class="skill-chip" style="background: #fff0f3; color: #e11d48;">D: ${candidate.disc.relative?.D || 25}%</span>
    <span class="skill-chip" style="background: #fef3c7; color: #d97706;">I: ${candidate.disc.relative?.I || 25}%</span>
    <span class="skill-chip" style="background: #ecfdf5; color: #059669;">S: ${candidate.disc.relative?.S || 25}%</span>
    <span class="skill-chip" style="background: #eff6ff; color: #2563eb;">C: ${candidate.disc.relative?.C || 25}%</span>
  </div>
  <p style="font-size: 12px; color: #536581; font-style: italic;">Nota técnica: O mapeamento comportamental reflete tendências e estilos de trabalho, não constituindo teste psicológico clínico nem previsão determinista de performance.</p>
  ` : ''}

  ${evalData && evalData.interviewQuestions ? `
  <div class="section-title">Roteiro Recomendado para Entrevista Estruturada</div>
  <p style="font-size: 12px; color: #536581; margin-bottom: 12px;">${evalData.interviewQuestions.guidance}</p>
  ${evalData.interviewQuestions.list.map((q, idx) => `
    <div class="interview-q">
      <div style="font-size: 12px; font-weight: 700; color: #7045af;">Pergunta ${idx + 1} • ${q.topic}</div>
      <div style="font-size: 14px; margin-top: 4px;">"${q.question}"</div>
      <div style="font-size: 11px; color: #536581; margin-top: 6px;">Avaliação: [ ] 1  [ ] 2  [ ] 3  [ ] 4  [ ] 5 — Evidências observadas: _____________________________________</div>
    </div>
  `).join('')}
  ` : ''}

  <div class="footer-lgpd">
    Documento emitido em ${printDate} pela plataforma Monte Sua Equipe • Em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018) • Proibida reprodução externa ou compartilhamento sem consentimento do titular.
  </div>
</body>
</html>`;
  }
}
