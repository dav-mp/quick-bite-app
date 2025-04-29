"use client"

import type React from "react"
import { useState } from "react"
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
  Image,
} from "@chakra-ui/react"
import { motion } from "framer-motion"
import { Eye, EyeOff, LogIn, User, Lock } from "lucide-react"
import useRedirect from "../../../../shared/hooks/useRedirect"
import { authUseCase } from "../../../../../app/infrastructure/DI/AuthContainer"
import { setDataCookies } from "../../../../../app/infrastructure/service/CookiesService"
import { DataCookies, UserType } from "../../../../../app/domain/models/cookies/DataCookies"

const MotionBox = motion(Box)
const MotionFlex = motion(Flex)
const MotionButton = motion(Button)

const LoginUser: React.FC = () => {
  const redirect = useRedirect()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const toast = useToast()

  // Maneja el envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Toast informando que iniciaremos la sesión
      toast({
        title: "Signing in...",
        description: `Verifying credentials`,
        status: "info",
        duration: 2000,
        isClosable: true,
      })

      // Llamamos al caso de uso de Auth para login
      const user = await authUseCase.login(email, password)
      console.log(user)

      setDataCookies(DataCookies.ACCESSTOKEN, user.accessToken)
      setDataCookies(DataCookies.EMAIL, user.email)
      setDataCookies(DataCookies.REFRESHTOKEN, user.refreshToken)
      setDataCookies(DataCookies.USERNAME, user.fullName)
      setDataCookies(UserType.USER, UserType.USER)

      // Si todo va bien, mostramos un toast de éxito
      toast({
        title: "Welcome back!",
        description: `Signed in as: ${user.fullName}`,
        status: "success",
        duration: 3000,
        isClosable: true,
      })

      // Redirige a donde necesites, por ejemplo, a la ruta "/dashboard"
      redirect("/user/products")
    } catch (error: any) {
      // Si ocurre un error, mostramos un toast de error
      toast({
        title: "Sign in failed",
        description: error?.message || "An error occurred during authentication",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
    } finally {
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
        w={{ base: "full", sm: "450px" }}
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
          <Box bg="white" borderRadius="full" p={2} mb={3} boxShadow="md">
            <Image src="/placeholder.svg?key=j06cm" alt="QuickBite Logo" width="60px" height="60px" />
          </Box>
          <Heading color="white" size="lg" textAlign="center">
            Welcome to QuickBite
          </Heading>
          <Text color="whiteAlpha.900" fontSize="sm" mt={1}>
            Sign in to continue
          </Text>
        </MotionFlex>

        <Box bg={cardBg} p={8}>
          <VStack spacing={6} as="form" onSubmit={handleSubmit}>
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
                  size="lg"
                  pl={10}
                />
                <Box position="absolute" left={3} top="50%" transform="translateY(-50%)" color={mutedTextColor}>
                  <User size={18} />
                </Box>
              </InputGroup>
            </FormControl>

            <FormControl id="password" isRequired>
              <FormLabel color={textColor}>Password</FormLabel>
              <InputGroup>
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  bg={inputBg}
                  focusBorderColor="pink.400"
                  color={textColor}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  borderRadius="lg"
                  size="lg"
                  pl={10}
                />
                <Box position="absolute" left={3} top="50%" transform="translateY(-50%)" color={mutedTextColor}>
                  <Lock size={18} />
                </Box>
                <InputRightElement h="full">
                  <IconButton
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    icon={showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    variant="ghost"
                    colorScheme="pink"
                    onClick={() => setShowPassword(!showPassword)}
                  />
                </InputRightElement>
              </InputGroup>
            </FormControl>

            <MotionButton
              type="submit"
              colorScheme="pink"
              width="full"
              size="lg"
              leftIcon={<LogIn size={18} />}
              isLoading={isLoading}
              loadingText="Signing in..."
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              Sign In
            </MotionButton>

            <Flex w="full" align="center" justify="space-between" fontSize="sm" color={mutedTextColor}>
              <Link color={accentColor} _hover={{ textDecoration: "underline" }}>
                Forgot password?
              </Link>
              <Link onClick={() => redirect("/register")} color={accentColor} _hover={{ textDecoration: "underline" }}>
                Create account
              </Link>
            </Flex>
          </VStack>
        </Box>
      </MotionBox>
    </Flex>
  )
}

export default LoginUser
