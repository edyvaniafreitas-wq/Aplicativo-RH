/**
 * MONTE SUA EQUIPE — Módulo Quântico: Simulador de Squads 360° & Visualizador Neural
 * Conexão de Alta Performance Idealizada por Edvania Freitas (@ampliaperformance)
 * 100% Client-Side, Sem Custos de APIs, Algoritmos Determinísticos
 */

export class QuantumSquadEngine {
  /**
   * Calcula a sinergia multidisciplinar de um Squad (3 a 5 membros)
   * Baseado na complementaridade de perfis DISC e cobertura de competências
   */
  static calculateSquadMetrics(members, allCandidates) {
    if (!members || members.length === 0) {
      return {
        synergyScore: 0,
        discBalance: { D: 0, I: 0, S: 0, C: 0 },
        strengths: ["Squad vazio"],
        blindspots: ["Adicione membros para avaliar a sinergia"],
        archetype: "Em Formação",
        skillsCoverage: []
      };
    }

    const squadCandidates = members.map(m => {
      const cand = allCandidates.find(c => c.id === (m.candidate_id || m.id));
      return {
        cand: cand || null,
        role: m.role || "Especialista"
      };
    }).filter(x => x.cand !== null);

    if (squadCandidates.length === 0) {
      return {
        synergyScore: 0,
        discBalance: { D: 0, I: 0, S: 0, C: 0 },
        strengths: ["Selecione talentos ativos"],
        blindspots: ["Nenhum membro ativo localizado"],
        archetype: "Em Formação",
        skillsCoverage: []
      };
    }

    // 1. Balanço DISC
    const discSum = { D: 0, I: 0, S: 0, C: 0 };
    let totalScoreSum = 0;
    const allSkills = new Set();
    const allTraits = new Set();

    squadCandidates.forEach(({ cand }) => {
      totalScoreSum += (cand.cvScore || 85);
      (cand.skills || []).forEach(s => allSkills.add(s));
      (cand.traits || []).forEach(t => allTraits.add(t));

      const discRel = (cand.disc && cand.disc.relative) || { D: 25, I: 25, S: 25, C: 25 };
      discSum.D += discRel.D || 25;
      discSum.I += discRel.I || 25;
      discSum.S += discRel.S || 25;
      discSum.C += discRel.C || 25;
    });

    const count = squadCandidates.length;
    const discBalance = {
      D: Math.round(discSum.D / count),
      I: Math.round(discSum.I / count),
      S: Math.round(discSum.S / count),
      C: Math.round(discSum.C / count)
    };

    // 2. Cálculo do Índice de Complementaridade (Diversidade Funcional)
    // Se todos os 4 fatores DISC tiverem presença representativa (>= 15% cada), a sinergia sobe
    let diversityBonus = 0;
    if (discBalance.D >= 15) diversityBonus += 8;
    if (discBalance.I >= 15) diversityBonus += 8;
    if (discBalance.S >= 15) diversityBonus += 8;
    if (discBalance.C >= 15) diversityBonus += 8;

    // Se o time tiver mais de 8 competências complementares únicas
    const skillsBonus = Math.min(15, allSkills.size * 1.5);

    // Média de pontuação dos currículos
    const avgScore = totalScoreSum / count;

    // Sinergia final 0-100%
    let rawSynergy = Math.round((avgScore * 0.55) + diversityBonus + skillsBonus);
    const synergyScore = Math.min(99, Math.max(45, rawSynergy));

    // 3. Arquétipo do Squad
    let archetype = "Equipe Equilibrada & Multifuncional";
    const factorsSorted = Object.entries(discBalance).sort((a, b) => b[1] - a[1]);
    const topFactor = factorsSorted[0][0];

    if (topFactor === 'D' && discBalance.D >= 30) {
      archetype = "Squad de Ataque • Foco em Metas, Inovação Rápida & Desafios";
    } else if (topFactor === 'I' && discBalance.I >= 30) {
      archetype = "Squad Relacional • Alto Engajamento, CX & Articulação";
    } else if (topFactor === 'S' && discBalance.S >= 30) {
      archetype = "Squad Sustentador • Estabilidade Operacional, Coesão & Prazos";
    } else if (topFactor === 'C' && discBalance.C >= 30) {
      archetype = "Squad de Precisão • Rigor Analítico, Compliance & Governança";
    }

    // 4. Forças & Pontos de Atenção
    const strengths = [];
    const blindspots = [];

    if (discBalance.D >= 20) strengths.push("Tomada de decisão veloz e postura proativa diante de obstáculos.");
    if (discBalance.I >= 20) strengths.push("Excelente comunicação interna, entusiasmo e facilidade de negociação.");
    if (discBalance.S >= 20) strengths.push("Clima colaborativo seguro, paciência em processos e baixo conflito.");
    if (discBalance.C >= 20) strengths.push("Minúcia técnica, zelo por regras e blindagem contra erros de execução.");

    if (discBalance.D < 14) blindspots.push("Risco de lentidão em tomadas de decisões críticas sob pressão comercial.");
    if (discBalance.I < 14) blindspots.push("Atenção para alinhamentos informais e circulação de informações no time.");
    if (discBalance.S < 14) blindspots.push("Cuidado com a sobrecarga de ritmo e cobrança de prazos ininterruptos.");
    if (discBalance.C < 14) blindspots.push("Recomenda-se double-check formal para processos de auditoria e conformidade.");

    if (strengths.length === 0) strengths.push("Equipe adaptável com múltiplos perfis generalistas.");
    if (blindspots.length === 0) blindspots.push("Excelente equilíbrio de temperamentos com baixo risco de polarização.");

    return {
      synergyScore,
      discBalance,
      archetype,
      strengths,
      blindspots,
      skillsCoverage: Array.from(allSkills),
      memberCount: count
    };
  }

  /**
   * Gera o Dossiê Executivo de Squad para Apresentação à Diretoria em HTML
   */
  static generateSquadReportHtml(squad, allCandidates, appSettings) {
    const metrics = this.calculateSquadMetrics(squad.members, allCandidates);
    const membersDetail = (squad.members || []).map(m => {
      const cand = allCandidates.find(c => c.id === (m.candidate_id || m.id));
      return {
        role: m.role || "Especialista",
        cand: cand || null
      };
    });

    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Dossiê Executivo de Squad • ${escapeHtml(squad.name)}</title>
  <style>
    body { font-family: 'Segoe UI', -apple-system, sans-serif; background: #f8fafc; color: #1e293b; padding: 40px; margin: 0; }
    .page-box { max-width: 900px; margin: 0 auto; background: #ffffff; padding: 48px; border-radius: 20px; box-shadow: 0 10px 40px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 24px; margin-bottom: 32px; }
    .brand-title { font-size: 24px; font-weight: 800; color: #1e40af; margin: 0; }
    .brand-subtitle { font-size: 13px; color: #64748b; }
    .badge-synergy { background: #eff6ff; border: 1px solid #bfdbfe; color: #1d4ed8; padding: 8px 16px; border-radius: 9999px; font-weight: 700; font-size: 16px; }
    .squad-hero { margin-bottom: 32px; }
    .squad-name { font-size: 28px; font-weight: 800; color: #0f172a; margin-bottom: 8px; }
    .squad-desc { font-size: 15px; color: #475569; line-height: 1.6; }
    .metrics-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 32px; }
    .metric-card { background: #f8fafc; border: 1px solid #e2e8f0; padding: 18px; border-radius: 14px; text-align: center; }
    .metric-value { font-size: 26px; font-weight: 800; color: #1e40af; }
    .metric-label { font-size: 12px; font-weight: 600; text-transform: uppercase; color: #64748b; margin-top: 4px; }
    .section-title { font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 16px; border-left: 4px solid #2563eb; padding-left: 10px; }
    .members-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 16px; margin-bottom: 32px; }
    .member-card { background: #ffffff; border: 1px solid #cbd5e1; border-radius: 14px; padding: 20px; display: flex; gap: 14px; align-items: flex-start; }
    .member-avatar { width: 56px; height: 56px; border-radius: 12px; object-fit: cover; border: 2px solid #e2e8f0; }
    .member-name { font-weight: 700; font-size: 15px; color: #0f172a; }
    .member-role { font-size: 12px; font-weight: 600; color: #2563eb; margin-bottom: 4px; }
    .member-disc { font-size: 11px; background: #f1f5f9; padding: 2px 8px; border-radius: 6px; color: #475569; display: inline-block; }
    .insights-box { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; background: #f8fafc; padding: 24px; border-radius: 14px; border: 1px solid #e2e8f0; margin-bottom: 32px; }
    .insight-col h4 { margin: 0 0 10px 0; font-size: 14px; color: #0f172a; font-weight: 700; }
    .insight-col ul { margin: 0; padding-left: 18px; font-size: 13px; color: #475569; line-height: 1.6; }
    .footer { text-align: center; border-top: 1px solid #e2e8f0; padding-top: 24px; font-size: 12px; color: #94a3b8; }
    @media print { body { background: #fff; padding: 0; } .page-box { box-shadow: none; border: none; padding: 0; } }
  </style>
</head>
<body>
  <div class="page-box">
    <div class="header">
      <div>
        <h1 class="brand-title">Monte Sua Equipe</h1>
        <div class="brand-subtitle">Plataforma Executiva de Governança & Formação de Times • Edvania Freitas</div>
      </div>
      <div class="badge-synergy">Sinergia: ${metrics.synergyScore}%</div>
    </div>

    <div class="squad-hero">
      <div class="squad-name">${escapeHtml(squad.name)}</div>
      <div class="squad-desc">${escapeHtml(squad.description || 'Configuração multidisciplinar de alta produtividade.')}</div>
      <div style="margin-top: 8px; font-size: 13px; font-weight: 600; color: #2563eb;">
        Arquétipo: ${escapeHtml(metrics.archetype)}
      </div>
    </div>

    <div class="metrics-grid">
      <div class="metric-card">
        <div class="metric-value">${metrics.discBalance.D}%</div>
        <div class="metric-label">Dominância (D)</div>
      </div>
      <div class="metric-card">
        <div class="metric-value">${metrics.discBalance.I}%</div>
        <div class="metric-label">Influência (I)</div>
      </div>
      <div class="metric-card">
        <div class="metric-value">${metrics.discBalance.S}%</div>
        <div class="metric-label">Estabilidade (S)</div>
      </div>
      <div class="metric-card">
        <div class="metric-value">${metrics.discBalance.C}%</div>
        <div class="metric-label">Conformidade (C)</div>
      </div>
    </div>

    <div class="section-title">Composição do Time Selecionado</div>
    <div class="members-grid">
      ${membersDetail.map(m => {
        if (!m.cand) return '';
        const avatarUrl = m.cand.avatar || 'assets/avatar-mariana.jpg';
        const primaryDisc = (m.cand.disc && m.cand.disc.primary) || 'C';
        const secondaryDisc = (m.cand.disc && m.cand.disc.secondary) || 'S';
        return `
          <div class="member-card">
            <img src="${avatarUrl}" class="member-avatar" alt="${escapeHtml(m.cand.full_name)}">
            <div>
              <div class="member-role">${escapeHtml(m.role)}</div>
              <div class="member-name">${escapeHtml(m.cand.full_name)}</div>
              <div style="font-size: 12px; color: #64748b; margin-bottom: 6px;">${escapeHtml(m.cand.headline || 'Profissional')}</div>
              <span class="member-disc">DISC: ${primaryDisc}/${secondaryDisc} • Score: ${m.cand.cvScore || 90}</span>
            </div>
          </div>
        `;
      }).join('')}
    </div>

    <div class="section-title">Análise de Sinergia e Recomendações de Gestão</div>
    <div class="insights-box">
      <div class="insight-col">
        <h4 style="color: #166534;">✓ Forças e Vantagens Competitivas</h4>
        <ul>
          ${metrics.strengths.map(s => `<li>${escapeHtml(s)}</li>`).join('')}
        </ul>
      </div>
      <div class="insight-col">
        <h4 style="color: #991b1b;">⚠ Pontos de Atenção & Governança</h4>
        <ul>
          ${metrics.blindspots.map(b => `<li>${escapeHtml(b)}</li>`).join('')}
        </ul>
      </div>
    </div>

    <div class="footer">
      Documento gerado em ${new Date().toLocaleDateString('pt-BR')} via <strong>Monte Sua Equipe</strong> • Em conformidade com a LGPD (Lei 13.709/2018) e Lei 9.029/1995.
    </div>
  </div>
</body>
</html>`;
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
