

## Plano: Recriar Estilo Front-End Idêntico às Imagens de Referência

As imagens mostram um design cyberpunk dark com neon verde (#00ff9f), fundo escuro profundo, tipografia Orbitron/JetBrains Mono, e cards com bordas finas. O site atual já tem a estrutura, mas precisa de ajustes visuais para bater com as referências.

### Mudanças por arquivo

---

**1. `src/index.css`** — Restaurar paleta neon cyberpunk

Substituir as variáveis CSS atuais (que foram suavizadas para teal matte) de volta para a paleta neon original conforme o CSS fornecido pelo usuário:
- `--primary: 155 100% 50%` (verde neon)
- `--accent: 155 100% 50%`
- `--background: 240 20% 1.5%`
- `--card: 240 15% 4%`
- `--border: 0 0% 20%`
- Restaurar efeito CRT scanline com opacidade 0.6
- Restaurar scrollbar neon com glow no hover
- Manter utilitários: `.terminal-border`, `.progress-segmented`, `.cyber-shape`, `.scanner-line`, `.glitch-text`, `.bg-circuit-pattern`
- Adicionar `.clip-chip` do CSS fornecido

---

**2. `src/lib/theme.ts`** — Atualizar cores JS para neon

Usar as cores exatas fornecidas:
- `accent: '#00ff9f'`, `cyan: '#00f3ff'`, `pink: '#ff0055'`, `yellow: '#f3e600'`, `purple: '#bd00ff'`
- `grid: 'rgba(0, 243, 255, 0.07)'`
- `bg: '#030304'`, `cardBg: '#0a0a0c'`

---

**3. `src/pages/SubjectDetail.tsx`** — Cores dos gráficos neon

Atualizar as constantes de cor no topo:
- `GREEN` → `#00ff9f`
- `RED` → `#ff0055`
- `YELLOW` → `#f3e600`
- `CYAN` → `#00f3ff`
- `NEUTRAL` → `#94a3b8`
- `GRID` → `rgba(0, 243, 255, 0.07)`
- `CARD_BG` → `#0a0a0c`

Ajustar o header da página para bater com a 3a imagem de referência:
- Título `SECTION://LINGUAGENS` em verde neon grande com efeito glitch
- Tags `ACCESS://GRANTED`, `TERMINAL ID: 2010`, `SYNC_RDY` alinhadas à direita
- Linha decorativa com pontos/diamantes abaixo do título
- Seletores de ano/data no NavHeader (já existem)

Nos KPI cards: adicionar ícones pequenos (Activity, Target, TrendingUp, Hash, AlertTriangle, Clock) e linha colorida horizontal sob o valor.

---

**4. `src/pages/RedacaoDetail.tsx`** — Mesmas cores neon

Atualizar constantes de cor para neon. Mesma estrutura, cores vibrantes.

---

**5. `src/pages/DebugPage.tsx`** — Mesmas cores neon

Atualizar constantes de cor para neon.

---

**6. `src/pages/Index.tsx`** — Ajustar para bater com imagens 1 e 2

Referência mostra:
- Header "CENTRAL DE INTELIGÊNCIA" / "VISÃO GERAL DO SISTEMA" em bold uppercase
- Painel de média: número grande "685.4" branco com "/ 780" cinza, barra segmentada verde neon
- Cards KPI (Q_TOT, ACK, ERR) com bordas finas e tags coloridas
- Grid de módulos 3x2 com cards que têm: MOD_01 ACTV ON, título bold, SCORE grande, eficiência em verde neon, barra [SYS_LOAD]
- Card AUDIT LOGS com tag WARN em amarelo/vermelho, número em vermelho neon, botão "VISUALIZAR MATRIZ →"

Os cards já estão corretos na estrutura, apenas garantir que as cores e fontes batem.

---

**7. `src/components/dashboard/NavHeader.tsx`** — Ajustar para imagens de referência

Desktop (imagem 2): 
- Logo `ENEM_LOG` com `>_` prefix em verde
- Nav com ícones + labels curtos: HUM, LIN, MAT, NAT, RED, DBG
- Botão "SAIR" com ícone à direita (borda verde, estilo outline)
- Remover NET: 5G e relógio

Mobile (imagem 5):
- Hamburger menu, overlay já funciona

Na página de matéria (imagem 3):
- Nav mostra os seletores de ano/data integrados ao header

---

**8. `tailwind.config.ts`** — Garantir cores neon

Atualizar cores de volta:
- `--chart-correct: 155 100% 50%`
- `--chart-highlight: 55 95% 47%`
- `--chart-error / destructive: 345 100% 40%`

---

### Resumo de arquivos

| Arquivo | O que muda |
|---------|-----------|
| `src/index.css` | Paleta neon, scanlines, scrollbar glow |
| `src/lib/theme.ts` | Cores JS neon |
| `tailwind.config.ts` | Variáveis CSS neon |
| `src/components/dashboard/NavHeader.tsx` | Botão SAIR, remover clock/net, labels curtos |
| `src/pages/Index.tsx` | Ajustar tipografia e cores |
| `src/pages/SubjectDetail.tsx` | Cores neon, header com glitch, KPI com ícones e linhas |
| `src/pages/RedacaoDetail.tsx` | Cores neon |
| `src/pages/DebugPage.tsx` | Cores neon |

