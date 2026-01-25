import { Platform } from "react-native";

export const Colors = {
  light: {
    text: "#2C1810",
    textSecondary: "#6B5C56",
    buttonText: "#FFFFFF",
    tabIconDefault: "#6B5C56",
    tabIconSelected: "#8B4513",
    link: "#D4762E",
    primary: "#8B4513",
    primaryLight: "#C19A6B",
    accent: "#D4762E",
    success: "#4A7C59",
    error: "#C44536",
    border: "#E8DCD0",
    backgroundRoot: "#FFFEF9",
    backgroundDefault: "#FBF7F2",
    backgroundSecondary: "#F5EDE4",
    backgroundTertiary: "#EEE5DA",
  },
  dark: {
    text: "#F5EDE4",
    textSecondary: "#A89B94",
    buttonText: "#FFFFFF",
    tabIconDefault: "#A89B94",
    tabIconSelected: "#C19A6B",
    link: "#D4762E",
    primary: "#C19A6B",
    primaryLight: "#8B4513",
    accent: "#D4762E",
    success: "#5A9C69",
    error: "#E45746",
    border: "#3A322D",
    backgroundRoot: "#1F1A17",
    backgroundDefault: "#2A2420",
    backgroundSecondary: "#352E29",
    backgroundTertiary: "#403832",
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
  inputHeight: 48,
  buttonHeight: 52,
};

export const BorderRadius = {
  xs: 8,
  sm: 12,
  md: 18,
  lg: 24,
  xl: 30,
  "2xl": 40,
  "3xl": 50,
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
