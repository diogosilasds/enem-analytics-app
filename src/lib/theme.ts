/**
 * Fonte única de verdade para estilos que precisam ser injetados via JavaScript
 * (ex: cores de preenchimento do Recharts).
 */

export const getThemeColors = (isDark: boolean = true) => {
  return {
    bg: '#030304',
    cardBg: '#0a0a0c',
    text: '#f0f0f0',
    muted: '#94a3b8',
    accent: '#00ff9f',
    cyan: '#00f3ff',
    pink: '#ff0055',
    yellow: '#f3e600',
    purple: '#bd00ff',
    neutral: '#262626',
    grid: 'rgba(0, 243, 255, 0.07)',
    border: '#333333',
    emerald: '#00ff9f',
  };
};

export const getColorWithOpacity = (hex: string, opacity: number) => {
  if (!hex || !hex.startsWith('#')) return hex;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};
