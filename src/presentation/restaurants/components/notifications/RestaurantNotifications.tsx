"use client"

import { useEffect, useCallback, useState } from "react"
import {
  Box,
  Flex,
  Text,
  useToast,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  VStack,
  Badge,
  Avatar,
  Button,
  Divider,
  useColorModeValue,
  HStack,
} from "@chakra-ui/react"
import { motion, AnimatePresence } from "framer-motion"
import { Bell, ShoppingBag, Clock, CheckCircle, AlertCircle } from "lucide-react"
import { webSocketService } from "../../../../app/infrastructure/service/WebSocketService"
import { getJWTDataDecoded } from "../../../../app/infrastructure/service/JWTDecoded"
import { StatusOrder, type TransformedOrder } from "../../../../app/domain/models/oreder/Order"
import { orderUseCase } from "../../../../app/infrastructure/DI/OrderContainer"

const MotionBox = motion(Box)
const MotionFlex = motion(Flex)

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

export default function RestaurantNotifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [_activeOrders, setActiveOrders] = useState<TransformedOrder[]>([])
  const { isOpen, onOpen, onClose } = useDisclosure()
  const toast = useToast()

  // Colors
  const accentColor = useColorModeValue("teal.500", "teal.300")
  const hoverBgColor = useColorModeValue("gray.50", "gray.700")
  const mutedTextColor = useColorModeValue("gray.600", "gray.400")

  const fetchActiveOrders = useCallback(async () => {
    try {
      const restaurant = getJWTDataDecoded<Record<string, any>>()
      const orders = await orderUseCase.getActiveOrders({
        restaurantId: restaurant.sub,
      })
      setActiveOrders(orders)
    } catch (error) {
      console.error("Error fetching active orders:", error)
    }
  }, [])

  const handleWebSocketMessage = useCallback(
    (data: any) => {
      console.log("WebSocket message received:", data)

      if (data.event === "new_order" && data.order) {
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
              {/* Barra superior de color */}
              <Box h="4px" bg={accentColor} w="full" />

              {/* Contenido principal */}
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
      } else if (data.event === "order_status_changed" && data.order) {
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
    [toast, fetchActiveOrders],
  )

  useEffect(() => {
    // Setup WebSocket connection
    const restaurant = getJWTDataDecoded<Record<string, any>>()
    if (restaurant && restaurant.sub) {
      webSocketService.registerClient("restaurant", restaurant.sub)
      webSocketService.addMessageListener(handleWebSocketMessage)

      // Initial fetch of active orders
      fetchActiveOrders()
    }

    // Cleanup
    return () => {
      webSocketService.removeMessageListener(handleWebSocketMessage)
    }
  }, [handleWebSocketMessage, fetchActiveOrders])

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
    <>
      <Box position="relative" display="inline-block">
        <Button
          aria-label="Notifications"
          leftIcon={<Bell size={18} />}
          variant="ghost"
          onClick={onOpen}
          position="relative"
          _hover={{ bg: `${accentColor}22` }}
        >
          Notifications
          {unreadCount > 0 && (
            <AnimatePresence>
              <MotionBox
                position="absolute"
                top="-2px"
                right="-2px"
                borderRadius="full"
                bg="red.500"
                color="white"
                fontSize="0.8em"
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
        </Button>
      </Box>

      <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="md">
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
    </>
  )
}
