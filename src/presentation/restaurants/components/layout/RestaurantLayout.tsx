"use client"

import { useEffect, useCallback, useState } from "react"
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
  useToast,
  Button,
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
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Outlet, useNavigate, useLocation } from "react-router-dom"
import { removeUserCookies } from "../../../../app/infrastructure/service/CookiesService"
import { webSocketService } from "../../../../app/infrastructure/service/WebSocketService"
import { getJWTDataDecoded } from "../../../../app/infrastructure/service/JWTDecoded"
import { StatusOrder } from "../../../../app/domain/models/oreder/Order"
import { orderUseCase } from "../../../../app/infrastructure/DI/OrderContainer"

const MotionFlex = motion(Flex)
const MotionIconButton = motion(IconButton)
const MotionBox = motion(Box)

interface NotificationItem {
  id: string
  title: string
  message: string
  timestamp: Date
  orderId: string
  status: StatusOrder
  isRead: boolean
  customerName?: string
  orderTotal?: number
}

export default function RestaurantLayout() {
  const { colorMode, toggleColorMode } = useColorMode()
  const { isOpen: isSidebarOpen, onOpen: onSidebarOpen, onClose: onSidebarClose } = useDisclosure()
  const { isOpen: isNotificationsOpen, onOpen: onNotificationsOpen, onClose: onNotificationsClose } = useDisclosure()
  const navigate = useNavigate()
  const location = useLocation()
  const toast = useToast()

  // Notification state
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  // Colors
  const bgColor = useColorModeValue("white", "gray.900")
  const textColor = useColorModeValue("gray.800", "white")
  const navbarShadow = useColorModeValue("0 4px 20px rgba(0,0,0,0.05)", "0 4px 20px rgba(0,0,0,0.2)")
  const sidebarBg = useColorModeValue("white", "gray.900")
  const sidebarBorderColor = useColorModeValue("gray.200", "gray.700")
  const accentColor = useColorModeValue("teal.500", "teal.300")
  const mutedTextColor = useColorModeValue("gray.600", "gray.400")
  const activeBg = useColorModeValue("teal.50", "teal.900")
  const hoverBgColor = useColorModeValue("gray.50", "gray.700")

  const iconButtonProps = {
    variant: "ghost",
    size: "md",
    borderRadius: "full",
    _hover: { bg: useColorModeValue("teal.50", "whiteAlpha.100") },
  }

  const menuItems = [
    { name: "Dashboard", icon: Home, path: "/restaurant/dashboard" },
    { name: "Orders", icon: ShoppingBag, path: "/restaurant/dashboard", badge: unreadCount },
    { name: "Products", icon: Package, path: "/restaurant/products" },
    { name: "Order History", icon: BarChart2, path: "/restaurant/orders" },
    { name: "Settings", icon: Settings, path: "/restaurant/settings" },
  ]

  const fetchActiveOrders = useCallback(async () => {
    try {
      const restaurant = getJWTDataDecoded<Record<string, any>>()
      if (restaurant && restaurant.id) {
        await orderUseCase.getActiveOrders({
          restaurantId: restaurant.id,
        })
      }
    } catch (error) {
      console.error("Error fetching active orders:", error)
    }
  }, [])

  // Update the handleWebSocketMessage function to handle the correct event name and message format
  const handleWebSocketMessage = useCallback(
    (data: any) => {
      console.log("WebSocket message received in layout:", data)

      // Handle order_created event (new format)
      if (data.event === "order_created" && data.order) {
        // Create a new notification
        const newNotification: NotificationItem = {
          id: crypto.randomUUID(),
          title: "New Order Received",
          message: `Order #${data.order.id.substring(0, 8).toUpperCase()} has been placed`,
          timestamp: new Date(),
          orderId: data.order.id,
          status: data.order.status.toUpperCase() as StatusOrder, // Convert to uppercase to match enum
          isRead: false,
          customerName: data.order.Customer?.name,
          orderTotal: data.order.totalPrice,
        }

        // Update notifications state
        setNotifications((prev) => [newNotification, ...prev])
        setUnreadCount((prev) => prev + 1)

        // Show toast notification
        toast({
          position: "top-right",
          duration: 6000,
          isClosable: true,
          render: () => (
            <Box
              color="white"
              p={0}
              borderRadius="xl"
              boxShadow={`0 4px 20px 0 ${accentColor}50, 0 0 0 1px ${accentColor}30`}
              maxW="sm"
              overflow="hidden"
              border={`2px solid ${accentColor}`}
              animation="pulse 2s infinite"
              sx={{
                "@keyframes pulse": {
                  "0%": { boxShadow: `0 4px 20px 0 ${accentColor}50, 0 0 0 1px ${accentColor}30` },
                  "50%": { boxShadow: `0 4px 25px 5px ${accentColor}70, 0 0 0 1px ${accentColor}50` },
                  "100%": { boxShadow: `0 4px 20px 0 ${accentColor}50, 0 0 0 1px ${accentColor}30` },
                },
              }}
            >
              {/* Color bar at top */}
              <Box h="4px" bg={accentColor} w="full" />

              {/* Main content */}
              <Box p={4} bg="gray.900" position="relative">
                <Flex alignItems="center">
                  <Box
                    borderRadius="full"
                    bg={`${accentColor}30`}
                    p={2.5}
                    mr={3}
                    boxShadow={`0 0 0 2px ${accentColor}50`}
                  >
                    <ShoppingBag color={accentColor} size={20} />
                  </Box>
                  <Box flex="1">
                    <HStack justify="space-between" mb={1}>
                      <Text fontWeight="bold" fontSize="md">
                        New Order Received
                      </Text>
                      <Text fontSize="xs" color="gray.400">
                        {new Date().toLocaleTimeString()}
                      </Text>
                    </HStack>
                    <Text fontSize="sm">
                      Order{" "}
                      <Text as="span" fontWeight="bold" color={accentColor}>
                        #{data.order.id.substring(0, 8).toUpperCase()}
                      </Text>{" "}
                      has been placed
                    </Text>
                    {data.order.totalPrice && (
                      <Text fontSize="sm" mt={1}>
                        Total:{" "}
                        <Text as="span" fontWeight="bold" color={accentColor}>
                          ${data.order.totalPrice.toFixed(2)}
                        </Text>
                      </Text>
                    )}
                  </Box>
                </Flex>
              </Box>
            </Box>
          ),
        })

        // Refresh active orders
        fetchActiveOrders()
      }
      // Handle new_order event (original format)
      else if (data.event === "new_order" && data.order) {
        // Create a new notification
        const newNotification: NotificationItem = {
          id: crypto.randomUUID(),
          title: "New Order Received",
          message: `Order #${data.order.id.substring(0, 8).toUpperCase()} has been placed`,
          timestamp: new Date(),
          orderId: data.order.id,
          status: data.order.status,
          isRead: false,
          customerName: data.order.Customer?.name,
          orderTotal: data.order.totalPrice,
        }

        // Update notifications state
        setNotifications((prev) => [newNotification, ...prev])
        setUnreadCount((prev) => prev + 1)

        // Show toast notification
        toast({
          position: "top-right",
          duration: 6000,
          isClosable: true,
          render: () => (
            <Box
              color="white"
              p={0}
              borderRadius="xl"
              boxShadow={`0 4px 20px 0 ${accentColor}50, 0 0 0 1px ${accentColor}30`}
              maxW="sm"
              overflow="hidden"
              border={`2px solid ${accentColor}`}
              animation="pulse 2s infinite"
              sx={{
                "@keyframes pulse": {
                  "0%": { boxShadow: `0 4px 20px 0 ${accentColor}50, 0 0 0 1px ${accentColor}30` },
                  "50%": { boxShadow: `0 4px 25px 5px ${accentColor}70, 0 0 0 1px ${accentColor}50` },
                  "100%": { boxShadow: `0 4px 20px 0 ${accentColor}50, 0 0 0 1px ${accentColor}30` },
                },
              }}
            >
              {/* Color bar at top */}
              <Box h="4px" bg={accentColor} w="full" />

              {/* Main content */}
              <Box p={4} bg="gray.900" position="relative">
                <Flex alignItems="center">
                  <Box
                    borderRadius="full"
                    bg={`${accentColor}30`}
                    p={2.5}
                    mr={3}
                    boxShadow={`0 0 0 2px ${accentColor}50`}
                  >
                    <ShoppingBag color={accentColor} size={20} />
                  </Box>
                  <Box flex="1">
                    <HStack justify="space-between" mb={1}>
                      <Text fontWeight="bold" fontSize="md">
                        New Order Received
                      </Text>
                      <Text fontSize="xs" color="gray.400">
                        {new Date().toLocaleTimeString()}
                      </Text>
                    </HStack>
                    <Text fontSize="sm">
                      Order{" "}
                      <Text as="span" fontWeight="bold" color={accentColor}>
                        #{data.order.id.substring(0, 8).toUpperCase()}
                      </Text>{" "}
                      has been placed
                      {data.order.Customer?.name && (
                        <Text as="span">
                          {" "}
                          by{" "}
                          <Text as="span" fontWeight="bold">
                            {data.order.Customer.name}
                          </Text>
                        </Text>
                      )}
                    </Text>
                    {data.order.totalPrice && (
                      <Text fontSize="sm" mt={1}>
                        Total:{" "}
                        <Text as="span" fontWeight="bold" color={accentColor}>
                          ${data.order.totalPrice.toFixed(2)}
                        </Text>
                      </Text>
                    )}
                  </Box>
                </Flex>
              </Box>
            </Box>
          ),
        })

        // Refresh active orders
        fetchActiveOrders()
      }
      // Handle order_status_changed event
      else if (data.event === "order_status_changed" && data.order) {
        // Create a notification for status change
        const newNotification: NotificationItem = {
          id: crypto.randomUUID(),
          title: "Order Status Updated",
          message: `Order #${data.order.id.substring(0, 8).toUpperCase()} status changed to ${data.order.status}`,
          timestamp: new Date(),
          orderId: data.order.id,
          status: data.order.status,
          isRead: false,
        }

        // Update notifications state
        setNotifications((prev) => [newNotification, ...prev])
        setUnreadCount((prev) => prev + 1)

        // Show toast notification
        toast({
          title: "Order Status Updated",
          description: `Order #${data.order.id.substring(0, 8).toUpperCase()} status changed to ${data.order.status}`,
          status: "info",
          duration: 5000,
          isClosable: true,
          position: "top-right",
        })

        // Refresh active orders
        fetchActiveOrders()
      }
    },
    [toast, fetchActiveOrders, accentColor],
  )

  useEffect(() => {
    // Setup WebSocket connection
    const restaurant = getJWTDataDecoded<Record<string, any>>()
    if (restaurant && restaurant.id) {
      webSocketService.registerClient("restaurant", restaurant.id)
      webSocketService.addMessageListener(handleWebSocketMessage)

      // Initial fetch of active orders
      fetchActiveOrders()
    }

    // Cleanup
    return () => {
      webSocketService.removeMessageListener(handleWebSocketMessage)
    }
  }, [handleWebSocketMessage, fetchActiveOrders])

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

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notification) => ({
        ...notification,
        isRead: true,
      })),
    )
    setUnreadCount(0)
  }

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id
          ? {
              ...notification,
              isRead: true,
            }
          : notification,
      ),
    )
    setUnreadCount((prev) => Math.max(0, prev - 1))
  }

  const getStatusIcon = (status: StatusOrder) => {
    switch (status) {
      case StatusOrder.Created:
        return <AlertCircle size={16} />
      case StatusOrder.Accepted:
        return <Clock size={16} />
      case StatusOrder.Finalized:
        return <CheckCircle size={16} />
      default:
        return <AlertCircle size={16} />
    }
  }

  const getStatusColor = (status: StatusOrder) => {
    switch (status) {
      case StatusOrder.Created:
        return "yellow"
      case StatusOrder.Accepted:
        return "blue"
      case StatusOrder.Finalized:
        return "green"
      default:
        return "gray"
    }
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
                onClick={onSidebarOpen}
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

              {/* Notification Button */}
              <Box position="relative">
                <MotionIconButton
                  aria-label="Notifications"
                  icon={
                    <Box position="relative">
                      <Bell size={18} />
                      {unreadCount > 0 && (
                        <AnimatePresence>
                          <MotionBox
                            position="absolute"
                            top="-6px"
                            right="-6px"
                            borderRadius="full"
                            bg="red.500"
                            color="white"
                            fontSize="0.6rem"
                            fontWeight="bold"
                            minW="1.6em"
                            h="1.6em"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          >
                            {unreadCount}
                          </MotionBox>
                        </AnimatePresence>
                      )}
                    </Box>
                  }
                  onClick={onNotificationsOpen}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  {...iconButtonProps}
                />
              </Box>

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
                {item.badge! > 0 && item.name === "Orders" && (
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
      <Drawer isOpen={isSidebarOpen} placement="left" onClose={onSidebarClose} size="xs">
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
                    onSidebarClose()
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
                  {item.badge! > 0 && item.name === "Orders" && (
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
                  onSidebarClose()
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

      {/* Notifications Drawer */}
      <Drawer isOpen={isNotificationsOpen} placement="right" onClose={onNotificationsClose} size="md">
        <DrawerOverlay backdropFilter="blur(5px)" />
        <DrawerContent>
          <DrawerHeader borderBottomWidth="1px" bg={`${accentColor}11`}>
            <Flex justify="space-between" align="center">
              <Text>Notifications</Text>
              {unreadCount > 0 && (
                <Button size="sm" variant="outline" colorScheme="teal" onClick={markAllAsRead}>
                  Mark all as read
                </Button>
              )}
            </Flex>
            <DrawerCloseButton />
          </DrawerHeader>
          <DrawerBody p={0}>
            {notifications.length === 0 ? (
              <MotionFlex
                direction="column"
                align="center"
                justify="center"
                h="full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  style={{
                    background: `${accentColor}22`,
                    padding: "1rem",
                    borderRadius: "9999px",
                    marginBottom: "1rem",
                    color: accentColor,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, 0, -5, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    repeatType: "loop",
                  }}
                >
                  <Bell size={24} />
                </motion.div>
                <Text fontWeight="medium" mb={1}>
                  No notifications yet
                </Text>
                <Text fontSize="sm" color={mutedTextColor} textAlign="center" maxW="250px">
                  New order notifications will appear here
                </Text>
              </MotionFlex>
            ) : (
              <VStack spacing={0} align="stretch" divider={<Divider />}>
                <AnimatePresence>
                  {notifications.map((notification) => (
                    <MotionFlex
                      key={notification.id}
                      p={4}
                      align="flex-start"
                      bg={notification.isRead ? "transparent" : `${accentColor}11`}
                      _hover={{
                        bg: hoverBgColor,
                      }}
                      position="relative"
                      overflow="hidden"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      onClick={() => markAsRead(notification.id)}
                      cursor="pointer"
                    >
                      {!notification.isRead && (
                        <Box
                          position="absolute"
                          left={0}
                          top="50%"
                          transform="translateY(-50%)"
                          width="3px"
                          height="60%"
                          bg={accentColor}
                          borderRightRadius="full"
                        />
                      )}

                      <Box borderRadius="full" bg={`${accentColor}22`} p={2} color={accentColor} mr={3} mt={1}>
                        <ShoppingBag size={18} />
                      </Box>

                      <Box flex="1">
                        <Flex justify="space-between" align="center" mb={1}>
                          <Text fontWeight="bold" fontSize="sm">
                            {notification.title}
                          </Text>
                          <Text fontSize="xs" color={mutedTextColor}>
                            {notification.timestamp.toLocaleTimeString()}
                          </Text>
                        </Flex>

                        <Text fontSize="sm" mb={2}>
                          {notification.message}
                        </Text>

                        <Flex justify="space-between" align="center">
                          <Badge
                            colorScheme={getStatusColor(notification.status)}
                            borderRadius="full"
                            px={2}
                            py={0.5}
                            display="flex"
                            alignItems="center"
                            gap={1}
                            fontSize="xs"
                          >
                            {getStatusIcon(notification.status)}
                            <Text>{notification.status}</Text>
                          </Badge>

                          {notification.customerName && (
                            <HStack>
                              <Avatar size="2xs" name={notification.customerName} />
                              <Text fontSize="xs">{notification.customerName}</Text>
                            </HStack>
                          )}

                          {notification.orderTotal && (
                            <Text fontSize="xs" fontWeight="bold" color={accentColor}>
                              ${notification.orderTotal.toFixed(2)}
                            </Text>
                          )}
                        </Flex>
                      </Box>
                    </MotionFlex>
                  ))}
                </AnimatePresence>
              </VStack>
            )}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Flex>
  )
}
