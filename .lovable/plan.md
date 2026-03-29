

## Plano: Responsividade, Redesign e Ajustes Estruturais

### Resumo das mudanças

1. **Menu hamburger em telas pequenas/médias** — NavHeader ganha um botão hamburger (`md:` breakpoint) que abre/fecha um menu mobile overlay com todos os links de navegação. O nav desktop fica `hidden` abaixo de `lg`.

2. **Redesign sem neon** — Substituir a paleta verde neon por tons mais frios e sutis:
   - Primary: de `160 100% 50%` (verde neon) para `160 60% 45%` (verde acinzentado/teal)
   - Remover `text-glow`, `glow-green`, `glow-green-strong`, `animate-pulse-glow` dos componentes
   - Remover efeito `scanline` do body das páginas
   - Manter a estética terminal/dark mas com aparência mais "matte" e profissional
   - Atualizar cores dos gráficos (GREEN, CYAN etc.) em SubjectDetail, RedacaoDetail e DebugPage para tons menos saturados

3. **Remover botão "VISÃO GERAL"** — No NavHeader, remover o botão explícito "VISÃO GERAL". A logo "ENEM_LOG" já navega para `/` via `onNavigate("/")`.

4. **Audit Logs dentro da grid de Módulos** — Mover o card AUDIT LOGS da seção separada para dentro da grid `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` junto com os 5 cards de matérias (totalizando 6 cards na grid, 3x2).

5. **Responsividade geral** — Revisar todas as páginas para garantir que KPIs, gráficos e tabelas se adaptam bem em mobile (stack vertical, overflow-x-auto, font-size ajustado).

### Arquivos a modificar

| Arquivo | Mudança |
|---------|---------|
| `src/index.css` | Ajustar variáveis CSS de cor (primary menos saturado), remover/suavizar utilities neon |
| `src/components/dashboard/NavHeader.tsx` | Adicionar hamburger menu com state toggle; remover botão "VISÃO GERAL"; remover botão DEBUG_MODE do nav (já vai estar na home); breakpoint `lg` para nav desktop |
| `src/pages/Index.tsx` | Mover card AUDIT LOGS para dentro da grid de módulos; remover mobile nav duplicado; remover classes `scanline`/`glow-green` |
| `src/pages/SubjectDetail.tsx` | Remover `scanline`, ajustar constantes de cor, responsividade dos KPIs |
| `src/pages/RedacaoDetail.tsx` | Mesmas remoções de scanline/neon e ajustes de cor |
| `src/pages/DebugPage.tsx` | Mesmas remoções e ajustes |
| `src/components/dashboard/Footer.tsx` | Ajustes menores de responsividade |

### Detalhes técnicos

**NavHeader — Menu hamburger:**
- State local `const [menuOpen, setMenuOpen] = useState(false)`
- Botão `Menu`/`X` do lucide-react visível em `lg:hidden`
- Painel mobile: `fixed inset-0 z-50 bg-background` com links empilhados verticalmente
- Nav desktop: `hidden lg:flex`

**Paleta de cores atualizada (index.css):**
```css
--primary: 170 50% 40%;        /* teal matte */
--accent: 170 50% 40%;
--ring: 170 50% 40%;
--border: 170 20% 15%;
--chart-correct: 160 50% 45%;
--chart-highlight: 45 70% 55%;
```

**Grid de módulos (Index.tsx):**
O card AUDIT LOGS entra como 6o item na mesma `<section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">`, removendo a seção separada.

