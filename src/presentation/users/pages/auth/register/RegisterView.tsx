import React, { useState } from 'react'
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
  Text,
  InputGroup,
  InputRightElement,
  IconButton,
  SimpleGrid,
  Image,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { Eye, EyeOff, UserPlus, User, Mail, Lock, Phone, MapPin, Calendar } from 'lucide-react'
import useRedirect from '../../../../shared/hooks/useRedirect'
import { authUseCase } from '../../../../../app/infrastructure/DI/AuthContainer'

const MotionBox = motion(Box)
const MotionFlex = motion(Flex)
const MotionButton = motion(Button)

const RegisterUser: React.FC = () => {
  const redirect = useRedirect()

  // Estados para cada uno de los campos
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [age, setAge] = useState<number | string>('')
  const [address, setAddress] = useState('')
  const [phone, setPhone] = useState('')
  const [userName, setUserName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  const toast = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Toast de info
      toast({
        title: 'Creating account...',
        description: `
Verifying
information
...`,
status: "info", duration
: 2000,
        isClosable: true,
      })

// Llamamos al caso de uso
const newUser = await authUseCase.register(name, email, password, Number(age), address, phone, userName)

// Si se registró correctamente
toast({
  title: "Account created!",
  description: `Welcome, ${newUser.fullName}`,
  status: "success",
  duration: 3000,
  isClosable: true,
})

// Redirigir a login
redirect("/login-external")

} catch (error: any)
{
  // Mostramos un toast con el error
  toast({
    title: "Registration failed",
    description: error.message || "An error occurred",
    status: "error",
    duration: 3000,
    isClosable: true,
  })
}
finally
{
  setIsLoading(false)
}
}

// Colors
const bgGradient = useColorModeValue(
  "linear-gradient(to bottom right, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.8))",
  "linear-gradient(to bottom right, rgba(23, 25, 35, 0.9), rgba(23, 25, 35, 0.8))",
)
const cardBg = useColorModeValue("white", "gray.800")
const textColor = useColorModeValue("gray.800", "white")
const mutedTextColor = useColorModeValue("gray.600", "gray.400")
const inputBg = useColorModeValue("gray.50", "gray.700")
const accentColor = useColorModeValue("pink.500", "pink.300")

return (
    <Flex
      minH="100vh"
      w="full"
      align="center"
      justify="center"
      p={4}
      bgImage="url('/placeholder.svg?key=novr0')"
      bgSize="cover"
      bgPosition="center"
    >
      <MotionBox
        bg={bgGradient}
        backdropFilter="blur(10px)"
        borderRadius="2xl"
        boxShadow="xl"
        overflow="hidden"
        w={{ base: 'full', md: '800px' }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <MotionFlex
          direction="column"
          align="center"
          justify="center"
          bg="linear-gradient(135deg, #FF0080 0%, #7928CA 100%)"
          p={6}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Box
            bg="white"
            borderRadius="full"
            p={2}
            mb={3}
            boxShadow="md"
          >
            <Image
              src="/placeholder.svg?key=j06cm"
              alt="QuickBite Logo"
              width="60px"
              height="60px"
            />
          </Box>
          <Heading color="white" size="lg" textAlign="center">
            Create Your Account
          </Heading>
          <Text color="whiteAlpha.900" fontSize="sm" mt={1}>
            Join QuickBite and discover amazing food
          </Text>
        </MotionFlex>

        <Box bg={cardBg} p={8}>
          <VStack spacing={6} as="form" onSubmit={handleSubmit}>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} width="full">
              <FormControl id="name" isRequired>
                <FormLabel color={textColor}>Full Name</FormLabel>
                <InputGroup>
                  <Input
                    type="text"
                    placeholder="Enter your full name"
                    bg={inputBg}
                    focusBorderColor="pink.400"
                    color={textColor}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    borderRadius="lg"
                    pl={10}
                  />
                  <Box position="absolute" left={3} top="50%" transform="translateY(-50%)" color={mutedTextColor}>
                    <User size={18} />
                  </Box>
                </InputGroup>
              </FormControl>

              <FormControl id="email" isRequired>
                <FormLabel color={textColor}>Email</FormLabel>
                <InputGroup>
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    bg={inputBg}
                    focusBorderColor="pink.400"
                    color={textColor}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    borderRadius="lg"
                    pl={10}
                  />
                  <Box position="absolute" left={3} top="50%" transform="translateY(-50%)" color={mutedTextColor}>
                    <Mail size={18} />
                  </Box>
                </InputGroup>
              </FormControl>

              <FormControl id="password" isRequired>
                <FormLabel color={textColor}>Password</FormLabel>
                <InputGroup>
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a password"
                    bg={inputBg}
                    focusBorderColor="pink.400"
                    color={textColor}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    borderRadius="lg"
                    pl={10}
                  />
                  <Box position="absolute" left={3} top="50%" transform="translateY(-50%)" color={mutedTextColor}>
                    <Lock size={18} />
                  </Box>
                  <InputRightElement>
                    <IconButton
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      icon={showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      variant="ghost"
                      colorScheme="pink"
                      onClick={() => setShowPassword(!showPassword)}
                    />
                  </InputRightElement>
                </InputGroup>
              </FormControl>

              <FormControl id="age" isRequired>
                <FormLabel color={textColor}>Age</FormLabel>
                <InputGroup>
                  <Input
                    type="number"
                    placeholder="Enter your age"
                    bg={inputBg}
                    focusBorderColor="pink.400"
                    color={textColor}
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    borderRadius="lg"
                    pl={10}
                  />
                  <Box position="absolute" left={3} top="50%" transform="translateY(-50%)" color={mutedTextColor}>
                    <Calendar size={18} />
                  </Box>
                </InputGroup>
              </FormControl>

              <FormControl id="address" isRequired>
                <FormLabel color={textColor}>Address</FormLabel>
                <InputGroup>
                  <Input
                    type="text"
                    placeholder="Enter your address"
                    bg={inputBg}
                    focusBorderColor="pink.400"
                    color={textColor}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    borderRadius="lg"
                    pl={10}
                  />
                  <Box position="absolute" left={3} top="50%" transform="translateY(-50%)" color={mutedTextColor}>
                    <MapPin size={18} />
                  </Box>
                </InputGroup>
              </FormControl>

              <FormControl id="phone" isRequired>
                <FormLabel color={textColor}>Phone</FormLabel>
                <InputGroup>
                  <Input
                    type="text"
                    placeholder="Enter your phone number"
                    bg={inputBg}
                    focusBorderColor="pink.400"
                    color={textColor}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    borderRadius="lg"
                    pl={10}
                  />
                  <Box position="absolute" left={3} top="50%" transform="translateY(-50%)" color={mutedTextColor}>
                    <Phone size={18} />
                  </Box>
                </InputGroup>
              </FormControl>

              <FormControl id="userName">
                <FormLabel color={textColor}>Username (optional)</FormLabel>
                <InputGroup>
                  <Input
                    type="text"
                    placeholder="Choose a username"
                    bg={inputBg}
                    focusBorderColor="pink.400"
                    color={textColor}
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    borderRadius="lg"
                    pl={10}
                  />
                  <Box position="absolute" left={3} top="50%" transform="translateY(-50%)" color={mutedTextColor}>
                    <User size={18} />
                  </Box>
                </InputGroup>
              </FormControl>
            </SimpleGrid>

            <MotionButton
              type="submit"
              colorScheme="pink"
              width="full"
              size="lg"
              leftIcon={<UserPlus size={18} />}
              isLoading={isLoading}
              loadingText="Creating account..."
              mt={4}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              Create Account
            </MotionButton>

            <Flex
              w="full"
              align="center"
              justify="center"
              fontSize="sm"
              color={mutedTextColor}
            >
              <Text mr={1}>Already have an account?</Text>
              <Link 
                onClick={() => redirect("/login-external")} 
                color={accentColor}
                _hover={{ textDecoration: 'underline' }}
                fontWeight="medium"
              >
                Sign In
              </Link>
            </Flex>
          </VStack>
        </Box>
      </MotionBox>
    </Flex>
  )
}

export default RegisterUser
