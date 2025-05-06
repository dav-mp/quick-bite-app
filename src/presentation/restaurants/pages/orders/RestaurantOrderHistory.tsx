"use client"

import { useState, useEffect } from "react"
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
  Badge,
  Button,
  VStack,
  HStack,
  useColorModeValue,
  Spinner,
  Center,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  InputGroup,
  InputLeftElement,
  Input,
  Select,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
} from "@chakra-ui/react"
import { motion } from "framer-motion"
import {
  Search,
  Calendar,
  Download,
  ChevronDown,
  ArrowUpDown,
  BarChart3,
  TrendingUp,
  DollarSign,
  ShoppingBag,
  CheckCircle,
  AlertCircle,
  Clock,
  ChevronRight,
} from "lucide-react"
import { orderUseCase } from "../../../../app/infrastructure/DI/OrderContainer"
import { getJWTDataDecoded } from "../../../../app/infrastructure/service/JWTDecoded"
import { type TransformedOrder, StatusOrder } from "../../../../app/domain/models/oreder/Order"
import { productUseCase } from "../../../../app/infrastructure/DI/ProductContainer"

const MotionCard = motion(Card)
const MotionBox = motion(Box)

export default function RestaurantOrderHistory() {
  const [orders, setOrders] = useState<TransformedOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [dateFilter, setDateFilter] = useState<string>("all")
  const [sortNewest, setSortNewest] = useState(true)

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
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      setError(null)

      // Get restaurant ID from JWT
      const restaurant = getJWTDataDecoded<Record<string, any>>()
        console.log(restaurant);
        
      // Fetch all orders
      const ordersData = await orderUseCase.getAllOrdersRestaurant({
        restaurantId: restaurant.id,
      })
      const ordersData2 = await productUseCase.getAllProducts()
      console.log(ordersData2);
      
      setOrders(ordersData)
    } catch (err: any) {
      console.error("Error fetching orders:", err)
      setError(err.message || "Failed to load orders")
    } finally {
      setLoading(false)
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

  const getStatusIcon = (status: StatusOrder) => {
    switch (status) {
      case StatusOrder.Created:
        return <AlertCircle size={16} />
      case StatusOrder.Accepted:
        return <Clock size={16} />
      case StatusOrder.Finalized:
        return <CheckCircle size={16} />
      default:
        return null
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
      // Status filter
      if (statusFilter !== "all" && order.status !== statusFilter) return false

      // Date filter
      if (dateFilter !== "all") {
        const orderDate = new Date(order.createdAt)
        const today = new Date()
        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)
        const lastWeek = new Date(today)
        lastWeek.setDate(lastWeek.getDate() - 7)
        const lastMonth = new Date(today)
        lastMonth.setMonth(lastMonth.getMonth() - 1)

        switch (dateFilter) {
          case "today":
            if (orderDate.toDateString() !== today.toDateString()) return false
            break
          case "yesterday":
            if (orderDate.toDateString() !== yesterday.toDateString()) return false
            break
          case "week":
            if (orderDate < lastWeek) return false
            break
          case "month":
            if (orderDate < lastMonth) return false
            break
        }
      }

      // Search filter
      if (searchTerm !== "") {
        const searchLower = searchTerm.toLowerCase()
        const customerName = order.Customer?.name?.toLowerCase() || ""
        const orderId = order.id.toLowerCase()

        if (!customerName.includes(searchLower) && !orderId.includes(searchLower)) {
          return false
        }
      }

      return true
    })
    .sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime()
      const dateB = new Date(b.createdAt).getTime()
      return sortNewest ? dateB - dateA : dateA - dateB
    })

  // Calculate stats
  const totalSales = orders.reduce((sum, order) => sum + order.totalPrice, 0)
  const todayOrders = orders.filter((order) => new Date(order.createdAt).toDateString() === new Date().toDateString())
  const todaySales = todayOrders.reduce((sum, order) => sum + order.totalPrice, 0)

  // Count orders by status
  const ordersByStatus = {
    created: orders.filter((order) => order.status === StatusOrder.Created).length,
    accepted: orders.filter((order) => order.status === StatusOrder.Accepted).length,
    finalized: orders.filter((order) => order.status === StatusOrder.Finalized).length,
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
          Order History
        </Heading>
        <Text color={mutedTextColor}>View and analyze your past orders</Text>
      </Box>

      {/* Stats Section */}
      <SimpleGrid columns={{ base: 1, md: 4 }} spacing={6} mb={6}>
        <Card borderRadius="lg" boxShadow="md">
          <CardBody>
            <Stat>
              <StatLabel color={mutedTextColor}>Total Orders</StatLabel>
              <StatNumber fontSize="3xl" color={accentColor}>
                {orders.length}
              </StatNumber>
              <StatHelpText>All time</StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card borderRadius="lg" boxShadow="md">
          <CardBody>
            <Stat>
              <StatLabel color={mutedTextColor}>Total Revenue</StatLabel>
              <StatNumber fontSize="3xl" color={accentColor}>
                ${totalSales.toFixed(2)}
              </StatNumber>
              <StatHelpText>
                <TrendingUp size={14} style={{ display: "inline", marginRight: "4px" }} />
                All time
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card borderRadius="lg" boxShadow="md">
          <CardBody>
            <Stat>
              <StatLabel color={mutedTextColor}>Today's Orders</StatLabel>
              <StatNumber fontSize="3xl" color={accentColor}>
                {todayOrders.length}
              </StatNumber>
              <StatHelpText>${todaySales.toFixed(2)} revenue</StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card borderRadius="lg" boxShadow="md">
          <CardBody>
            <Stat>
              <StatLabel color={mutedTextColor}>Order Status</StatLabel>
              <HStack mt={2} spacing={2}>
                <Badge colorScheme="yellow" px={2} py={1}>
                  {ordersByStatus.created} New
                </Badge>
                <Badge colorScheme="blue" px={2} py={1}>
                  {ordersByStatus.accepted} Processing
                </Badge>
                <Badge colorScheme="green" px={2} py={1}>
                  {ordersByStatus.finalized} Completed
                </Badge>
              </HStack>
              <StatHelpText>Current status breakdown</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Filters Section */}
      <Flex mb={6} justify="space-between" align="center" wrap="wrap" gap={4}>
        <HStack spacing={4} flex="1">
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

          <Select
            maxW="150px"
            borderRadius="full"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value={StatusOrder.Created}>New</option>
            <option value={StatusOrder.Accepted}>Processing</option>
            <option value={StatusOrder.Finalized}>Completed</option>
          </Select>

          <Select maxW="150px" borderRadius="full" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}>
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
          </Select>
        </HStack>

        <HStack>
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
          <Button leftIcon={<Download size={16} />} colorScheme="teal" size="sm" borderRadius="full">
            Export
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

      {/* Tabs for different views */}
      <Tabs colorScheme="teal" borderRadius="lg" variant="enclosed">
        <TabList>
          <Tab _selected={{ color: accentColor, borderColor: "currentColor" }}>List View</Tab>
          <Tab _selected={{ color: accentColor, borderColor: "currentColor" }}>Table View</Tab>
          <Tab _selected={{ color: accentColor, borderColor: "currentColor" }}>Analytics</Tab>
        </TabList>

        <TabPanels>
          {/* List View Tab */}
          <TabPanel px={0}>
            {loading ? (
              <Center py={10}>
                <VStack spacing={4}>
                  <Spinner size="xl" color={accentColor} thickness="4px" />
                  <Text color={mutedTextColor}>Loading order history...</Text>
                </VStack>
              </Center>
            ) : filteredAndSortedOrders.length === 0 ? (
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
                  No Orders Found
                </Heading>
                <Text color={mutedTextColor} maxW="500px" mx="auto">
                  {searchTerm || statusFilter !== "all" || dateFilter !== "all"
                    ? "No orders match your current filters. Try adjusting your search criteria."
                    : "You don't have any orders yet. Orders will appear here once customers place them."}
                </Text>
              </MotionBox>
            ) : (
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                {filteredAndSortedOrders.map((order, index) => (
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

                        <Button
                          rightIcon={<ChevronRight size={16} />}
                          variant="ghost"
                          size="sm"
                          color={accentColor}
                          _hover={{ bg: `${accentColor}22` }}
                          alignSelf="flex-end"
                        >
                          View Details
                        </Button>
                      </VStack>
                    </CardBody>
                  </MotionCard>
                ))}
              </SimpleGrid>
            )}
          </TabPanel>

          {/* Table View Tab */}
          <TabPanel px={0}>
            {loading ? (
              <Center py={10}>
                <VStack spacing={4}>
                  <Spinner size="xl" color={accentColor} thickness="4px" />
                  <Text color={mutedTextColor}>Loading order history...</Text>
                </VStack>
              </Center>
            ) : filteredAndSortedOrders.length === 0 ? (
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
                <Text color={mutedTextColor}>No orders match your current filters</Text>
              </MotionBox>
            ) : (
              <TableContainer>
                <Table variant="simple" size="md">
                  <Thead>
                    <Tr>
                      <Th>Order ID</Th>
                      <Th>Customer</Th>
                      <Th>Date</Th>
                      <Th>Items</Th>
                      <Th>Total</Th>
                      <Th>Status</Th>
                      <Th>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {filteredAndSortedOrders.map((order) => (
                      <Tr key={order.id}>
                        <Td fontWeight="medium">#{order.id.substring(0, 8).toUpperCase()}</Td>
                        <Td>{order.Customer?.name || "Customer"}</Td>
                        <Td>{formatDate(order.createdAt)}</Td>
                        <Td>{order.OrderDetail.singleProducts.length + order.OrderDetail.kits.length}</Td>
                        <Td fontWeight="medium">${order.totalPrice.toFixed(2)}</Td>
                        <Td>
                          <Badge colorScheme={getStatusColor(order.status)}>{order.status}</Badge>
                        </Td>
                        <Td>
                          <Menu>
                            <MenuButton as={IconButton} icon={<ChevronDown size={16} />} variant="ghost" size="sm" />
                            <MenuList>
                              <MenuItem>View Details</MenuItem>
                              <MenuItem>Print Receipt</MenuItem>
                            </MenuList>
                          </Menu>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>
            )}
          </TabPanel>

          {/* Analytics Tab */}
          <TabPanel px={0}>
            <Center py={10} flexDirection="column">
              <BarChart3 size={64} color={accentColor} strokeWidth={1.5} />
              <Text mt={4} color={mutedTextColor}>
                Analytics view would display charts and graphs here
              </Text>
              <Button mt={4} leftIcon={<DollarSign size={16} />} colorScheme="teal">
                View Sales Report
              </Button>
            </Center>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Container>
  )
}
