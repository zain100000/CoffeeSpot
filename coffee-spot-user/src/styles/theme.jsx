export const theme = {
  colors: {
    primary: '#5d4037',
    secondary: '#2e2105',
    tertiary: '#d4a76a',
    success: '#35f338',
    error: '#f00221',
    white: '#ffffff',
    dark: '#000000',
    gray: '#dde0e5',
  },

  typography: {
    poppins: {
      black: 'Poppins-Black',
      bold: 'Poppins-Bold',
      semiBold: 'Poppins-SemiBold',
      medium: 'Poppins-Medium',
      regular: 'Poppins-Regular',
    },
    dancingScript: {
      bold: 'DancingScript-Bold',
      semiBold: 'DancingScript-SemiBold',
      medium: 'DancingScript-Medium',
      regular: 'DancingScript-Regular',
    },
    fontSize: {
      xs: 16,
      sm: 18,
      md: 22,
      lg: 26,
      xl: 28,
      xxl: 40,
    },
    lineHeight: {
      xs: 16,
      sm: 20,
      md: 24,
      lg: 28,
      xl: 32,
      xxl: 40,
    },
  },

  spacing: factor => factor * 8,

  gap: factor => factor * 8,

  borderRadius: {
    small: 4,
    medium: 8,
    large: 16,
    circle: 50,
  },

  elevation: {
    depth1: {
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 1},
      shadowOpacity: 0.2,
      shadowRadius: 1.41,
      elevation: 2,
    },
    depth2: {
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 3},
      shadowOpacity: 0.3,
      shadowRadius: 4.65,
      elevation: 6,
    },
    depth3: {
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 6},
      shadowOpacity: 0.4,
      shadowRadius: 10,
      elevation: 12,
    },
  },
};
