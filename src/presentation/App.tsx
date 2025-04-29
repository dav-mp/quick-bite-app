import type React from "react"
import { Provider } from "react-redux"
import { ChakraProvider, extendTheme } from "@chakra-ui/react"
import { AppRouter } from "./routes/AppRouter"
import { store } from "../app/infrastructure/store/Store"

// Custom theme
const theme = extendTheme({
  fonts: {
    heading: "'Poppins', sans-serif",
    body: "'Inter', sans-serif",
  },
  colors: {
    pink: {
      50: "#FFF5F7",
      100: "#FED7E2",
      200: "#FBB6CE",
      300: "#F687B3",
      400: "#ED64A6",
      500: "#D53F8C",
      600: "#B83280",
      700: "#97266D",
      800: "#702459",
      900: "#521B41",
    },
    purple: {
      50: "#FAF5FF",
      100: "#E9D8FD",
      200: "#D6BCFA",
      300: "#B794F4",
      400: "#9F7AEA",
      500: "#805AD5",
      600: "#6B46C1",
      700: "#553C9A",
      800: "#44337A",
      900: "#322659",
    },
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: "600",
        borderRadius: "lg",
      },
    },
    Card: {
      baseStyle: {
        container: {
          borderRadius: "xl",
        },
      },
    },
  },
})

export const App: React.FC = () => {
  return (
    <Provider store={store}>
      <ChakraProvider theme={theme}>
        <AppRouter />
      </ChakraProvider>
    </Provider>
  )
}
