/**
 * MONTE SUA EQUIPE — Efeitos Visuais Interativos, Constelação Neural & Áudio Web
 * Design Futurista LUMINOSO (Light Cyber-Crystal)
 * Criado por Edvania Freitas (@ampliaperformance)
 */

export class InteractiveFx {
  static audioCtx = null;
  static soundEnabled = true;

  static initAudio() {
    if (!this.audioCtx && (window.AudioContext || window.webkitAudioContext)) {
      const AudioClass = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioClass();
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  static playChime() {
    if (!this.soundEnabled) return;
    try {
      this.initAudio();
      if (!this.audioCtx) return;
      const now = this.audioCtx.currentTime;
      
      const freqs = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 (harmonious major chord)
      freqs.forEach((freq, i) => {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.05);

        gain.gain.setValueAtTime(0.06, now + i * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.35);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start(now + i * 0.05);
        osc.stop(now + i * 0.05 + 0.4);
      });
    } catch (e) {
      // AudioContext policy fallback
    }
  }

  static playClick() {
    if (!this.soundEnabled) return;
    try {
      this.initAudio();
      if (!this.audioCtx) return;
      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.04);

      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.05);
    } catch (e) {}
  }

  static playScan() {
    if (!this.soundEnabled) return;
    try {
      this.initAudio();
      if (!this.audioCtx) return;
      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.linearRampToValueAtTime(880, now + 0.25);

      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.32);
    } catch (e) {}
  }

  /**
   * Ativa efeito 3D Tilt com reflexo especular de luz aos cartões futuristas
   */
  static applyTiltCards(container = document) {
    const cards = container.querySelectorAll('.future-glass-card, .candidate-card, .stat-kpi-card');
    cards.forEach(card => {
      if (card.dataset.tiltInitialized) return;
      card.dataset.tiltInitialized = 'true';

      card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -5;
        const rotateY = ((x - centerX) / centerX) * 5;

        card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-4px)`;
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

  /**
   * Renderiza a Constelação Neural Interativa no Canvas
   */
  static startConstellationCanvas(canvasId, candidates = [], onNodeClick = null) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return null;
    const ctx = canvas.getContext('2d');
    let animationFrameId = null;

    // Redimensionamento responsivo
    const resize = () => {
      canvas.width = canvas.parentElement.clientWidth || 800;
      canvas.height = 340;
    };
    resize();
    window.addEventListener('resize', resize);

    // Gera os nós da constelação
    const nodes = [];
    const width = canvas.width;
    const height = canvas.height;

    // Nó central (Hub "Monte Sua Equipe")
    nodes.push({
      x: width / 2,
      y: height / 2,
      vx: 0,
      vy: 0,
      radius: 18,
      label: 'Monte Sua Equipe',
      type: 'hub',
      color: '#2563eb',
      glow: 'rgba(37, 99, 235, 0.4)'
    });

    // Nós dos Candidatos
    candidates.slice(0, 8).forEach((cand, i) => {
      const angle = (i / Math.min(8, candidates.length)) * Math.PI * 2;
      const dist = 100 + (i % 2) * 35;
      nodes.push({
        x: width / 2 + Math.cos(angle) * dist,
        y: height / 2 + Math.sin(angle) * dist,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: 12,
        label: cand.full_name ? cand.full_name.split(' ')[0] : 'Talento',
        sub: (cand.disc && cand.disc.primary) ? `DISC: ${cand.disc.primary}` : 'Fit',
        cand: cand,
        type: 'candidate',
        color: '#0284c7',
        glow: 'rgba(14, 165, 233, 0.35)'
      });
    });

    // Partículas de fundo para sensação quântica
    for (let i = 0; i < 22; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        radius: 3 + Math.random() * 2,
        label: '',
        type: 'particle',
        color: '#93c5fd',
        glow: 'rgba(147, 197, 253, 0.2)'
      });
    }

    let mouse = { x: -1000, y: -1000, active: false };
    canvas.addEventListener('mousemove', e => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
      mouse.active = true;
    });
    canvas.addEventListener('mouseleave', () => {
      mouse.active = false;
    });

    canvas.addEventListener('click', e => {
      const r = canvas.getBoundingClientRect();
      const clickX = e.clientX - r.left;
      const clickY = e.clientY - r.top;
      for (const node of nodes) {
        if (node.type === 'candidate') {
          const dx = node.x - clickX;
          const dy = node.y - clickY;
          if (Math.hypot(dx, dy) <= node.radius + 8) {
            InteractiveFx.playChime();
            if (onNodeClick) onNodeClick(node.cand);
            break;
          }
        }
      }
    });

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Fundo suave com degradê translúcido
      const bgGrad = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 20,
        canvas.width / 2, canvas.height / 2, canvas.width / 1.5
      );
      bgGrad.addColorStop(0, 'rgba(238, 246, 255, 0.7)');
      bgGrad.addColorStop(1, 'rgba(248, 250, 252, 0.3)');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Atualiza e desenha linhas de conexão quânticas
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const n1 = nodes[i];
          const n2 = nodes[j];
          const dist = Math.hypot(n1.x - n2.x, n1.y - n2.y);
          const maxDist = n1.type === 'hub' || n2.type === 'hub' ? 170 : 95;

          if (dist < maxDist) {
            const alpha = 1 - dist / maxDist;
            ctx.beginPath();
            ctx.moveTo(n1.x, n1.y);
            ctx.lineTo(n2.x, n2.y);
            ctx.strokeStyle = `rgba(59, 130, 246, ${alpha * 0.45})`;
            ctx.lineWidth = n1.type === 'hub' || n2.type === 'hub' ? 1.8 : 0.8;
            ctx.stroke();
          }
        }
      }

      // Conexão com mouse
      if (mouse.active) {
        for (const node of nodes) {
          const dist = Math.hypot(node.x - mouse.x, node.y - mouse.y);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = `rgba(99, 102, 241, ${(1 - dist / 120) * 0.6})`;
            ctx.lineWidth = 1.2;
            ctx.stroke();
          }
        }
      }

      // Desenha nós
      nodes.forEach(node => {
        // Movimento
        if (node.type !== 'hub') {
          node.x += node.vx;
          node.y += node.vy;
          if (node.x < 20 || node.x > canvas.width - 20) node.vx *= -1;
          if (node.y < 20 || node.y > canvas.height - 20) node.vy *= -1;
        }

        // Halo de brilho
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius + 6, 0, Math.PI * 2);
        ctx.fillStyle = node.glow;
        ctx.fill();

        // Círculo principal
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();

        // Rótulo
        if (node.label) {
          ctx.font = node.type === 'hub' ? 'bold 12px sans-serif' : '600 11px sans-serif';
          ctx.fillStyle = '#1e3a8a';
          ctx.textAlign = 'center';
          ctx.fillText(node.label, node.x, node.y + node.radius + 14);

          if (node.sub) {
            ctx.font = '500 10px monospace';
            ctx.fillStyle = '#64748b';
            ctx.fillText(node.sub, node.x, node.y + node.radius + 25);
          }
        }
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
    };
  }

  /**
   * Renderiza Radar Holográfico de Competências em SVG
   */
  static renderRadarSvg(metrics = { tecnico: 85, lideranca: 75, governanca: 90, resiliencia: 80, comunicacao: 88 }) {
    const size = 260;
    const center = size / 2;
    const radius = 95;
    const axes = [
      { key: 'tecnico', label: 'Técnico' },
      { key: 'lideranca', label: 'Liderança' },
      { key: 'governanca', label: 'Governança' },
      { key: 'resiliencia', label: 'Resiliência' },
      { key: 'comunicacao', label: 'Comunicação' }
    ];
    const total = axes.length;

    // Círculos concêntricos de grade
    const grids = [0.25, 0.5, 0.75, 1.0].map(level => {
      const points = axes.map((_, i) => {
        const angle = (i / total) * Math.PI * 2 - Math.PI / 2;
        const x = center + Math.cos(angle) * (radius * level);
        const y = center + Math.sin(angle) * (radius * level);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      }).join(' ');
      return `<polygon points="${points}" fill="none" stroke="#e2e8f0" stroke-width="1" />`;
    }).join('');

    // Eixos radiais
    const axisLines = axes.map((axis, i) => {
      const angle = (i / total) * Math.PI * 2 - Math.PI / 2;
      const x = center + Math.cos(angle) * radius;
      const y = center + Math.sin(angle) * radius;
      const labelX = center + Math.cos(angle) * (radius + 22);
      const labelY = center + Math.sin(angle) * (radius + 22) + 4;
      return `
        <line x1="${center}" y1="${center}" x2="${x}" y2="${y}" stroke="#cbd5e1" stroke-width="1" stroke-dasharray="2,2" />
        <text x="${labelX}" y="${labelY}" font-size="10" font-weight="600" fill="#475569" text-anchor="middle">${axis.label}</text>
      `;
    }).join('');

    // Polígono de valores
    const valuePoints = axes.map((axis, i) => {
      const val = (metrics[axis.key] || 75) / 100;
      const angle = (i / total) * Math.PI * 2 - Math.PI / 2;
      const x = center + Math.cos(angle) * (radius * val);
      const y = center + Math.sin(angle) * (radius * val);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');

    return `
      <svg viewBox="0 0 ${size} ${size}" width="100%" height="240" style="max-width: 260px; margin: 0 auto; display: block; overflow: visible;">
        <defs>
          <linearGradient id="radarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.45" />
            <stop offset="100%" stop-color="#8b5cf6" stop-opacity="0.3" />
          </linearGradient>
        </defs>
        ${grids}
        ${axisLines}
        <polygon points="${valuePoints}" fill="url(#radarGrad)" stroke="#2563eb" stroke-width="2.5" />
      </svg>
    `;
  }
}
