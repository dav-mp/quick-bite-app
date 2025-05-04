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
  HStack,
  Divider,
} from "@chakra-ui/react"
import { motion } from "framer-motion"
import { Eye, EyeOff, LogIn, Store, Lock, Coffee, ChefHat } from "lucide-react"
import useRedirect from "../../../../shared/hooks/useRedirect"
import { setDataCookies } from "../../../../../app/infrastructure/service/CookiesService"
import { DataCookies, UserType } from "../../../../../app/domain/models/cookies/DataCookies"
import { restaurantAuthUseCase } from "../../../../../app/infrastructure/DI/AuthRestaurantContainer"

const MotionBox = motion(Box)
const MotionFlex = motion(Flex)
const MotionButton = motion(Button)

const LoginRestaurant: React.FC = () => {
  const redirect = useRedirect()
  const [restaurantId, setRestaurantId] = useState("")
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
        description: `Verifying restaurant credentials`,
        status: "info",
        duration: 2000,
        isClosable: true,
      })

      // Llamamos al caso de uso de Auth para login de restaurante
      // Nota: Asumimos que hay un método específico para restaurantes o adaptamos el existente
      const restaurant = await restaurantAuthUseCase.loginRestaurant(restaurantId, password)
      console.log(restaurant)

      setDataCookies(DataCookies.ACCESSTOKEN, restaurant.session.token)
      setDataCookies(UserType.USER, UserType.RESTAURANT)

      // Si todo va bien, mostramos un toast de éxito
      toast({
        title: "Welcome back!",
        description: `Signed in as: ${restaurant.restaurant.name}`,
        status: "success",
        duration: 3000,
        isClosable: true,
      })

      // Redirige al dashboard de restaurante
      redirect("/restaurant/dashboard")
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
  const accentColor = useColorModeValue("teal.500", "teal.300")
  const secondaryColor = useColorModeValue("orange.500", "orange.300")

  return (
    <Flex
      minH="100vh"
      w="full"
      align="center"
      justify="center"
      p={4}
      bgImage="url('/warm-restaurant-interior.png')"
      bgSize="cover"
      bgPosition="center"
      position="relative"
    >
      {/* Overlay for better text readability */}
      <Box position="absolute" top={0} left={0} right={0} bottom={0} bg="blackAlpha.600" backdropFilter="blur(2px)" />

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
        position="relative"
        zIndex={1}
      >
        <MotionFlex
          direction="column"
          align="center"
          justify="center"
          bg="linear-gradient(135deg, #38B2AC 0%, #ED8936 100%)"
          p={6}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Box bg="white" borderRadius="full" p={2} mb={3} boxShadow="md">
            <ChefHat size={40} color="#38B2AC" />
          </Box>
          <Heading color="white" size="lg" textAlign="center">
            Restaurant Partner Portal
          </Heading>
          <Text color="whiteAlpha.900" fontSize="sm" mt={1}>
            Sign in to manage your restaurant
          </Text>
        </MotionFlex>

        <Box bg={cardBg} p={8}>
          <VStack spacing={6} as="form" onSubmit={handleSubmit}>
            <FormControl id="restaurantId" isRequired>
              <FormLabel color={textColor}>Restaurant ID</FormLabel>
              <InputGroup>
                <Input
                  type="text"
                  placeholder="Enter your restaurant ID"
                  bg={inputBg}
                  focusBorderColor="teal.400"
                  color={textColor}
                  value={restaurantId}
                  onChange={(e) => setRestaurantId(e.target.value)}
                  borderRadius="lg"
                  size="lg"
                  pl={10}
                />
                <Box position="absolute" left={3} top="50%" transform="translateY(-50%)" color={mutedTextColor}>
                  <Store size={18} />
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
                  focusBorderColor="teal.400"
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
                    colorScheme="teal"
                    onClick={() => setShowPassword(!showPassword)}
                  />
                </InputRightElement>
              </InputGroup>
            </FormControl>

            <MotionButton
              type="submit"
              colorScheme="teal"
              width="full"
              size="lg"
              leftIcon={<LogIn size={18} />}
              isLoading={isLoading}
              loadingText="Signing in..."
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              Sign In as Restaurant
            </MotionButton>

            <Divider />

            <VStack spacing={3} width="full">
              <Text fontSize="sm" color={mutedTextColor} textAlign="center">
                Need assistance with your restaurant account?
              </Text>

              <HStack width="full" justify="space-between">
                <Link color={accentColor} fontSize="sm" _hover={{ textDecoration: "underline" }}>
                  Forgot password?
                </Link>
                <Link color={secondaryColor} fontSize="sm" _hover={{ textDecoration: "underline" }}>
                  Contact support
                </Link>
              </HStack>
            </VStack>

            <Box pt={2} width="full">
              <Text fontSize="sm" color={mutedTextColor} textAlign="center">
                Not a restaurant partner yet?
              </Text>
              <Button
                variant="outline"
                colorScheme="teal"
                width="full"
                mt={2}
                leftIcon={<Coffee size={16} />}
                onClick={() => redirect("/restaurant/register")}
              >
                Join QuickBite
              </Button>
            </Box>
          </VStack>
        </Box>
      </MotionBox>
    </Flex>
  )
}

export default LoginRestaurant
