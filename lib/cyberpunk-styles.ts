/**
 * Cyberpunk Style Context
 * 
 * This file contains all cyberpunk styling patterns extracted from the codebase.
 * Use this as a reference when implementing the cyberpunk theme in the theme system.
 */

export const cyberpunkColors = {
  black: "#050505",
  dark: "#0a0a0f",
  panel: "#12121a",
  border: "#2a2a35",
  cyan: "#00f0ff",
  purple: "#bc13fe",
  green: "#0aff68",
} as const;

export const cyberpunkCSSVariables = {
  "--cyber-black": cyberpunkColors.black,
  "--cyber-dark": cyberpunkColors.dark,
  "--cyber-panel": cyberpunkColors.panel,
  "--cyber-border": cyberpunkColors.border,
  "--cyber-cyan": cyberpunkColors.cyan,
  "--cyber-purple": cyberpunkColors.purple,
  "--cyber-green": cyberpunkColors.green,
} as const;

export const cyberpunkThemeMapping = {
  background: cyberpunkColors.black,
  foreground: "#e5e5e5",
  card: cyberpunkColors.panel,
  "card-foreground": "#ffffff",
  popover: cyberpunkColors.panel,
  "popover-foreground": "#ffffff",
  primary: cyberpunkColors.cyan,
  "primary-foreground": "#000000",
  secondary: cyberpunkColors.panel,
  "secondary-foreground": "#ffffff",
  muted: cyberpunkColors.panel,
  "muted-foreground": "#9ca3af",
  accent: cyberpunkColors.purple,
  "accent-foreground": "#ffffff",
  destructive: "#ef4444",
  "destructive-foreground": "#ffffff",
  border: cyberpunkColors.border,
  input: cyberpunkColors.panel,
  ring: cyberpunkColors.cyan,
  "chart-1": cyberpunkColors.cyan,
  "chart-2": cyberpunkColors.purple,
  "chart-3": cyberpunkColors.green,
  "chart-4": "#f59e0b",
  "chart-5": "#ec4899",
  radius: "0",
  sidebar: cyberpunkColors.panel,
  "sidebar-foreground": "#ffffff",
  "sidebar-primary": cyberpunkColors.cyan,
  "sidebar-primary-foreground": "#000000",
  "sidebar-accent": cyberpunkColors.panel,
  "sidebar-accent-foreground": "#ffffff",
  "sidebar-border": cyberpunkColors.border,
  "sidebar-ring": cyberpunkColors.cyan,
} as const;

export const cyberpunkComponentClasses = {
  nav: {
    container: "sticky top-0 z-40 bg-cyber-dark/90 backdrop-blur-md border-b border-cyber-border",
    logo: "object-contain w-12 h-12",
    brandText: "font-display font-bold text-2xl tracking-wider text-white",
    link: "px-3 py-2 text-sm font-medium transition-colors uppercase tracking-widest text-gray-400 hover:text-white border-b-2 border-transparent hover:border-cyber-cyan",
    button: "bg-transparent border border-cyber-cyan text-cyber-cyan hover:bg-cyber-cyan hover:text-black px-4 py-1.5 text-sm font-bold uppercase tracking-wider transition-all clip-corner",
    avatar: "h-8 w-8 border border-gray-600 overflow-hidden cursor-pointer",
    avatarFallback: "bg-gray-700 border border-gray-600",
  },
  hero: {
    container: "relative py-20 lg:py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full",
    glowCyan: "absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-cyber-cyan/10 rounded-full blur-3xl pointer-events-none",
    glowPurple: "absolute bottom-0 left-0 -mb-20 -ml-20 w-96 h-96 bg-cyber-purple/10 rounded-full blur-3xl pointer-events-none",
    statusBadge: "inline-flex items-center px-3 py-1 border border-cyber-border bg-cyber-panel text-cyber-cyan text-xs font-mono mb-6 tracking-widest uppercase",
    statusDot: "w-2 h-2 bg-cyber-cyan rounded-full mr-2 animate-pulse",
    heading: "text-5xl md:text-7xl font-display font-bold text-white mb-6 leading-tight",
    headingGradient: "text-transparent bg-clip-text bg-gradient-to-r from-cyber-cyan to-cyber-purple",
    subtitle: "text-xl text-cyber-cyan mb-4 font-mono uppercase tracking-wider",
    description: "text-lg text-gray-400 mb-10 max-w-2xl mx-auto font-light",
    primaryButton: "px-8 py-4 bg-cyber-cyan text-black font-bold text-lg uppercase tracking-widest hover:shadow-[0_0_5px_theme(colors.cyber.cyan),0_0_10px_theme(colors.cyber.cyan)] transition-all clip-corner",
    secondaryButton: "px-8 py-4 bg-transparent border border-cyber-purple text-cyber-purple font-bold text-lg uppercase tracking-widest hover:bg-cyber-purple hover:text-white hover:shadow-[0_0_5px_theme(colors.cyber.purple),0_0_10px_theme(colors.cyber.purple)] transition-all clip-corner",
  },
  card: {
    base: "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm",
    projectCard: "group bg-cyber-panel border border-cyber-border hover:border-cyber-cyan transition-all duration-300 cursor-pointer relative overflow-hidden",
    topAccent: "absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyber-cyan to-transparent transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500",
    progressBar: "h-1 w-full bg-gray-800 mt-auto",
    progressFill: "h-full bg-cyber-cyan",
  },
  badge: {
    recruiting: "bg-cyber-cyan/10 text-cyber-cyan border-cyber-cyan/30",
    active: "bg-cyber-green/10 text-cyber-green border-cyber-green/30",
    beta: "bg-cyber-purple/10 text-cyber-purple border-cyber-purple/30",
    creation: "bg-yellow-500/10 text-yellow-500 border-yellow-500/30",
  },
} as const;

export const cyberpunkStatusColors: Record<string, string> = {
  recruiting: "bg-cyber-cyan/10 text-cyber-cyan border-cyber-cyan/30",
  active: "bg-cyber-green/10 text-cyber-green border-cyber-green/30",
  beta: "bg-cyber-purple/10 text-cyber-purple border-cyber-purple/30",
  creation: "bg-yellow-500/10 text-yellow-500 border-yellow-500/30",
};

export const cyberpunkBodyStyles = {
  backgroundColor: cyberpunkColors.black,
  backgroundImage: [
    "linear-gradient(rgba(0, 240, 255, 0.05) 1px, transparent 1px)",
    "linear-gradient(90deg, rgba(0, 240, 255, 0.05) 1px, transparent 1px)",
    "linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px)",
    "linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)",
  ],
  backgroundSize: "100px 100px, 100px 100px, 20px 20px, 20px 20px",
  backgroundPosition: "-1px -1px, -1px -1px, -1px -1px, -1px -1px",
} as const;

export const cyberpunkScrollbarStyles = {
  width: "6px",
  track: cyberpunkColors.dark,
  thumb: cyberpunkColors.border,
  thumbHover: cyberpunkColors.cyan,
} as const;

export const cyberpunkSelectionStyles = {
  backgroundColor: cyberpunkColors.cyan,
  color: "#000000",
} as const;

export const cyberpunkLogos = {
  default: "/Praxis_new.png",
  manga: "/Praxis_manga.png",
  cyberpunk: "/Praxis_cyberpunk.png",
} as const;
