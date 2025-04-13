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
import { authUseCase } from '../../../../../app/infrastructure/DI/AuthContainer';
import { setDataCookies } from '../../../../../app/infrastructure/service/CookiesService';
import { DataCookies } from '../../../../../app/domain/models/cookies/DataCookies';

// Ajusta la ruta de import según la ubicación real de tu archivo AuthContainer

const LoginUser: React.FC = () => {
  const redirect = useRedirect();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const toast = useToast();

  // Maneja el envío del formulario (ahora es async)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Opcional: Toast informando que iniciaremos la sesión
      toast({
        title: 'Iniciando sesión...',
        description: `Verificando credenciales`,
        status: 'info',
        duration: 2000,
        isClosable: true,
      });

      // Llamamos al caso de uso de Auth para login
      const user = await authUseCase.login(email, password);
      console.log(user);

      setDataCookies( DataCookies.ACCESSTOKEN, user.accessToken )
      setDataCookies( DataCookies.EMAIL, user.email )
      setDataCookies( DataCookies.REFESHTOKEN, user.refreshToken )
      setDataCookies( DataCookies.USERNAME, user.fullName )
      

      // Si todo va bien, mostramos un toast de éxito
      toast({
        title: 'Sesión iniciada',
        description: `Bienvenido: ${user.fullName}`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      // Redirige a donde necesites, por ejemplo, a la ruta "/dashboard"
      redirect('/dashboard');

    } catch (error: any) {
      // Si ocurre un error, mostramos un toast de error
      toast({
        title: 'Error al iniciar sesión',
        description: error?.message || 'Ocurrió un error al autenticar',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Paleta de colores
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
          <Heading as="h1" size="lg" textAlign="center" color={textColor}>
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
          <Button type="submit" colorScheme="blue" width="full">
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
