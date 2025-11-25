export const colors = {
  primary: '#0F4C81',
  secondary: '#FF6F00',
  background: '#FFFFFF',
  textPrimary: '#0B2545',
  textSecondary: '#5B6B7A',
  success: '#2E7D32',
  error: '#D32F2F',
  disabled: '#E6EEF8',
  white: '#FFFFFF',
  black: '#000000'
};

export const typography = {
  h1: {
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 40,
    color: colors.textPrimary
  },
  h2: {
    fontSize: 24,
    fontWeight: 'bold',
    lineHeight: 32,
    color: colors.textPrimary
  },
  h3: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
    color: colors.textPrimary
  },
  body: {
    fontSize: 16,
    fontWeight: 'normal',
    lineHeight: 24,
    color: colors.textPrimary
  },
  bodyLarge: {
    fontSize: 18,
    fontWeight: 'normal',
    lineHeight: 26,
    color: colors.textPrimary
  },
  caption: {
    fontSize: 14,
    fontWeight: 'normal',
    lineHeight: 20,
    color: colors.textSecondary
  }
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8
  }
};

export const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows
};