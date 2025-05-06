"use client"

import { useState } from "react"
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
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  VStack,
  Divider,
  Heading,
  Badge,
} from "@chakra-ui/react"
import {
  MenuIcon,
  Bell,
  Search,
  Moon,
  Sun,
  LogOut,
  Home,
  Package,
  ShoppingBag,
  BarChart2,
  Settings,
  ChevronRight,
} from "lucide-react"
import { motion } from "framer-motion"
import { Outlet, useNavigate, useLocation } from "react-router-dom"
import { removeUserCookies } from "../../../../app/infrastructure/service/CookiesService"
import { webSocketService } from "../../../../app/infrastructure/service/WebSocketService"

const MotionFlex = motion(Flex)
const MotionIconButton = motion(IconButton)
const MotionBox = motion(Box)

export default function RestaurantLayout() {
  const { colorMode, toggleColorMode } = useColorMode()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const navigate = useNavigate()
  const location = useLocation()
  const [notifications, setNotifications] = useState(2) // Example notification count

  // Colors
  const bgColor = useColorModeValue("white", "gray.900")
  const textColor = useColorModeValue("gray.800", "white")
  const navbarShadow = useColorModeValue("0 4px 20px rgba(0,0,0,0.05)", "0 4px 20px rgba(0,0,0,0.2)")
  const sidebarBg = useColorModeValue("white", "gray.900")
  const sidebarBorderColor = useColorModeValue("gray.200", "gray.700")
  const accentColor = useColorModeValue("teal.500", "teal.300")
  const mutedTextColor = useColorModeValue("gray.600", "gray.400")
  const activeBg = useColorModeValue("teal.50", "teal.900")

  const iconButtonProps = {
    variant: "ghost",
    size: "md",
    borderRadius: "full",
    _hover: { bg: useColorModeValue("teal.50", "whiteAlpha.100") },
  }

  const menuItems = [
    { name: "Dashboard", icon: Home, path: "/restaurant/dashboard" },
    { name: "Orders", icon: ShoppingBag, path: "/restaurant/dashboard", badge: notifications },
    { name: "Products", icon: Package, path: "/restaurant/products" },
    { name: "Order History", icon: BarChart2, path: "/restaurant/orders" },
    { name: "Settings", icon: Settings, path: "/restaurant/settings" },
  ]

  const handleLogout = () => {
    // Close WebSocket connection
    webSocketService.closeConnection()

    // Remove cookies
    removeUserCookies()

    // Navigate to login
    navigate("/login-restaurant")
  }

  const isActive = (path: string) => {
    return location.pathname === path
  }

  return (
    <Flex h="100vh" flexDirection="column">
      {/* Top Navbar */}
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
                onClick={onOpen}
                aria-label="Open menu"
                icon={<MenuIcon />}
                {...iconButtonProps}
              />

              <MotionFlex
                align="center"
                cursor="pointer"
                onClick={() => navigate("/restaurant/dashboard")}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Box
                  bg="linear-gradient(135deg, #38B2AC 0%, #805AD5 100%)"
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
                <Box>
                  <Text
                    fontSize="xl"
                    fontWeight="extrabold"
                    bgGradient="linear(to-r, teal.500, purple.500)"
                    bgClip="text"
                    display={{ base: "none", sm: "block" }}
                  >
                    QuickBite
                  </Text>
                  <Badge colorScheme="teal" fontSize="xs">
                    Restaurant Portal
                  </Badge>
                </Box>
              </MotionFlex>
            </HStack>

            {/* Right Icons */}
            <HStack spacing={{ base: 2, md: 4 }}>
              <MotionIconButton
                aria-label={`Switch to ${colorMode === "light" ? "dark" : "light"} mode`}
                icon={colorMode === "light" ? <Moon size={18} /> : <Sun size={18} />}
                onClick={toggleColorMode}
                whileHover={{ rotate: 15 }}
                whileTap={{ scale: 0.9 }}
                {...iconButtonProps}
              />

              <MotionIconButton
                aria-label="Search"
                icon={<Search size={18} />}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                {...iconButtonProps}
              />

              <Menu>
                <MenuButton
                  as={MotionIconButton}
                  aria-label="Notifications"
                  icon={
                    <Box position="relative">
                      <Bell size={18} />
                      {notifications > 0 && (
                        <Badge
                          position="absolute"
                          top="-6px"
                          right="-6px"
                          colorScheme="red"
                          borderRadius="full"
                          size="xs"
                          fontSize="0.6rem"
                        >
                          {notifications}
                        </Badge>
                      )}
                    </Box>
                  }
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  {...iconButtonProps}
                />
                <MenuList shadow="lg" border="none" py={2} bg={useColorModeValue("white", "gray.800")}>
                  <MenuItem>New order received</MenuItem>
                  <MenuItem>Order status updated</MenuItem>
                </MenuList>
              </Menu>

              <Menu>
                <MenuButton
                  as={MotionIconButton}
                  aria-label="User menu"
                  icon={
                    <Avatar
                      size="sm"
                      name="Restaurant"
                      bg="linear-gradient(135deg, #38B2AC 0%, #805AD5 100%)"
                      color="white"
                    />
                  }
                  variant="ghost"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                />
                <MenuList shadow="lg" border="none" py={2} bg={useColorModeValue("white", "gray.800")}>
                  <MenuItem icon={<Settings size={16} />}>Settings</MenuItem>
                  <MenuItem icon={<LogOut size={16} />} onClick={handleLogout} color="red.400">
                    Logout
                  </MenuItem>
                </MenuList>
              </Menu>
            </HStack>
          </Flex>
        </Container>
      </Box>

      {/* Main Content with Sidebar */}
      <Flex flex="1" overflow="hidden">
        {/* Sidebar - Desktop */}
        <Box
          as="aside"
          w="240px"
          bg={sidebarBg}
          borderRight="1px solid"
          borderColor={sidebarBorderColor}
          display={{ base: "none", md: "block" }}
          position="sticky"
          top="0"
          h="calc(100vh - 60px)"
          overflowY="auto"
        >
          <VStack spacing={1} align="stretch" p={4}>
            {menuItems.map((item) => (
              <MotionBox
                key={item.name}
                as="button"
                onClick={() => navigate(item.path)}
                py={3}
                px={4}
                borderRadius="md"
                bg={isActive(item.path) ? activeBg : "transparent"}
                color={isActive(item.path) ? accentColor : textColor}
                fontWeight={isActive(item.path) ? "semibold" : "normal"}
                textAlign="left"
                _hover={{ bg: activeBg }}
                whileHover={{ x: 5 }}
                whileTap={{ scale: 0.98 }}
                display="flex"
                alignItems="center"
                justifyContent="space-between"
              >
                <HStack spacing={3}>
                  <Box>
                    <item.icon size={18} />
                  </Box>
                  <Text>{item.name}</Text>
                </HStack>
                {item.badge && (
                  <Badge colorScheme="red" borderRadius="full">
                    {item.badge}
                  </Badge>
                )}
              </MotionBox>
            ))}

            <Divider my={4} />

            <MotionBox
              as="button"
              onClick={handleLogout}
              py={3}
              px={4}
              borderRadius="md"
              color="red.500"
              textAlign="left"
              _hover={{ bg: "red.50" }}
              whileHover={{ x: 5 }}
              whileTap={{ scale: 0.98 }}
              display="flex"
              alignItems="center"
            >
              <HStack spacing={3}>
                <Box>
                  <LogOut size={18} />
                </Box>
                <Text>Logout</Text>
              </HStack>
            </MotionBox>
          </VStack>
        </Box>

        {/* Main Content */}
        <Box flex="1" overflowY="auto" bg={useColorModeValue("gray.50", "gray.900")}>
          <MotionBox initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Outlet />
          </MotionBox>
        </Box>
      </Flex>

      {/* Mobile Drawer */}
      <Drawer isOpen={isOpen} placement="left" onClose={onClose} size="xs">
        <DrawerOverlay backdropFilter="blur(5px)" />
        <DrawerContent>
          <DrawerHeader borderBottomWidth="1px" borderColor={sidebarBorderColor}>
            <Flex align="center">
              <Box
                bg="linear-gradient(135deg, #38B2AC 0%, #805AD5 100%)"
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
              <Box>
                <Heading size="sm">QuickBite</Heading>
                <Text fontSize="xs" color={mutedTextColor}>
                  Restaurant Portal
                </Text>
              </Box>
            </Flex>
            <DrawerCloseButton />
          </DrawerHeader>
          <DrawerBody p={0}>
            <VStack spacing={0} align="stretch">
              {menuItems.map((item) => (
                <Flex
                  key={item.name}
                  as="button"
                  onClick={() => {
                    navigate(item.path)
                    onClose()
                  }}
                  py={4}
                  px={6}
                  borderBottomWidth="1px"
                  borderColor={sidebarBorderColor}
                  _hover={{ bg: activeBg }}
                  bg={isActive(item.path) ? activeBg : "transparent"}
                  color={isActive(item.path) ? accentColor : textColor}
                  fontWeight={isActive(item.path) ? "semibold" : "normal"}
                  align="center"
                  justify="space-between"
                >
                  <HStack spacing={3}>
                    <Box>
                      <item.icon size={18} />
                    </Box>
                    <Text>{item.name}</Text>
                  </HStack>
                  {item.badge && (
                    <Badge colorScheme="red" borderRadius="full">
                      {item.badge}
                    </Badge>
                  )}
                  <ChevronRight size={16} />
                </Flex>
              ))}

              <Divider />

              <Flex
                as="button"
                onClick={() => {
                  handleLogout()
                  onClose()
                }}
                py={4}
                px={6}
                color="red.500"
                align="center"
                _hover={{ bg: "red.50" }}
              >
                <HStack spacing={3}>
                  <Box>
                    <LogOut size={18} />
                  </Box>
                  <Text>Logout</Text>
                </HStack>
              </Flex>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Flex>
  )
}
