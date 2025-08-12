// Professional Design System - Orange + White Theme
export const theme = {
  // Primary Colors
  colors: {
    primary: "#FF8C00", // Main orange
    primaryDark: "#E67E00", // Darker orange for pressed states
    primaryLight: "#FFB347", // Lighter orange for backgrounds
    white: "#FFFFFF",
    black: "#000000",

    // Text Colors
    textPrimary: "#2C3E50", // Dark blue-gray for main text
    textSecondary: "#7F8C8D", // Gray for secondary text
    textLight: "#BDC3C7", // Light gray for placeholders
    textWhite: "#FFFFFF",

    // Background Colors
    background: "#FF8C00", // Primary background
    surface: "#FFFFFF", // Cards, inputs
    overlay: "rgba(0, 0, 0, 0.5)",

    // Status Colors
    success: "#27AE60",
    error: "#E74C3C",
    warning: "#F39C12",
    info: "#3498DB",

    // Neutral Colors
    gray50: "#F8F9FA",
    gray100: "#F1F3F4",
    gray200: "#E8EAED",
    gray300: "#DADCE0",
    gray400: "#BDC1C6",
    gray500: "#9AA0A6",
    gray600: "#80868B",
    gray700: "#5F6368",
    gray800: "#3C4043",
    gray900: "#202124",
  },

  // Typography
  fonts: {
    regular: "System",
    medium: "System",
    bold: "System",
    sizes: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 20,
      xxl: 24,
      xxxl: 30,
      display: 36,
    },
    weights: {
      light: "300",
      normal: "400",
      medium: "500",
      semibold: "600",
      bold: "700",
      extrabold: "800",
    },
    lineHeights: {
      tight: 1.2,
      normal: 1.4,
      relaxed: 1.6,
    },
  },

  // Spacing
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 40,
    xxxl: 48,
  },

  // Border Radius
  borderRadius: {
    none: 0,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    xxl: 20,
    full: 9999,
  },

  // Shadows
  shadows: {
    sm: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
    },
    md: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 4,
    },
    lg: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 8,
    },
    xl: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 16,
    },
  },

  // Component Styles
  components: {
    button: {
      height: 48,
      borderRadius: 12,
      paddingHorizontal: 24,
    },
    input: {
      height: 48,
      borderRadius: 8,
      paddingHorizontal: 16,
      borderWidth: 1,
    },
    card: {
      borderRadius: 16,
      padding: 16,
    },
  },
};
