// src/App.tsx
import { Box, Button, Heading, Text, useColorMode } from '@chakra-ui/react'

function App() {
  const { colorMode, toggleColorMode } = useColorMode()

  return (
    <Box
      minH="100vh"
      bg={colorMode === 'light' ? 'gray.50' : 'gray.800'}
      color={colorMode === 'light' ? 'gray.800' : 'gray.100'}
      py={10}
      px={5}
    >
      <Heading as="h1" mb={4}>
        ¡Hola desde Chakra UI!
      </Heading>
      <Text fontSize="lg" mb={4}>
        Éste es un ejemplo base para iniciar tu proyecto.
      </Text>

      <Button colorScheme="brand" onClick={toggleColorMode}>
        Cambiar a modo {colorMode === 'light' ? 'oscuro' : 'claro'}
      </Button>
    </Box>
  )
}

export default App
