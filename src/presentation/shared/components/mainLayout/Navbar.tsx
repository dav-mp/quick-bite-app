"use client"

import {
  Box,
  Flex,
  IconButton,
  Text,
  HStack,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useColorModeValue,
  useColorMode,
  Container,
  Button,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  VStack,
} from "@chakra-ui/react"
import { SandwichIcon as HamburgerIcon, BellIcon, SearchIcon, MoonIcon, SunIcon, LogOutIcon } from "lucide-react"
import { motion } from "framer-motion"
import CartIcon from "../cart/Cart"
import { removeUserCookies } from "../../../../app/infrastructure/service/CookiesService"
import { useNavigate } from "react-router-dom"

const MotionFlex = motion(Flex)
const MotionIconButton = motion(IconButton)

interface NavbarProps {
  onMobileMenuOpen: () => void
}

const logout = () => {
  removeUserCookies()
  setTimeout(() => {
    window.location.href = "/login-external"
  }, 1000)
}

export default function Navbar({ onMobileMenuOpen }: NavbarProps) {
  const { colorMode, toggleColorMode } = useColorMode()
  const { isOpen, onClose } = useDisclosure()
  const navigate = useNavigate()

  const bgColor = useColorModeValue("white", "gray.900")
  const textColor = useColorModeValue("gray.800", "white")
  const navbarShadow = useColorModeValue("0 4px 20px rgba(0,0,0,0.05)", "0 4px 20px rgba(0,0,0,0.2)")

  const iconButtonProps = {
    variant: "ghost",
    size: "md",
    borderRadius: "full",
    _hover: { bg: useColorModeValue("pink.50", "whiteAlpha.100") },
  }

  return (
    <Box
      as="nav"
      position="sticky"
      top="0"
      zIndex="1000"
      bg={bgColor}
      boxShadow={navbarShadow}
      backdropFilter="blur(10px)"
      backgroundColor={useColorModeValue("rgba(255, 255, 255, 0.8)", "rgba(26, 32, 44, 0.8)")}
    >
      <Container maxW="container.xl" py={3}>
        <Flex align="center" justify="space-between">
          {/* Logo and Mobile Menu */}
          <HStack spacing={4}>
            <IconButton
              display={{ base: "flex", md: "none" }}
              onClick={onMobileMenuOpen}
              aria-label="Open menu"
              icon={<HamburgerIcon />}
              {...iconButtonProps}
            />

            <MotionFlex
              align="center"
              cursor="pointer"
              onClick={() => navigate("/user/products")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Box
                bg="linear-gradient(135deg, #FF0080 0%, #7928CA 100%)"
                w="36px"
                h="36px"
                borderRadius="lg"
                display="flex"
                alignItems="center"
                justifyContent="center"
                mr={2}
              >
                <Text fontSize="lg" fontWeight="bold" color="white">
                  QB
                </Text>
              </Box>
              <Text
                fontSize="xl"
                fontWeight="extrabold"
                bgGradient="linear(to-r, pink.500, purple.500)"
                bgClip="text"
                display={{ base: "none", sm: "block" }}
              >
                QuickBite
              </Text>
            </MotionFlex>
          </HStack>

          {/* Desktop Navigation Links */}
          <HStack spacing={6} display={{ base: "none", md: "flex" }} color={textColor}>
            <Button
              variant="ghost"
              onClick={() => navigate("/user/products")}
              _hover={{ bg: "pink.50", color: "pink.500" }}
              fontWeight="medium"
            >
              Explore
            </Button>
            <Button
              variant="ghost"
              onClick={() => navigate("/user/orders")}
              _hover={{ bg: "pink.50", color: "pink.500" }}
              fontWeight="medium"
            >
              Orders
            </Button>
          </HStack>

          {/* Right Icons */}
          <HStack spacing={{ base: 2, md: 4 }}>
            <MotionIconButton
              aria-label={`Switch to ${colorMode === "light" ? "dark" : "light"} mode`}
              icon={colorMode === "light" ? <MoonIcon size={18} /> : <SunIcon size={18} />}
              onClick={toggleColorMode}
              whileHover={{ rotate: 15 }}
              whileTap={{ scale: 0.9 }}
              {...iconButtonProps}
            />

            <MotionIconButton
              aria-label="Search"
              icon={<SearchIcon size={18} />}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              {...iconButtonProps}
            />

            <MotionIconButton
              aria-label="Notifications"
              icon={<BellIcon size={18} />}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              {...iconButtonProps}
            />

            <CartIcon />

            <Menu>
              <MenuButton
                as={MotionIconButton}
                aria-label="User menu"
                icon={
                  <Avatar size="sm" name="User" bg="linear-gradient(135deg, #FF0080 0%, #7928CA 100%)" color="white" />
                }
                variant="ghost"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              />
              <MenuList shadow="lg" border="none" py={2} bg={useColorModeValue("white", "gray.800")}>
                <MenuItem
                  icon={<LogOutIcon size={16} />}
                  onClick={logout}
                  color="red.400"
                  _hover={{ bg: "red.50", color: "red.500" }}
                >
                  Logout
                </MenuItem>
              </MenuList>
            </Menu>
          </HStack>
        </Flex>
      </Container>

      {/* Mobile Menu Drawer */}
      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay backdropFilter="blur(10px)" />
        <DrawerContent>
          <DrawerHeader borderBottomWidth="1px" bg={useColorModeValue("pink.50", "gray.800")}>
            <Flex align="center">
              <Box
                bg="linear-gradient(135deg, #FF0080 0%, #7928CA 100%)"
                w="36px"
                h="36px"
                borderRadius="lg"
                display="flex"
                alignItems="center"
                justifyContent="center"
                mr={2}
              >
                <Text fontSize="lg" fontWeight="bold" color="white">
                  QB
                </Text>
              </Box>
              <Text fontSize="xl" fontWeight="extrabold" bgGradient="linear(to-r, pink.500, purple.500)" bgClip="text">
                QuickBite
              </Text>
            </Flex>
            <DrawerCloseButton />
          </DrawerHeader>
          <DrawerBody p={0}>
            <VStack align="stretch" spacing={0}>
              <Button
                variant="ghost"
                justifyContent="flex-start"
                py={6}
                borderRadius="0"
                onClick={() => {
                  navigate("/user/products")
                  onClose()
                }}
                _hover={{ bg: "pink.50", color: "pink.500" }}
              >
                Explore
              </Button>
              <Button
                variant="ghost"
                justifyContent="flex-start"
                py={6}
                borderRadius="0"
                onClick={() => {
                  navigate("/user/orders")
                  onClose()
                }}
                _hover={{ bg: "pink.50", color: "pink.500" }}
              >
                Orders
              </Button>
              <Button
                variant="ghost"
                justifyContent="flex-start"
                py={6}
                borderRadius="0"
                onClick={() => {
                  navigate("/user/favorites")
                  onClose()
                }}
                _hover={{ bg: "pink.50", color: "pink.500" }}
              >
                Favorites
              </Button>
              <Button
                variant="ghost"
                justifyContent="flex-start"
                py={6}
                borderRadius="0"
                onClick={() => {
                  navigate("/user/settings")
                  onClose()
                }}
                _hover={{ bg: "pink.50", color: "pink.500" }}
              >
                Settings
              </Button>
              <Button
                variant="ghost"
                justifyContent="flex-start"
                py={6}
                borderRadius="0"
                color="red.400"
                onClick={() => {
                  logout()
                  onClose()
                }}
                _hover={{ bg: "red.50", color: "red.500" }}
              >
                Logout
              </Button>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  )
}
