// src/theme.ts
import { extendTheme, type ThemeConfig } from '@chakra-ui/react'

// 1. Opcional: configuración de modo oscuro/claro
const config: ThemeConfig = {
  initialColorMode: 'light',
  useSystemColorMode: false,
}

// 2. Paleta de colores de ejemplo. Cambia a tu gusto.
const colors = {
  brand: {
    50: '#e7f5ff',
    100: '#c2e0ff',
    200: '#9acaff',
    300: '#72b3ff',
    400: '#4a9cff',
    500: '#1f85ff',
    600: '#176acb',
    700: '#104f97',
    800: '#083463',
    900: '#001930',
  },
}

// 3. Crea el tema extendiendo la config y tus colores
const theme = extendTheme({
  config,
  colors,
  // Puedes añadir fonts, breakpoints, etc.
})

export default theme
