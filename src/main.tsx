// src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { ChakraProvider, ColorModeScript } from '@chakra-ui/react'
import { App } from './presentation/App'
import theme from './theme'
import { Provider } from 'react-redux'
import { store } from './app/infrastructure/store/Store'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    {/* Maneja el modo de color inicial */}
    <ColorModeScript initialColorMode={theme.config.initialColorMode} />
    <Provider store={store}>
      <ChakraProvider theme={theme}>
        <App />
      </ChakraProvider>
    </Provider>
  </React.StrictMode>,
)
