import React, { useState } from 'react';
import {
  Box,
  Flex,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Button,
  Link,
  VStack,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';
import useRedirect from '../../../../shared/hooks/useRedirect';

const LoginUser: React.FC = () => {

  const redirect = useRedirect();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const toast = useToast();

  // Maneja el envío del formulario
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Lógica de autenticación
    console.log({ email, password });
    toast({
      title: 'Intentando iniciar sesión...',
      description: `Email: ${email}`,
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };

  // Paleta de colores más neutra y formal
  const backgroundColor = useColorModeValue('gray.100', 'gray.800');
  const boxBg = useColorModeValue('white', 'gray.700');
  const inputBg = useColorModeValue('white', 'gray.600');
  const textColor = useColorModeValue('gray.800', 'gray.100');

  return (
    <Flex
      minH="100vh"
      w="full"
      bg={backgroundColor}
      align="center"
      justify="center"
      p={4}
    >
      <Box
        bg={boxBg}
        boxShadow="md"
        borderRadius="lg"
        p={8}
        w={{ base: 'full', sm: 'md' }}
        maxW="400px"
      >
        <VStack spacing={6} as="form" onSubmit={handleSubmit}>
          <Heading
            as="h1"
            size="lg"
            textAlign="center"
            color={textColor}
          >
            Iniciar Sesión
          </Heading>

          {/* Campo de correo */}
          <FormControl id="email" isRequired>
            <FormLabel color={textColor}>Correo electrónico</FormLabel>
            <Input
              type="email"
              placeholder="Ingresa tu correo"
              bg={inputBg}
              variant="filled"
              focusBorderColor="blue.400"
              color={textColor}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </FormControl>

          {/* Campo de contraseña */}
          <FormControl id="password" isRequired>
            <FormLabel color={textColor}>Contraseña</FormLabel>
            <Input
              type="password"
              placeholder="Tu contraseña"
              bg={inputBg}
              variant="filled"
              focusBorderColor="blue.400"
              color={textColor}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </FormControl>

          {/* Botón de inicio de sesión */}
          <Button
            type="submit"
            colorScheme="blue"
            width="full"
          >
            Iniciar Sesión
          </Button>

          {/* Opciones adicionales */}
          <Flex
            w="full"
            align="center"
            justify="space-between"
            fontSize="sm"
            color={useColorModeValue('gray.600', 'gray.300')}
          >
            <Link href="#" _hover={{ textDecoration: 'underline' }}>
              ¿Olvidaste tu contraseña?
            </Link>
            <Link onClick={() => redirect("/register")} _hover={{ textDecoration: 'underline' }}>
              Registrarse
            </Link>
          </Flex>
        </VStack>
      </Box>
    </Flex>
  );
};

export default LoginUser;
