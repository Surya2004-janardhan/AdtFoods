// Modern Stylish Design System - Black & White
export const theme = {
  colors: {
    primary: "#111111",
    primaryDark: "#000000",
    primaryLight: "#222222",

    secondary: "#000000",
    secondaryLight: "#2D2D2D",

    white: "#FFFFFF",
    black: "#000000",

    // Background Colors
    background: "#FFFFFF", // White background
    surface: "#FFFFFF",
    surfaceElevated: "#F7F7F7",
    overlay: "rgba(0, 0, 0, 0.5)",

    // Text Colors
    textPrimary: "#111111",
    textSecondary: "#555555",
    textTertiary: "#888888",
    textWhite: "#FFFFFF",

    // Status Colors
    success: "#2E7D32",
    error: "#D32F2F",
    warning: "#ED6C02",
    info: "#1976D2",

    // Grays
    gray50: "#FAFAFA",
    gray100: "#F2F2F2",
    gray200: "#E6E6E6",
    gray300: "#D9D9D9",
    gray400: "#B3B3B3",
    gray500: "#8C8C8C",
    gray600: "#737373",
    gray700: "#595959",
    gray800: "#404040",
    gray900: "#262626",
  },

  // Modern Typography
  fonts: {
    sizes: {
      xs: 10,
      sm: 12,
      md: 14,
      lg: 16,
      xl: 18,
      xxl: 20,
      xxxl: 24,
      display: 28,
      hero: 32,
      giant: 36,
    },
    weights: {
      light: "300",
      normal: "400",
      medium: "500",
      semibold: "600",
      bold: "700",
      extrabold: "800",
      black: "900",
    },
    lineHeights: { tight: 1.25, normal: 1.5, relaxed: 1.75 },
  },

  // Spacing System
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    huge: 40,
    massive: 48,
  },

  // Modern Radius
  borderRadius: {
    none: 0,
    xs: 4,
    sm: 6,
    md: 8,
    lg: 12,
    xl: 16,
    xxl: 20,
    xxxl: 24,
    full: 999,
  },

  // Stylish Shadows
  shadows: {
    xs: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    sm: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 2,
    },
    md: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 8,
      elevation: 4,
    },
    lg: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 16,
      elevation: 8,
    },
    xl: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.18,
      shadowRadius: 24,
      elevation: 12,
    },
  },

  // Component Styles
  components: {
    button: { height: 52, borderRadius: 12, paddingHorizontal: 24 },
    buttonSmall: { height: 40, borderRadius: 8, paddingHorizontal: 16 },
    input: {
      height: 52,
      borderRadius: 12,
      paddingHorizontal: 16,
      borderWidth: 1.25,
    },
    card: { borderRadius: 20, padding: 20 },
  },
};
