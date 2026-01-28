import { Platform } from "react-native";

export const Colors = {
  light: {
    text: "#1A1A1A", // Dark text for contrast
    textSecondary: "#666666",
    buttonText: "#FFFFFF",
    tabIconDefault: "#CCCCCC",
    tabIconSelected: "#FF7F50", // Orange
    link: "#FF7F50",
    primary: "#FF7F50", // KLEOP Orange
    primaryLight: "#FFAB88",
    accent: "#FF7F50",
    success: "#34C759",
    error: "#FF3B30",
    border: "#F0F0F0",
    backgroundRoot: "#FFFFFF",
    backgroundDefault: "#FFFFFF",
    backgroundSecondary: "#F9F9F9", // Very light gray for cards/sections
    backgroundTertiary: "#F0F0F0",
  },
  dark: {
    // Keeping dark mode same structure but essentially light due to force-light in useTheme, 
    // but updating values just in case.
    text: "#FFFFFF",
    textSecondary: "#8E8E93",
    buttonText: "#FFFFFF",
    tabIconDefault: "#8E8E93",
    tabIconSelected: "#FF7F50",
    link: "#FF7F50",
    primary: "#FF7F50",
    primaryLight: "#FFAB88",
    accent: "#FFD60A",
    success: "#30D158",
    error: "#FF453A",
    border: "#38383A",
    backgroundRoot: "#000000",
    backgroundDefault: "#1C1C1E",
    backgroundSecondary: "#2C2C2E",
    backgroundTertiary: "#3A3A3C",
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  "4xl": 40,
  "5xl": 48,
  inputHeight: 56, // Taller inputs
  buttonHeight: 56, // Taller buttons
};

export const BorderRadius = {
  xs: 8,
  sm: 12,
  md: 20, // More rounded
  lg: 28,
  xl: 36,
  "2xl": 48,
  "3xl": 60,
  full: 9999,
};

export const Typography = {
  display: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: "700" as const,
    fontFamily: Platform.select({ ios: "ui-serif", default: "serif" }),
  },
  h1: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: "700" as const,
    fontFamily: Platform.select({ ios: "ui-serif", default: "serif" }),
  },
  h2: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: "600" as const,
    fontFamily: Platform.select({ ios: "ui-serif", default: "serif" }),
  },
  h3: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: "600" as const,
  },
  h4: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "600" as const,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "400" as const,
  },
  small: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "400" as const,
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "500" as const,
    textTransform: "uppercase" as const,
    letterSpacing: 0.5,
  },
  link: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "400" as const,
  },
};

export const Shadows = {
  fab: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  card: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    serif: "Literata, Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  },
});
