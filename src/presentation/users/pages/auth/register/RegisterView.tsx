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

const RegisterUser: React.FC = () => {

    const redirect = useRedirect();


    // Estados para cada uno de los campos
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [age, setAge] = useState<number | string>('');
    const [address, setAddress] = useState('');
    const [phone, setPhone] = useState('');
    const [userName, setUserName] = useState('');

    const toast = useToast();

    // Maneja el envío del formulario
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Aquí iría la lógica para llamar a tu backend y procesar el registro
        console.log({
        name,
        email,
        password,
        age,
        address,
        phone,
        userName,
        });

        toast({
        title: 'Intentando registrar usuario...',
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
            <Heading as="h1" size="lg" textAlign="center" color={textColor}>
                Registro de Usuario
            </Heading>

            {/* Campo: Nombre */}
            <FormControl id="name" isRequired>
                <FormLabel color={textColor}>Nombre</FormLabel>
                <Input
                type="text"
                placeholder="Ingresa tu nombre completo"
                bg={inputBg}
                variant="filled"
                focusBorderColor="blue.400"
                color={textColor}
                value={name}
                onChange={(e) => setName(e.target.value)}
                />
            </FormControl>

            {/* Campo: Email */}
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

            {/* Campo: Contraseña */}
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

            {/* Campo: Edad */}
            <FormControl id="age" isRequired>
                <FormLabel color={textColor}>Edad</FormLabel>
                <Input
                type="number"
                placeholder="Ingresa tu edad"
                bg={inputBg}
                variant="filled"
                focusBorderColor="blue.400"
                color={textColor}
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                />
            </FormControl>

            {/* Campo: Dirección */}
            <FormControl id="address" isRequired>
                <FormLabel color={textColor}>Dirección</FormLabel>
                <Input
                type="text"
                placeholder="Ingresa tu dirección"
                bg={inputBg}
                variant="filled"
                focusBorderColor="blue.400"
                color={textColor}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                />
            </FormControl>

            {/* Campo: Teléfono */}
            <FormControl id="phone" isRequired>
                <FormLabel color={textColor}>Teléfono</FormLabel>
                <Input
                type="text"
                placeholder="Ingresa tu teléfono"
                bg={inputBg}
                variant="filled"
                focusBorderColor="blue.400"
                color={textColor}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                />
            </FormControl>

            {/* Campo: UserName (opcional) */}
            <FormControl id="userName">
                <FormLabel color={textColor}>Nombre de usuario (opcional)</FormLabel>
                <Input
                type="text"
                placeholder="Máximo 10 caracteres"
                bg={inputBg}
                variant="filled"
                focusBorderColor="blue.400"
                color={textColor}
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                />
            </FormControl>

            {/* Botón de registro */}
            <Button type="submit" colorScheme="blue" width="full">
                Registrar
            </Button>

            {/* Link para iniciar sesión (opcional) */}
            <Flex
                w="full"
                align="center"
                justify="center"
                fontSize="sm"
                color={useColorModeValue('gray.600', 'gray.300')}
            >
                <Link onClick={() => redirect("/login-external")} _hover={{ textDecoration: 'underline' }}>
                ¿Ya tienes cuenta? Inicia sesión
                </Link>
            </Flex>
            </VStack>
        </Box>
        </Flex>
    );
};

export default RegisterUser;
