"use client"

import { useEffect, useState } from "react"
import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Badge,
  Flex,
  Divider,
  Button,
  VStack,
  HStack,
  Avatar,
  useColorModeValue,
  Spinner,
  Center,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Image,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  InputGroup,
  InputLeftElement,
  Input,
  Tooltip,
} from "@chakra-ui/react"
import { motion } from "framer-motion"
import {
  Clock,
  Package,
  ChevronRight,
  Search,
  Calendar,
  MapPin,
  ShoppingBag,
  CheckCircle,
  AlertCircle,
  XCircle,
  Filter,
  ArrowUpDown,
  Bell,
  RefreshCw,
} from "lucide-react"
import { orderUseCase } from "../../../../app/infrastructure/DI/OrderContainer"
import { getJWTDataDecoded } from "../../../../app/infrastructure/service/JWTDecoded"
import { type TransformedOrder, StatusOrder } from "../../../../app/domain/models/oreder/Order"
import { webSocketService } from "../../../../app/infrastructure/service/WebSocketService"
import { useAppDispatch, useAppSelector } from "../../../../app/infrastructure/store/Hooks"
import { markOrderAsViewed, selectUpdatedOrderIds } from "../../../../app/infrastructure/store/NotificationSlice"

const MotionCard = motion(Card)
const MotionBox = motion(Box)
const MotionBadge = motion(Badge)

// Default images
const DEFAULT_PRODUCT_IMAGE =
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
const DEFAULT_RESTAURANT_IMAGE =
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"

export default function OrdersView() {
  const [orders, setOrders] = useState<TransformedOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<TransformedOrder | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortNewest, setSortNewest] = useState(true)
  const { isOpen, onOpen, onClose } = useDisclosure()

  // Notifications state from Redux
  const dispatch = useAppDispatch()
  const [updatesAvailable, setUpdatesAvailable] = useState(false)
  // Get all updated order IDs at once instead of checking individually
  const updatedOrderIds = useAppSelector(selectUpdatedOrderIds)

  // Colors
  const accentColor = useColorModeValue("pink.500", "pink.300")
  const secondaryColor = useColorModeValue("purple.500", "purple.300")
  const subtleColor = useColorModeValue("gray.100", "gray.700")
  const mutedTextColor = useColorModeValue("gray.600", "gray.400")
  const borderColor = useColorModeValue("gray.200", "gray.700")
  const gradientStart = useColorModeValue("pink.50", "gray.700")
  const gradientEnd = useColorModeValue("purple.50", "gray.900")
  const updateBgColor = useColorModeValue("pink.50", "pink.900")
  const updateBorderColor = useColorModeValue("pink.200", "pink.700")

  useEffect(() => {
    fetchOrders()

    // Configurar el WebSocket
    const customer = getJWTDataDecoded<Record<string, any>>()
    if (customer && customer.sub) {
      webSocketService.registerClient("user", customer.sub)

      // Listener para actualizar órdenes cuando lleguen notificaciones
      const handleOrderUpdate = (data: any) => {
        if (data.type === "orderStatusUpdate") {
          setUpdatesAvailable(true)
        }
      }

      webSocketService.addMessageListener(handleOrderUpdate)

      return () => {
        webSocketService.removeMessageListener(handleOrderUpdate)
      }
    }
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      setError(null)
      setUpdatesAvailable(false)

      // Get customer ID from JWT
      const customer = getJWTDataDecoded<Record<string, any>>()

      // Fetch orders
      const fetchedOrders = await orderUseCase.getAllOrdersByCustomerId({
        customerId: customer.sub,
      })

      setOrders(fetchedOrders)
    } catch (err: any) {
      console.error("Error fetching orders:", err)
      setError(err.message || "Failed to load orders")
    } finally {
      setLoading(false)
    }
  }

  const handleViewOrderDetails = (order: TransformedOrder) => {
    setSelectedOrder(order)

    // Marcar la orden como vista si tenía actualizaciones
    if (updatedOrderIds.includes(order.id)) {
      dispatch(markOrderAsViewed(order.id))
    }

    onOpen()
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
  const filteredAndSortedOrders = orders
    .filter((order) => {
      if (searchTerm === "") return true

      const searchLower = searchTerm.toLowerCase()
      const restaurantName = order.Restaurant?.name?.toLowerCase() || ""
      const orderId = order.id.toLowerCase()

      return restaurantName.includes(searchLower) || orderId.includes(searchLower)
    })
    .sort((a, b) => {
      const dateA = new Date(a.orderDate).getTime()
      const dateB = new Date(b.orderDate).getTime()
      return sortNewest ? dateB - dateA : dateA - dateB
    })

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
          Your Orders
        </Heading>
        <Text color={mutedTextColor}>Track and manage your order history</Text>
      </Box>

      {/* Search and Filter Section */}
      <Flex mb={6} justify="space-between" align="center" wrap="wrap" gap={4}>
        <InputGroup maxW={{ base: "full", md: "320px" }}>
          <InputLeftElement pointerEvents="none">
            <Search color={useColorModeValue("gray.400", "gray.300")} size={18} />
          </InputLeftElement>
          <Input
            placeholder="Search by restaurant or order ID"
            borderRadius="full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </InputGroup>

        <HStack>
          {updatesAvailable && (
            <Tooltip label="New updates available">
              <Button
                leftIcon={<RefreshCw size={16} />}
                colorScheme="pink"
                size="sm"
                borderRadius="full"
                onClick={fetchOrders}
                _hover={{ transform: "rotate(180deg)", transition: "transform 0.5s" }}
              >
                Updates Available
              </Button>
            </Tooltip>
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

      {/* Loading State */}
      {loading && (
        <Center py={10}>
          <VStack spacing={4}>
            <Spinner size="xl" color={accentColor} thickness="4px" />
            <Text color={mutedTextColor}>Loading your orders...</Text>
          </VStack>
        </Center>
      )}

      {/* Error State */}
      {error && (
        <Alert status="error" borderRadius="lg" mb={6}>
          <AlertIcon />
          <AlertTitle mr={2}>Error!</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Empty State */}
      {!loading && !error && orders.length === 0 && (
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
            No Orders Yet
          </Heading>
          <Text color={mutedTextColor} maxW="500px" mx="auto" mb={6}>
            You haven't placed any orders yet. Browse our restaurants and discover delicious meals to get started!
          </Text>
          <Button
            colorScheme="pink"
            size="lg"
            onClick={() => (window.location.href = "/user/products")}
            _hover={{
              transform: "translateY(-2px)",
              boxShadow: "lg",
            }}
            transition="all 0.2s"
          >
            Explore Restaurants
          </Button>
        </MotionBox>
      )}

      {/* Orders List */}
      {!loading && !error && filteredAndSortedOrders.length > 0 && (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {filteredAndSortedOrders.map((order, index) => {
            // Check if this order has updates directly from the array
            const hasOrderUpdates = updatedOrderIds.includes(order.id)

            return (
              <MotionCard
                key={order.id}
                borderRadius="xl"
                overflow="hidden"
                boxShadow={hasOrderUpdates ? "lg" : "md"}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                whileHover={{ y: -5, boxShadow: "lg" }}
                cursor="pointer"
                onClick={() => handleViewOrderDetails(order)}
                borderWidth={hasOrderUpdates ? "2px" : "1px"}
                borderColor={hasOrderUpdates ? updateBorderColor : borderColor}
                bg={hasOrderUpdates ? updateBgColor : undefined}
                position="relative"
              >
                {hasOrderUpdates && (
                  <MotionBadge
                    position="absolute"
                    top={3}
                    right={3}
                    colorScheme="pink"
                    borderRadius="full"
                    px={2}
                    py={1}
                    zIndex={1}
                    display="flex"
                    alignItems="center"
                    gap={1}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  >
                    <Bell size={12} />
                    <Text fontSize="xs">Updated</Text>
                  </MotionBadge>
                )}

                <CardHeader
                  bg={`linear-gradient(90deg, ${accentColor}11 0%, ${secondaryColor}11 100%)`}
                  borderBottom="1px solid"
                  borderColor={borderColor}
                  pb={3}
                >
                  <Flex justify="space-between" align="center">
                    <HStack>
                      <Avatar
                        size="sm"
                        name={order.Restaurant?.name}
                        src={order.Restaurant?.image || DEFAULT_RESTAURANT_IMAGE}
                      />
                      <Box>
                        <Text fontWeight="bold" fontSize="sm" noOfLines={1}>
                          {order.Restaurant?.name || "Restaurant"}
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
                      <Text fontSize="sm">{formatDate(order.orderDate)}</Text>
                    </HStack>

                    <HStack>
                      <Box
                        borderRadius="full"
                        bg={`${secondaryColor}22`}
                        p={1.5}
                        color={secondaryColor}
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <MapPin size={14} />
                      </Box>
                      <Text fontSize="sm" noOfLines={1}>
                        {order.Restaurant?.address || "Address not available"}
                      </Text>
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
                  >
                    View Details
                  </Button>
                </CardFooter>
              </MotionCard>
            )
          })}
        </SimpleGrid>
      )}

      {/* Order Details Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
        <ModalOverlay backdropFilter="blur(5px)" />
        <ModalContent borderRadius="xl">
          <ModalHeader
            bg={`linear-gradient(90deg, ${accentColor}22 0%, ${secondaryColor}22 100%)`}
            borderBottom="1px solid"
            borderColor={borderColor}
            borderTopRadius="xl"
          >
            <Flex justify="space-between" align="center">
              <Text>Order Details</Text>
              <Badge
                colorScheme={getStatusColor(selectedOrder?.status || StatusOrder.Created)}
                borderRadius="full"
                px={2}
                py={1}
                display="flex"
                alignItems="center"
                gap={1}
              >
                {getStatusIcon(selectedOrder?.status || StatusOrder.Created)}
                <Text>{selectedOrder?.status}</Text>
              </Badge>
            </Flex>
            <ModalCloseButton />
          </ModalHeader>

          <ModalBody py={6}>
            {selectedOrder && (
              <VStack spacing={6} align="stretch">
                <Flex
                  bg={`linear-gradient(90deg, ${gradientStart} 0%, ${gradientEnd} 100%)`}
                  p={4}
                  borderRadius="lg"
                  align="center"
                  justify="space-between"
                >
                  <HStack>
                    <Avatar
                      size="md"
                      name={selectedOrder.Restaurant?.name}
                      src={selectedOrder.Restaurant?.image || DEFAULT_RESTAURANT_IMAGE}
                    />
                    <Box>
                      <Text fontWeight="bold">{selectedOrder.Restaurant?.name || "Restaurant"}</Text>
                      <Text fontSize="sm" color={mutedTextColor}>
                        {selectedOrder.Restaurant?.address || "Address not available"}
                      </Text>
                    </Box>
                  </HStack>
                  <Box textAlign="right">
                    <Text fontSize="sm" color={mutedTextColor}>
                      Order ID
                    </Text>
                    <Text fontWeight="medium">#{selectedOrder.id.substring(0, 8).toUpperCase()}</Text>
                  </Box>
                </Flex>

                <Box>
                  <Flex justify="space-between" mb={2}>
                    <Text fontWeight="medium">Order Date</Text>
                    <Text>{formatDate(selectedOrder.orderDate)}</Text>
                  </Flex>
                  <Divider />
                </Box>

                <Box>
                  <Text fontWeight="bold" mb={3}>
                    Order Items
                  </Text>

                  {/* Single Products */}
                  {selectedOrder.OrderDetail.singleProducts.length > 0 && (
                    <Accordion allowToggle defaultIndex={[0]} mb={4}>
                      <AccordionItem border="none">
                        <AccordionButton bg={subtleColor} borderRadius="md" _hover={{ bg: `${accentColor}22` }} mb={2}>
                          <Box flex="1" textAlign="left" fontWeight="medium">
                            <HStack>
                              <ShoppingBag size={16} />
                              <Text>Individual Products ({selectedOrder.OrderDetail.singleProducts.length})</Text>
                            </HStack>
                          </Box>
                          <AccordionIcon />
                        </AccordionButton>
                        <AccordionPanel pb={4}>
                          <VStack spacing={3} align="stretch">
                            {selectedOrder.OrderDetail.singleProducts.map((product) => (
                              <Flex
                                key={product.id}
                                p={3}
                                borderRadius="md"
                                border="1px solid"
                                borderColor={borderColor}
                                align="center"
                              >
                                <Image
                                  src={product.Product.image || DEFAULT_PRODUCT_IMAGE}
                                  alt={product.Product.name}
                                  boxSize="50px"
                                  objectFit="cover"
                                  borderRadius="md"
                                  mr={3}
                                  fallbackSrc="/placeholder.svg?height=50&width=50"
                                />
                                <Box flex="1">
                                  <Text fontWeight="medium" fontSize="sm">
                                    {product.Product.name}
                                  </Text>
                                  <Text fontSize="xs" color={mutedTextColor} noOfLines={1}>
                                    {product.Product.description}
                                  </Text>
                                </Box>
                                <Box textAlign="right">
                                  <Badge colorScheme="gray" borderRadius="full">
                                    x{product.quantity}
                                  </Badge>
                                </Box>
                              </Flex>
                            ))}
                          </VStack>
                        </AccordionPanel>
                      </AccordionItem>
                    </Accordion>
                  )}

                  {/* Kits */}
                  {selectedOrder.OrderDetail.kits.length > 0 && (
                    <Accordion allowToggle defaultIndex={[0]}>
                      <AccordionItem border="none">
                        <AccordionButton
                          bg={subtleColor}
                          borderRadius="md"
                          _hover={{ bg: `${secondaryColor}22` }}
                          mb={2}
                        >
                          <Box flex="1" textAlign="left" fontWeight="medium">
                            <HStack>
                              <Package size={16} />
                              <Text>Meal Kits ({selectedOrder.OrderDetail.kits.length})</Text>
                            </HStack>
                          </Box>
                          <AccordionIcon />
                        </AccordionButton>
                        <AccordionPanel pb={4}>
                          <VStack spacing={4} align="stretch">
                            {selectedOrder.OrderDetail.kits.map((kit) => (
                              <Box
                                key={kit.id}
                                p={4}
                                borderRadius="md"
                                border="1px solid"
                                borderColor={borderColor}
                                bg={`${secondaryColor}11`}
                              >
                                <Flex align="center" mb={3}>
                                  <Image
                                    src={kit.Kit.image || DEFAULT_PRODUCT_IMAGE}
                                    alt={kit.Kit.name}
                                    boxSize="60px"
                                    objectFit="cover"
                                    borderRadius="md"
                                    mr={3}
                                    fallbackSrc="/placeholder.svg?height=60&width=60"
                                  />
                                  <Box flex="1">
                                    <Flex justify="space-between" align="center">
                                      <Text fontWeight="bold">{kit.Kit.name}</Text>
                                      <Badge colorScheme="purple" borderRadius="full">
                                        x{kit.quantity}
                                      </Badge>
                                    </Flex>
                                    <Text fontSize="sm" color={mutedTextColor} noOfLines={2}>
                                      {kit.Kit.description}
                                    </Text>
                                  </Box>
                                </Flex>

                                <Divider mb={3} />

                                <Text fontSize="sm" fontWeight="medium" mb={2}>
                                  Kit Contents:
                                </Text>
                                <VStack spacing={2} align="stretch">
                                  {kit.products.map((product) => (
                                    <Flex key={product.id} p={2} borderRadius="md" bg={subtleColor} align="center">
                                      <Image
                                        src={product.Product.image || DEFAULT_PRODUCT_IMAGE}
                                        alt={product.Product.name}
                                        boxSize="30px"
                                        objectFit="cover"
                                        borderRadius="sm"
                                        mr={2}
                                        fallbackSrc="/placeholder.svg?height=30&width=30"
                                      />
                                      <Text fontSize="xs" flex="1">
                                        {product.Product.name}
                                      </Text>
                                      <Badge fontSize="2xs" colorScheme="gray" borderRadius="full">
                                        x{product.quantity}
                                      </Badge>
                                    </Flex>
                                  ))}
                                </VStack>
                              </Box>
                            ))}
                          </VStack>
                        </AccordionPanel>
                      </AccordionItem>
                    </Accordion>
                  )}
                </Box>

                <Box bg={subtleColor} p={4} borderRadius="lg">
                  <Text fontWeight="bold" mb={3}>
                    Order Summary
                  </Text>
                  <VStack spacing={2} align="stretch">
                    <Flex justify="space-between">
                      <Text fontSize="sm" color={mutedTextColor}>
                        Subtotal
                      </Text>
                      <Text fontSize="sm">${(selectedOrder.totalPrice * 0.84).toFixed(2)}</Text>
                    </Flex>
                    <Flex justify="space-between">
                      <Text fontSize="sm" color={mutedTextColor}>
                        Tax (16%)
                      </Text>
                      <Text fontSize="sm">${(selectedOrder.totalPrice * 0.16).toFixed(2)}</Text>
                    </Flex>
                    <Divider my={1} />
                    <Flex justify="space-between" fontWeight="bold">
                      <Text>Total</Text>
                      <Text bgGradient={`linear(to-r, ${accentColor}, ${secondaryColor})`} bgClip="text" fontSize="lg">
                        ${selectedOrder.totalPrice.toFixed(2)}
                      </Text>
                    </Flex>
                  </VStack>
                </Box>
              </VStack>
            )}
          </ModalBody>

          <ModalFooter borderTop="1px solid" borderColor={borderColor}>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Close
            </Button>
            <Button
              colorScheme="pink"
              leftIcon={<ShoppingBag size={16} />}
              onClick={() => (window.location.href = "/user/products")}
            >
              Order Again
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  )
}
