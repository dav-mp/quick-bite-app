"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import {
  Box,
  Container,
  Flex,
  Heading,
  Text,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Badge,
  Button,
  VStack,
  HStack,
  Avatar,
  useColorModeValue,
  Spinner,
  Center,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Divider,
  useToast,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
  InputGroup,
  InputLeftElement,
  Input,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Grid,
  GridItem,
  Image,
} from "@chakra-ui/react"
import { motion } from "framer-motion"
import {
  Clock,
  ChevronRight,
  Search,
  Calendar,
  ShoppingBag,
  CheckCircle,
  AlertCircle,
  XCircle,
  Filter,
  ArrowUpDown,
  RefreshCw,
  User,
  MapPin,
  Phone,
  DollarSign,
  Package,
  Printer,
} from "lucide-react"
import { orderUseCase } from "../../../../app/infrastructure/DI/OrderContainer"
import { getJWTDataDecoded } from "../../../../app/infrastructure/service/JWTDecoded"
import {
  type TransformedOrder,
  StatusOrder,
  type ChangeStatusOrderRequest,
  type SingleProductDetail,
  type KitDetail,
} from "../../../../app/domain/models/oreder/Order"
import { webSocketService } from "../../../../app/infrastructure/service/WebSocketService"

const MotionCard = motion(Card)
const MotionBox = motion(Box)

// Default images
const DEFAULT_PRODUCT_IMAGE =
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"

// Update the formatDate function to handle orderDate instead of createdAt when needed
const formatOrderDate = (dateString: string | number) => {
  const date = typeof dateString === "number" ? new Date(dateString * 1000) : new Date(dateString)
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export default function RestaurantDashboard() {
  const [activeOrders, setActiveOrders] = useState<TransformedOrder[]>([])
  const [allOrders, setAllOrders] = useState<TransformedOrder[]>([])
  const [loading, setLoading] = useState({
    active: true,
    all: true,
  })
  const [error, setError] = useState<string | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<TransformedOrder | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortNewest, setSortNewest] = useState(true)
  const [updatesAvailable, setUpdatesAvailable] = useState(false)
  const toast = useToast()

  // For status change confirmation
  const { isOpen: isStatusDialogOpen, onOpen: onStatusDialogOpen, onClose: onStatusDialogClose } = useDisclosure()
  const cancelRef = useRef<HTMLButtonElement>(null)
  const [newStatus, setNewStatus] = useState<StatusOrder | null>(null)

  // For order details modal
  const { isOpen: isDetailsModalOpen, onOpen: onDetailsModalOpen, onClose: onDetailsModalClose } = useDisclosure()

  const handleWebSocketMessage = useCallback(
    (data: any) => {
      console.log("WebSocket message received in dashboard:", data)

      // Handle order_created event (new format)
      if (data.event === "order_created" && data.order) {
        // Set updates available flag to show refresh button
        setUpdatesAvailable(true)

        // Automatically fetch new orders
        fetchOrders()
      }
      // Handle new_order event (original format)
      else if (data.event === "new_order" && data.order) {
        // Set updates available flag to show refresh button
        setUpdatesAvailable(true)

        // Automatically fetch new orders
        fetchOrders()
      }
      // Handle order_status_changed event
      else if (data.event === "order_status_changed" && data.order) {
        // Set updates available flag to show refresh button
        setUpdatesAvailable(true)

        // Automatically fetch new orders
        fetchOrders()
      }
    },
    [
      /* fetchOrders would normally be a dependency here, but it's defined in the component */
    ],
  )

  // Colors
  const accentColor = useColorModeValue("teal.500", "teal.300")
  const secondaryColor = useColorModeValue("purple.500", "purple.300")
  const subtleColor = useColorModeValue("gray.100", "gray.700")
  const mutedTextColor = useColorModeValue("gray.600", "gray.400")
  const borderColor = useColorModeValue("gray.200", "gray.700")
  const gradientStart = useColorModeValue("teal.50", "gray.700")
  const gradientEnd = useColorModeValue("purple.50", "gray.900")

  useEffect(() => {
    fetchOrders()

    // Setup WebSocket listener
    const restaurant = getJWTDataDecoded<Record<string, any>>()
    if (restaurant && restaurant.id) {
      webSocketService.addMessageListener(handleWebSocketMessage)
    }

    // Cleanup
    return () => {
      webSocketService.removeMessageListener(handleWebSocketMessage)
    }
  }, [handleWebSocketMessage])

  const fetchOrders = async () => {
    try {
      setLoading({ active: true, all: true })
      setError(null)
      setUpdatesAvailable(false)

      // Get restaurant ID from JWT
      const restaurant = getJWTDataDecoded<Record<string, any>>()

      // Fetch active orders
      const activeOrdersData = await orderUseCase.getActiveOrders({
        restaurantId: restaurant.id,
      })
      setActiveOrders(activeOrdersData)

      // Fetch all orders
      const allOrdersData = await orderUseCase.getAllOrdersRestaurant({
        restaurantId: restaurant.id,
      })
      console.log(allOrdersData)

      setAllOrders(allOrdersData)
    } catch (err: any) {
      console.error("Error fetching orders:", err)
      setError(err.message || "Failed to load orders")
    } finally {
      setLoading({ active: false, all: false })
    }
  }

  const handleChangeOrderStatus = async () => {
    if (!selectedOrder || !newStatus) return

    try {
      const restaurant = getJWTDataDecoded<Record<string, any>>()

      const request: ChangeStatusOrderRequest = {
        restaurantId: restaurant.id,
        orderId: selectedOrder.id,
        status: newStatus,
      }

      await orderUseCase.changeStatusOrder(request)

      toast({
        title: "Status Updated",
        description: `Order #${selectedOrder.id.substring(0, 8).toUpperCase()} status changed to ${newStatus}`,
        status: "success",
        duration: 3000,
        isClosable: true,
      })

      // Refresh orders
      fetchOrders()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update order status",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
    } finally {
      onStatusDialogClose()
      setNewStatus(null)
      setSelectedOrder(null)
    }
  }

  const confirmStatusChange = (order: TransformedOrder, status: StatusOrder) => {
    setSelectedOrder(order)
    setNewStatus(status)
    onStatusDialogOpen()
  }

  const openOrderDetails = (order: TransformedOrder) => {
    setSelectedOrder(order)
    onDetailsModalOpen()
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

  const getStatusIcon = (status: StatusOrder) => {
    switch (status) {
      case StatusOrder.Created:
        return <AlertCircle size={16} />
      case StatusOrder.Accepted:
        return <Clock size={16} />
      case StatusOrder.Finalized:
        return <CheckCircle size={16} />
      default:
        return <XCircle size={16} />
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const toggleSortOrder = () => {
    setSortNewest(!sortNewest)
  }

  // Filter and sort orders
  const getFilteredAndSortedOrders = (orders: TransformedOrder[]) => {
    return orders
      .filter((order) => {
        if (searchTerm === "") return true

        const searchLower = searchTerm.toLowerCase()
        const customerName = order.Customer?.name?.toLowerCase() || ""
        const orderId = order.id.toLowerCase()

        return customerName.includes(searchLower) || orderId.includes(searchLower)
      })
      .sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime()
        const dateB = new Date(b.createdAt).getTime()
        return sortNewest ? dateB - dateA : dateA - dateB
      })
  }

  const filteredActiveOrders = getFilteredAndSortedOrders(activeOrders)
  const filteredAllOrders = getFilteredAndSortedOrders(allOrders)

  // Calculate stats
  const totalSales = allOrders.reduce((sum, order) => sum + order.totalPrice, 0)
  const todayOrders = allOrders.filter(
    (order) => new Date(order.createdAt).toDateString() === new Date().toDateString(),
  )
  const todaySales = todayOrders.reduce((sum, order) => sum + order.totalPrice, 0)

  // Print order receipt
  const printOrderReceipt = () => {
    if (!selectedOrder) return

    // In a real implementation, this would format and print the receipt
    toast({
      title: "Printing Receipt",
      description: `Printing receipt for order #${selectedOrder.id.substring(0, 8).toUpperCase()}`,
      status: "info",
      duration: 3000,
      isClosable: true,
    })
  }

  return (
    <Container maxW="container.xl" py={6}>
      {/* Header Section */}
      <Box
        bg={`linear-gradient(135deg, ${accentColor}22 0%, ${secondaryColor}22 100%)`}
        borderRadius="xl"
        p={6}
        mb={6}
        position="relative"
        overflow="hidden"
      >
        <Box
          position="absolute"
          top="0"
          right="0"
          width="300px"
          height="300px"
          bg="rgba(255,255,255,0.1)"
          borderRadius="full"
          transform="translate(150px, -150px)"
        />

        <Heading
          as="h1"
          mb={2}
          fontWeight="extrabold"
          bgGradient={`linear(to-r, ${accentColor}, ${secondaryColor})`}
          bgClip="text"
          size="xl"
        >
          Restaurant Dashboard
        </Heading>
        <Text color={mutedTextColor}>Manage your orders and track your business</Text>
      </Box>

      {/* Stats Section */}
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={6}>
        <Card borderRadius="lg" boxShadow="md">
          <CardBody>
            <Stat>
              <StatLabel color={mutedTextColor}>Active Orders</StatLabel>
              <StatNumber fontSize="3xl" color={accentColor}>
                {activeOrders.length}
              </StatNumber>
              <StatHelpText>Orders requiring attention</StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card borderRadius="lg" boxShadow="md">
          <CardBody>
            <Stat>
              <StatLabel color={mutedTextColor}>Today's Sales</StatLabel>
              <StatNumber fontSize="3xl" color={accentColor}>
                ${todaySales.toFixed(2)}
              </StatNumber>
              <StatHelpText>{todayOrders.length} orders today</StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card borderRadius="lg" boxShadow="md">
          <CardBody>
            <Stat>
              <StatLabel color={mutedTextColor}>Total Sales</StatLabel>
              <StatNumber fontSize="3xl" color={accentColor}>
                ${totalSales.toFixed(2)}
              </StatNumber>
              <StatHelpText>{allOrders.length} total orders</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Search and Filter Section */}
      <Flex mb={6} justify="space-between" align="center" wrap="wrap" gap={4}>
        <InputGroup maxW={{ base: "full", md: "320px" }}>
          <InputLeftElement pointerEvents="none">
            <Search color={useColorModeValue("gray.400", "gray.300")} size={18} />
          </InputLeftElement>
          <Input
            placeholder="Search by customer or order ID"
            borderRadius="full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </InputGroup>

        <HStack>
          {updatesAvailable && (
            <Button
              leftIcon={<RefreshCw size={16} />}
              colorScheme="teal"
              size="sm"
              borderRadius="full"
              onClick={fetchOrders}
              _hover={{ transform: "rotate(180deg)", transition: "transform 0.5s" }}
            >
              Updates Available
            </Button>
          )}
          <Button
            leftIcon={<Filter size={16} />}
            variant="ghost"
            size="sm"
            borderRadius="full"
            _hover={{ bg: `${accentColor}22` }}
          >
            Filter
          </Button>
          <Button
            leftIcon={<ArrowUpDown size={16} />}
            variant="ghost"
            size="sm"
            borderRadius="full"
            onClick={toggleSortOrder}
            _hover={{ bg: `${accentColor}22` }}
          >
            {sortNewest ? "Newest First" : "Oldest First"}
          </Button>
        </HStack>
      </Flex>

      {/* Error State */}
      {error && (
        <Box bg="red.50" color="red.500" p={4} borderRadius="md" mb={6}>
          <Flex align="center">
            <AlertCircle size={20} style={{ marginRight: "8px" }} />
            <Text fontWeight="medium">{error}</Text>
          </Flex>
        </Box>
      )}

      {/* Tabs for Orders */}
      <Tabs colorScheme="teal" borderRadius="lg" variant="enclosed">
        <TabList>
          <Tab _selected={{ color: accentColor, borderColor: "currentColor" }}>Active Orders</Tab>
          <Tab _selected={{ color: accentColor, borderColor: "currentColor" }}>Order History</Tab>
        </TabList>

        <TabPanels>
          {/* Active Orders Tab */}
          <TabPanel px={0}>
            {loading.active ? (
              <Center py={10}>
                <VStack spacing={4}>
                  <Spinner size="xl" color={accentColor} thickness="4px" />
                  <Text color={mutedTextColor}>Loading active orders...</Text>
                </VStack>
              </Center>
            ) : filteredActiveOrders.length === 0 ? (
              <MotionBox
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                textAlign="center"
                py={10}
                px={6}
                borderRadius="xl"
                bg={`linear-gradient(135deg, ${gradientStart} 0%, ${gradientEnd} 100%)`}
              >
                <Box
                  bg={`${accentColor}22`}
                  p={4}
                  borderRadius="full"
                  width="80px"
                  height="80px"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  margin="0 auto"
                  mb={4}
                >
                  <CheckCircle size={32} color={accentColor} />
                </Box>
                <Heading size="lg" mb={2}>
                  No Active Orders
                </Heading>
                <Text color={mutedTextColor} maxW="500px" mx="auto">
                  You don't have any active orders at the moment. New orders will appear here.
                </Text>
              </MotionBox>
            ) : (
              <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6} mt={4}>
                {filteredActiveOrders.map((order, index) => (
                  <MotionCard
                    key={order.id}
                    borderRadius="xl"
                    overflow="hidden"
                    boxShadow="md"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    whileHover={{ y: -5, boxShadow: "lg" }}
                  >
                    <CardHeader
                      bg={`linear-gradient(90deg, ${accentColor}11 0%, ${secondaryColor}11 100%)`}
                      borderBottom="1px solid"
                      borderColor={borderColor}
                      pb={3}
                    >
                      <Flex justify="space-between" align="center">
                        <HStack>
                          <Avatar size="sm" name={order.Customer?.name || "Customer"} />
                          <Box>
                            <Text fontWeight="bold" fontSize="sm">
                              {order.Customer?.name || "Customer"}
                            </Text>
                            <Text fontSize="xs" color={mutedTextColor}>
                              Order #{order.id.substring(0, 8).toUpperCase()}
                            </Text>
                          </Box>
                        </HStack>
                        <Badge
                          colorScheme={getStatusColor(order.status)}
                          borderRadius="full"
                          px={2}
                          py={1}
                          display="flex"
                          alignItems="center"
                          gap={1}
                        >
                          {getStatusIcon(order.status)}
                          <Text>{order.status}</Text>
                        </Badge>
                      </Flex>
                    </CardHeader>

                    <CardBody py={4}>
                      <VStack align="stretch" spacing={3}>
                        <HStack>
                          <Box
                            borderRadius="full"
                            bg={`${accentColor}22`}
                            p={1.5}
                            color={accentColor}
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                          >
                            <Calendar size={14} />
                          </Box>
                          <Text fontSize="sm">{formatDate(order.createdAt)}</Text>
                        </HStack>

                        <Box bg={subtleColor} p={3} borderRadius="md">
                          <Text fontSize="xs" color={mutedTextColor} mb={2}>
                            Order Summary
                          </Text>
                          <Text fontSize="sm" fontWeight="medium" mb={1}>
                            {order.OrderDetail.singleProducts.length + order.OrderDetail.kits.length} items
                          </Text>
                          <Flex justify="space-between" align="center">
                            <Text fontSize="sm" color={mutedTextColor}>
                              Total
                            </Text>
                            <Text fontWeight="bold" color={accentColor}>
                              ${order.totalPrice.toFixed(2)}
                            </Text>
                          </Flex>
                        </Box>

                        <Divider />

                        <Text fontSize="sm" fontWeight="medium">
                          Order Items:
                        </Text>
                        <VStack align="stretch" spacing={2} maxH="150px" overflowY="auto">
                          {order.OrderDetail.singleProducts.map((product) => (
                            <Flex key={product.id} fontSize="xs" justify="space-between">
                              <Text>
                                {product.quantity}x {product.Product.name}
                              </Text>
                            </Flex>
                          ))}
                          {order.OrderDetail.kits.map((kit) => (
                            <Flex key={kit.id} fontSize="xs" justify="space-between">
                              <Text>
                                {kit.quantity}x {kit.Kit.name} (Kit)
                              </Text>
                            </Flex>
                          ))}
                        </VStack>
                      </VStack>
                    </CardBody>

                    <CardFooter
                      pt={0}
                      pb={3}
                      px={4}
                      borderTop="1px solid"
                      borderColor={borderColor}
                      justifyContent="space-between"
                    >
                      {order.status === StatusOrder.Created && (
                        <Button
                          colorScheme="blue"
                          size="sm"
                          leftIcon={<Clock size={16} />}
                          onClick={() => confirmStatusChange(order, StatusOrder.Accepted)}
                        >
                          Accept Order
                        </Button>
                      )}
                      {order.status === StatusOrder.Accepted && (
                        <Button
                          colorScheme="green"
                          size="sm"
                          leftIcon={<CheckCircle size={16} />}
                          onClick={() => confirmStatusChange(order, StatusOrder.Finalized)}
                        >
                          Mark as Complete
                        </Button>
                      )}
                      {order.status === StatusOrder.Finalized && (
                        <Text fontSize="sm" color="green.500" fontWeight="medium">
                          Order Completed
                        </Text>
                      )}
                      <Button
                        rightIcon={<ChevronRight size={16} />}
                        variant="ghost"
                        size="sm"
                        color={accentColor}
                        _hover={{ bg: `${accentColor}22` }}
                        onClick={() => openOrderDetails(order)}
                      >
                        View Details
                      </Button>
                    </CardFooter>
                  </MotionCard>
                ))}
              </SimpleGrid>
            )}
          </TabPanel>

          {/* Order History Tab */}
          <TabPanel px={0}>
            {loading.all ? (
              <Center py={10}>
                <VStack spacing={4}>
                  <Spinner size="xl" color={accentColor} thickness="4px" />
                  <Text color={mutedTextColor}>Loading order history...</Text>
                </VStack>
              </Center>
            ) : filteredAllOrders.length === 0 ? (
              <MotionBox
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                textAlign="center"
                py={10}
                px={6}
                borderRadius="xl"
                bg={`linear-gradient(135deg, ${gradientStart} 0%, ${gradientEnd} 100%)`}
              >
                <Box
                  bg={`${accentColor}22`}
                  p={4}
                  borderRadius="full"
                  width="80px"
                  height="80px"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  margin="0 auto"
                  mb={4}
                >
                  <ShoppingBag size={32} color={accentColor} />
                </Box>
                <Heading size="lg" mb={2}>
                  No Order History
                </Heading>
                <Text color={mutedTextColor} maxW="500px" mx="auto">
                  Your order history will appear here once you start receiving orders.
                </Text>
              </MotionBox>
            ) : (
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} mt={4}>
                {filteredAllOrders.map((order, index) => (
                  <MotionCard
                    key={order.id}
                    borderRadius="xl"
                    overflow="hidden"
                    boxShadow="md"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    whileHover={{ y: -5, boxShadow: "lg" }}
                  >
                    <CardHeader
                      bg={`linear-gradient(90deg, ${accentColor}11 0%, ${secondaryColor}11 100%)`}
                      borderBottom="1px solid"
                      borderColor={borderColor}
                      pb={3}
                    >
                      <Flex justify="space-between" align="center">
                        <Box>
                          <Text fontWeight="bold" fontSize="sm">
                            Order #{order.id.substring(0, 8).toUpperCase()}
                          </Text>
                          <Text fontSize="xs" color={mutedTextColor}>
                            {order.Customer?.name || "Customer"}
                          </Text>
                        </Box>
                        <Badge
                          colorScheme={getStatusColor(order.status)}
                          borderRadius="full"
                          px={2}
                          py={1}
                          display="flex"
                          alignItems="center"
                          gap={1}
                        >
                          {getStatusIcon(order.status)}
                          <Text>{order.status}</Text>
                        </Badge>
                      </Flex>
                    </CardHeader>

                    <CardBody py={4}>
                      <VStack align="stretch" spacing={3}>
                        <HStack>
                          <Box
                            borderRadius="full"
                            bg={`${accentColor}22`}
                            p={1.5}
                            color={accentColor}
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                          >
                            <Calendar size={14} />
                          </Box>
                          <Text fontSize="sm">{formatDate(order.createdAt)}</Text>
                        </HStack>

                        <Box bg={subtleColor} p={3} borderRadius="md">
                          <Flex justify="space-between" align="center" mb={1}>
                            <Text fontSize="xs" color={mutedTextColor}>
                              Items
                            </Text>
                            <Text fontSize="sm" fontWeight="medium">
                              {order.OrderDetail.singleProducts.length + order.OrderDetail.kits.length}
                            </Text>
                          </Flex>
                          <Flex justify="space-between" align="center">
                            <Text fontSize="xs" color={mutedTextColor}>
                              Total
                            </Text>
                            <Text fontWeight="bold" color={accentColor}>
                              ${order.totalPrice.toFixed(2)}
                            </Text>
                          </Flex>
                        </Box>
                      </VStack>
                    </CardBody>

                    <CardFooter
                      pt={0}
                      pb={3}
                      px={4}
                      borderTop="1px solid"
                      borderColor={borderColor}
                      justifyContent="flex-end"
                    >
                      <Button
                        rightIcon={<ChevronRight size={16} />}
                        variant="ghost"
                        size="sm"
                        color={accentColor}
                        _hover={{ bg: `${accentColor}22` }}
                        onClick={() => openOrderDetails(order)}
                      >
                        View Details
                      </Button>
                    </CardFooter>
                  </MotionCard>
                ))}
              </SimpleGrid>
            )}
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* Status Change Confirmation Dialog */}
      <AlertDialog isOpen={isStatusDialogOpen} leastDestructiveRef={cancelRef} onClose={onStatusDialogClose}>
        <AlertDialogOverlay>
          <AlertDialogContent borderRadius="lg">
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Change Order Status
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to change the status of order #{selectedOrder?.id.substring(0, 8).toUpperCase()} to{" "}
              <strong>{newStatus}</strong>?
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onStatusDialogClose}>
                Cancel
              </Button>
              <Button colorScheme="teal" onClick={handleChangeOrderStatus} ml={3}>
                Confirm
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {/* Order Details Modal */}
      <Modal isOpen={isDetailsModalOpen} onClose={onDetailsModalClose} size="xl" scrollBehavior="inside">
        <ModalOverlay backdropFilter="blur(5px)" />
        <ModalContent borderRadius="xl">
          <ModalHeader>
            <Flex justify="space-between" align="center">
              <Text>Order Details</Text>
              <Badge
                colorScheme={selectedOrder ? getStatusColor(selectedOrder.status) : "gray"}
                fontSize="md"
                px={3}
                py={1}
                display="flex"
                alignItems="center"
                gap={1}
              >
                {selectedOrder && getStatusIcon(selectedOrder.status)}
                <Text>{selectedOrder?.status}</Text>
              </Badge>
            </Flex>
            <ModalCloseButton />
          </ModalHeader>
          <ModalBody>
            {selectedOrder && (
              <VStack spacing={6} align="stretch">
                {/* Order ID and Date */}
                <Box bg={`${accentColor}11`} p={4} borderRadius="lg">
                  <Flex justify="space-between" align="center" mb={2}>
                    <Heading size="md">Order #{selectedOrder.id.substring(0, 8).toUpperCase()}</Heading>
                    <Text fontSize="sm" color={mutedTextColor}>
                      {formatOrderDate(selectedOrder.orderDate || selectedOrder.createdAt)}
                    </Text>
                  </Flex>
                </Box>

                {/* Customer Information */}
                <Box>
                  <Heading size="sm" mb={3} display="flex" alignItems="center">
                    <User size={16} style={{ marginRight: "8px" }} /> Customer Information
                  </Heading>
                  <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4}>
                    <GridItem>
                      <VStack align="start" spacing={2}>
                        <HStack>
                          <Avatar size="sm" name={selectedOrder.Customer?.name || "Customer"} />
                          <Text fontWeight="medium">{selectedOrder.Customer?.name || "Customer"}</Text>
                        </HStack>
                        {selectedOrder.Customer?.email && <Text fontSize="sm">{selectedOrder.Customer.email}</Text>}
                        {selectedOrder.Customer?.phone && (
                          <Flex align="center">
                            <Phone size={14} style={{ marginRight: "8px" }} />
                            <Text fontSize="sm">{selectedOrder.Customer.phone}</Text>
                          </Flex>
                        )}
                        {selectedOrder.Customer?.userName && (
                          <Text fontSize="sm">Username: {selectedOrder.Customer.userName}</Text>
                        )}
                      </VStack>
                    </GridItem>
                    <GridItem>
                      {selectedOrder.Restaurant?.address && (
                        <VStack align="start" spacing={2}>
                          <Flex align="center">
                            <MapPin size={14} style={{ marginRight: "8px" }} />
                            <Text fontWeight="medium">Restaurant Address</Text>
                          </Flex>
                          <Text fontSize="sm">{selectedOrder.Restaurant.address}</Text>
                        </VStack>
                      )}
                    </GridItem>
                  </Grid>
                </Box>

                {/* Order Items */}
                <Box>
                  <Heading size="sm" mb={3} display="flex" alignItems="center">
                    <ShoppingBag size={16} style={{ marginRight: "8px" }} /> Order Items
                  </Heading>
                  <Table variant="simple" size="sm">
                    <Thead bg={subtleColor}>
                      <Tr>
                        <Th>Item</Th>
                        <Th isNumeric>Quantity</Th>
                        {/* <Th isNumeric>Price</Th>
                        <Th isNumeric>Total</Th> */}
                      </Tr>
                    </Thead>
                    <Tbody>
                      {selectedOrder.OrderDetail.singleProducts.map((product: SingleProductDetail) => (
                        <Tr key={product.id}>
                          <Td>
                            <HStack>
                              <Image
                                src={product.Product.image || DEFAULT_PRODUCT_IMAGE}
                                alt={product.Product.name}
                                boxSize="32px"
                                objectFit="cover"
                                borderRadius="md"
                                fallbackSrc="/placeholder.svg?height=32&width=32"
                              />
                              <Text>{product.Product.name}</Text>
                            </HStack>
                          </Td>
                          <Td isNumeric>{product.quantity}</Td>
                          {/* <Td isNumeric>
                            $
                            {product.Product.productPrices && product.Product.productPrices.length > 0
                              ? product.Product.productPrices[0].price.toFixed(2)
                              : "N/A"}
                          </Td>
                          <Td isNumeric>
                            $
                            {product.Product.productPrices && product.Product.productPrices.length > 0
                              ? (product.quantity * product.Product.productPrices[0].price).toFixed(2)
                              : "N/A"}
                          </Td> */}
                        </Tr>
                      ))}
                      {selectedOrder.OrderDetail.kits.map((kit: KitDetail) => (
                        <Tr key={kit.id}>
                          <Td>
                            <HStack>
                              <Box
                                bg={`${secondaryColor}22`}
                                p={1}
                                borderRadius="md"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                              >
                                <Package size={16} color={secondaryColor} />
                              </Box>
                              <VStack align="start" spacing={0}>
                                <Text>{kit.Kit.name} (Kit)</Text>
                                <Box pl={2}>
                                  {kit.products &&
                                    kit.products.map((prod) => (
                                      <Text key={prod.id} fontSize="xs" color={mutedTextColor}>
                                        - {prod.quantity}x {prod.Product.name}
                                      </Text>
                                    ))}
                                </Box>
                              </VStack>
                            </HStack>
                          </Td>
                          <Td isNumeric>{kit.quantity}</Td>
                          <Td isNumeric>
                            $
                            {kit.Kit.KitPrice && kit.Kit.KitPrice.length > 0
                              ? kit.Kit.KitPrice[0].price.toFixed(2)
                              : "N/A"}
                          </Td>
                          <Td isNumeric>
                            $
                            {kit.Kit.KitPrice && kit.Kit.KitPrice.length > 0
                              ? (kit.quantity * kit.Kit.KitPrice[0].price).toFixed(2)
                              : "N/A"}
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>

                {/* Order Summary */}
                <Box bg={subtleColor} p={4} borderRadius="lg">
                  <Heading size="sm" mb={3} display="flex" alignItems="center">
                    <DollarSign size={16} style={{ marginRight: "8px" }} /> Order Summary
                  </Heading>
                  <VStack align="stretch" spacing={2}>
                    <Flex justify="space-between">
                      <Text fontSize="sm">Subtotal</Text>
                      <Text fontSize="sm">${selectedOrder.totalPrice.toFixed(2)}</Text>
                    </Flex>
                    <Flex justify="space-between">
                      <Text fontSize="sm">Delivery Fee</Text>
                      <Text fontSize="sm">${(0).toFixed(2)}</Text>
                    </Flex>
                    <Divider my={1} />
                    <Flex justify="space-between" fontWeight="bold">
                      <Text>Total</Text>
                      <Text>${selectedOrder.totalPrice.toFixed(2)}</Text>
                    </Flex>
                  </VStack>
                </Box>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter borderTop="1px solid" borderColor={borderColor}>
            <HStack spacing={3}>
              <Button leftIcon={<Printer size={16} />} variant="outline" onClick={printOrderReceipt}>
                Print Receipt
              </Button>

              {selectedOrder && selectedOrder.status === StatusOrder.Created && (
                <Button
                  colorScheme="blue"
                  leftIcon={<Clock size={16} />}
                  onClick={() => {
                    onDetailsModalClose()
                    confirmStatusChange(selectedOrder, StatusOrder.Accepted)
                  }}
                >
                  Accept Order
                </Button>
              )}

              {selectedOrder && selectedOrder.status === StatusOrder.Accepted && (
                <Button
                  colorScheme="green"
                  leftIcon={<CheckCircle size={16} />}
                  onClick={() => {
                    onDetailsModalClose()
                    confirmStatusChange(selectedOrder, StatusOrder.Finalized)
                  }}
                >
                  Mark as Complete
                </Button>
              )}
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  )
}
