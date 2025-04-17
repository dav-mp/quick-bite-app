"use client"

import { useState, useRef, useEffect } from "react"
import {
  Box,
  Flex,
  Heading,
  Text,
  Image,
  Badge,
  useColorModeValue,
  VStack,
  HStack,
  Tag,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Button,
  SimpleGrid,
  Card,
  CardBody,
  CardFooter,
  Stack,
  Avatar,
  IconButton,
  useDisclosure,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  SlideFade,
  useToken,
} from "@chakra-ui/react"
import { AddIcon, ChevronRightIcon, ChevronLeftIcon, LockIcon, InfoIcon, TimeIcon } from "@chakra-ui/icons"
import { restaurantUseCase } from "../../../../app/infrastructure/DI/RestaurantContainer"

// Restaurant data structure from API
interface Restaurant {
  id: string
  name: string
  resId: string
  address: string
  status: boolean
  updatedAt: string
  createdAt: string
  password: string
  image: string | null
  Shift: Array<{
    id: string
    restaurantId: string
    openShift: string
    closeShift?: string // closeShift is optional
  }>
}

// Mock data for products
const products = [
  {
    id: 1,
    name: "Classic Burger",
    image:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    price: 8.99,
    description: "Juicy beef patty with lettuce, tomato, and special sauce",
    category: "Burgers",
    isPopular: true,
  },
  {
    id: 2,
    name: "Veggie Wrap",
    image:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    price: 7.49,
    description: "Fresh vegetables wrapped in a whole grain tortilla",
    category: "Wraps",
    isPopular: false,
  },
  {
    id: 3,
    name: "Chicken Salad",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    price: 9.99,
    description: "Grilled chicken with mixed greens and house dressing",
    category: "Salads",
    isPopular: true,
  },
]

// Mock data for kits
const kits = [
  {
    id: 1,
    name: "Family Feast",
    image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    price: 29.99,
    description: "4 burgers, 2 large fries, and 4 drinks",
    items: ["4 × Classic Burger", "2 × Large Fries", "4 × Soft Drink"],
    discount: "20% off",
  },
  {
    id: 2,
    name: "Date Night Special",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    price: 24.99,
    description: "2 premium burgers, 2 sides, and 2 desserts",
    items: ["2 × Premium Burger", "2 × Side Salad", "2 × Chocolate Brownie"],
    discount: "15% off",
  },
]

// Default restaurant image
const DEFAULT_RESTAURANT_IMAGE =
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"

export default function StoreShowcase() {
  const [selectedStore, setSelectedStore] = useState<string | null>(null)
  const [showStores, setShowStores] = useState(true)
  const [showProducts, setShowProducts] = useState(false)
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const { isOpen, onOpen, onClose } = useDisclosure()
  const storesRef = useRef<HTMLDivElement>(null)
  const productsRef = useRef<HTMLDivElement>(null)

  // Get theme colors
  const [teal500, purple500] = useToken("colors", ["teal.500", "purple.500"])

  // Colors
  const cardBg = useColorModeValue("white", "gray.800")
  const accentColor = useColorModeValue("teal.500", "teal.300")
  const subtleColor = useColorModeValue("gray.100", "gray.700")
  const textColor = useColorModeValue("gray.800", "white")
  const mutedTextColor = useColorModeValue("gray.600", "gray.400")
  const closedBg = useColorModeValue("gray.100", "gray.700")
  const closedTextColor = useColorModeValue("gray.500", "gray.400")


  useEffect(() => {
    getRestaurantsOpen()
  }, [])
  
  const getRestaurantsOpen = async () => {
    const resp = await restaurantUseCase.getRestaurantsWithShifts()
    setRestaurants(resp)
  }


  // Check if a restaurant is open based on its Shift array
  const isRestaurantOpen = (restaurant: Restaurant): boolean => {
    // If there are no shifts, the restaurant is closed
    if (!restaurant.Shift || restaurant.Shift.length === 0) {
      return false
    }

    // Get the latest shift (assuming shifts are ordered chronologically)
    const latestShift = restaurant.Shift[restaurant.Shift.length - 1]

    // If the latest shift has openShift but no closeShift, the restaurant is open
    return !!latestShift.openShift && !latestShift.closeShift
  }

  const handleStoreSelect = (storeId: string) => {
    const restaurant = restaurants.find((r) => r.id === storeId)

    // Don't select closed restaurants
    if (!restaurant || !isRestaurantOpen(restaurant)) return

    setSelectedStore(storeId)

    // On mobile, open the drawer when a restaurant is selected
    if (window.innerWidth < 768) {
      onOpen()
    } else {
      // Animate the transition on desktop
      setShowStores(false)
      setTimeout(() => {
        setShowProducts(true)
      }, 300) // Wait for exit animation to complete
    }
  }

  const handleBackToStores = () => {
    setShowProducts(false)
    setTimeout(() => {
      setShowStores(true)
      setSelectedStore(null)
    }, 300) // Wait for exit animation to complete
  }

  const selectedStoreData = restaurants.find((store) => store.id === selectedStore)

  // Function to format date to a readable format
  // const formatDate = (dateString: string) => {
  //   const date = new Date(dateString)
  //   return date.toLocaleDateString("en-US", {
  //     year: "numeric",
  //     month: "short",
  //     day: "numeric",
  //   })
  // }

  // Function to get shift status text
  const getShiftStatusText = (restaurant: Restaurant): string => {
    if (!restaurant.Shift || restaurant.Shift.length === 0) {
      return "No Shifts"
    }

    const latestShift = restaurant.Shift[restaurant.Shift.length - 1]

    if (latestShift.openShift && !latestShift.closeShift) {
      // Format the open time
      const openTime = new Date(latestShift.openShift)
      const formattedTime = openTime.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
      return `Open since ${formattedTime}`
    } else if (latestShift.openShift && latestShift.closeShift) {
      // Format the close time
      const closeTime = new Date(latestShift.closeShift)
      const formattedTime = closeTime.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
      return `Closed at ${formattedTime}`
    }

    return "Status Unknown"
  }

  return (
    <Box position="relative" overflow="hidden" minH="80vh">
      {/* Heading Section with Gradient Background */}
      <Box
        bg="linear-gradient(135deg, #6B46C1 0%, #3182CE 100%)"
        color="white"
        py={8}
        px={4}
        borderRadius="xl"
        mb={8}
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
        <Box
          position="absolute"
          bottom="0"
          left="0"
          width="200px"
          height="200px"
          bg="rgba(255,255,255,0.1)"
          borderRadius="full"
          transform="translate(-100px, 100px)"
        />

        <Heading size="xl" fontWeight="extrabold" mb={2}>
          Discover Amazing Restaurants
        </Heading>
        <Text fontSize="lg" opacity={0.9}>
          Find your favorite food and special kits
        </Text>
      </Box>

      {/* Stores Section */}
      <SlideFade
        in={showStores}
        offsetX="-80px"
        offsetY="0"
        transition={{ enter: { duration: 0.5 }, exit: { duration: 0.3 } }}
        style={{
          position: showProducts ? "absolute" : "relative",
          width: "100%",
          zIndex: showProducts ? 0 : 1,
        }}
        ref={storesRef}
      >
        <Box mb={selectedStore ? 8 : 0}>
          <Flex justify="space-between" align="center" mb={4}>
            <Heading size="lg" fontWeight="bold">
              Available Restaurants
            </Heading>
            <Button variant="ghost" rightIcon={<ChevronRightIcon />} color={accentColor}>
              View All
            </Button>
          </Flex>

          <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={6}>
            {restaurants.map((restaurant) => {
              const isOpen = isRestaurantOpen(restaurant)

              return (
                <Card
                  key={restaurant.id}
                  overflow="hidden"
                  variant="outline"
                  bg={!isOpen ? closedBg : cardBg}
                  opacity={!isOpen ? 0.8 : 1}
                  borderWidth={selectedStore === restaurant.id ? "2px" : "1px"}
                  borderColor={selectedStore === restaurant.id ? accentColor : "transparent"}
                  transition="all 0.3s"
                  _hover={{
                    transform: isOpen ? "translateY(-5px)" : "none",
                    shadow: isOpen ? "lg" : "none",
                    borderColor: isOpen ? accentColor : "transparent",
                  }}
                  onClick={() => isOpen && handleStoreSelect(restaurant.id)}
                  cursor={isOpen ? "pointer" : "default"}
                  position="relative"
                >
                  {/* Overlay for closed restaurants */}
                  {!isOpen && (
                    <Box
                      position="absolute"
                      top="0"
                      left="0"
                      right="0"
                      bottom="0"
                      bg="blackAlpha.200"
                      zIndex="1"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      flexDirection="column"
                      backdropFilter="blur(2px)"
                    >
                      <LockIcon boxSize={8} color="red.500" mb={2} />
                      <Text fontWeight="bold" color="red.500">
                        Currently Closed
                      </Text>
                    </Box>
                  )}

                  <Box position="relative">
                    <Image
                      src={restaurant.image || DEFAULT_RESTAURANT_IMAGE}
                      alt={restaurant.name}
                      height="160px"
                      width="100%"
                      objectFit="cover"
                      filter={!isOpen ? "grayscale(70%)" : "none"}
                      fallbackSrc="/placeholder.svg?height=160&width=500"
                    />

                    {/* Restaurant ID Badge */}
                    <Badge
                      position="absolute"
                      top={2}
                      right={2}
                      colorScheme="purple"
                      variant="solid"
                      borderRadius="full"
                      px={3}
                      zIndex="2"
                    >
                      {restaurant.resId}
                    </Badge>

                    {/* Open/Closed Status Badge */}
                    <Badge
                      position="absolute"
                      top={2}
                      left={2}
                      colorScheme={isOpen ? "green" : "red"}
                      variant="solid"
                      borderRadius="full"
                      px={3}
                      zIndex="2"
                    >
                      {isOpen ? "Open" : "Closed"}
                    </Badge>
                  </Box>

                  <CardBody py={4}>
                    <Flex justify="space-between" align="center" mb={2}>
                      <Heading size="md" color={!isOpen ? closedTextColor : textColor}>
                        {restaurant.name}
                      </Heading>
                    </Flex>

                    <HStack spacing={2} mb={3}>
                      <Tag size="sm" colorScheme={!isOpen ? "gray" : "teal"} borderRadius="full">
                        <InfoIcon mr={1} fontSize="xs" />
                        {restaurant.address.length > 15
                          ? restaurant.address.substring(0, 15) + "..."
                          : restaurant.address}
                      </Tag>
                    </HStack>

                    {/* Shift status */}
                    <Text fontSize="sm" color={!isOpen ? closedTextColor : "green.500"} mb={3}>
                      <TimeIcon mr={1} fontSize="xs" />
                      {getShiftStatusText(restaurant)}
                    </Text>

                    <Button
                      size="sm"
                      width="full"
                      colorScheme={!isOpen ? "gray" : "teal"}
                      variant={selectedStore === restaurant.id ? "solid" : "outline"}
                      mt={2}
                      isDisabled={!isOpen}
                    >
                      {!isOpen ? "Closed Now" : selectedStore === restaurant.id ? "Selected" : "View Menu"}
                    </Button>
                  </CardBody>
                </Card>
              )
            })}
          </SimpleGrid>
        </Box>
      </SlideFade>

      {/* Products and Kits Section - Visible when a store is selected */}
      <SlideFade
        in={showProducts}
        offsetX="80px"
        offsetY="0"
        transition={{ enter: { duration: 0.5, delay: 0.2 }, exit: { duration: 0.3 } }}
        style={{
          position: !showProducts ? "absolute" : "relative",
          width: "100%",
          zIndex: showProducts ? 1 : 0,
        }}
        ref={productsRef}
      >
        <Box display={{ base: "none", md: "block" }}>
          <Flex align="center" mb={6} mt={2}>
            <Button
              leftIcon={<ChevronLeftIcon />}
              variant="ghost"
              mr={4}
              onClick={handleBackToStores}
              _hover={{
                bg: `${teal500}22`,
                transform: "translateX(-3px)",
              }}
              transition="all 0.2s"
            >
              Back to Restaurants
            </Button>

            <Avatar
              size="md"
              name={selectedStoreData?.name}
              src={selectedStoreData?.image || DEFAULT_RESTAURANT_IMAGE}
              mr={3}
            />
            <Box>
              <Heading size="lg">{selectedStoreData?.name}</Heading>
              <Text color={mutedTextColor}>
                {selectedStoreData?.resId} • {selectedStoreData?.address}
              </Text>
              {selectedStoreData && (
                <Text color="green.500" fontSize="sm">
                  <TimeIcon mr={1} />
                  {getShiftStatusText(selectedStoreData)}
                </Text>
              )}
            </Box>
          </Flex>

          <Tabs variant="soft-rounded" colorScheme="teal" isLazy>
            <TabList mb={6}>
              <Tab _selected={{ color: "white", bg: accentColor }}>Individual Snacks</Tab>
              <Tab _selected={{ color: "white", bg: accentColor }}>Special Kits</Tab>
            </TabList>

            <TabPanels>
              {/* Individual Products Panel */}
              <TabPanel px={0}>
                <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} spacing={6}>
                  {products.map((product) => (
                    <Card
                      key={product.id}
                      overflow="hidden"
                      variant="outline"
                      transition="all 0.3s"
                      _hover={{
                        transform: "translateY(-5px)",
                        shadow: "lg",
                        borderColor: accentColor,
                      }}
                    >
                      <Box position="relative">
                        <Image
                          src={product.image || "/placeholder.svg"}
                          alt={product.name}
                          height="180px"
                          width="100%"
                          objectFit="cover"
                        />
                        {product.isPopular && (
                          <Badge
                            position="absolute"
                            top={2}
                            right={2}
                            colorScheme="red"
                            variant="solid"
                            borderRadius="full"
                            px={3}
                          >
                            Popular
                          </Badge>
                        )}
                      </Box>

                      <CardBody>
                        <Stack spacing={3}>
                          <Heading size="md">{product.name}</Heading>
                          <Text color={mutedTextColor} noOfLines={2}>
                            {product.description}
                          </Text>
                          <Tag width="fit-content" colorScheme="gray" borderRadius="full">
                            {product.category}
                          </Tag>
                        </Stack>
                      </CardBody>

                      <CardFooter
                        justify="space-between"
                        alignItems="center"
                        borderTopWidth="1px"
                        borderColor={subtleColor}
                        py={3}
                      >
                        <Text fontWeight="bold" fontSize="xl" color={textColor}>
                          ${product.price.toFixed(2)}
                        </Text>
                        <Button
                          leftIcon={<AddIcon />}
                          colorScheme="teal"
                          size="sm"
                          _hover={{
                            transform: "scale(1.05)",
                          }}
                          transition="all 0.2s"
                        >
                          Add to Cart
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </SimpleGrid>
              </TabPanel>

              {/* Special Kits Panel */}
              <TabPanel px={0}>
                <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
                  {kits.map((kit) => (
                    <Card
                      key={kit.id}
                      direction={{ base: "column", sm: "row" }}
                      overflow="hidden"
                      variant="outline"
                      borderWidth="1px"
                      borderColor={subtleColor}
                      transition="all 0.3s"
                      _hover={{
                        transform: "translateY(-5px)",
                        shadow: "lg",
                        borderColor: purple500,
                      }}
                    >
                      <Image
                        src={kit.image || "/placeholder.svg"}
                        alt={kit.name}
                        maxW={{ base: "100%", sm: "200px" }}
                        objectFit="cover"
                      />

                      <Stack flex="1">
                        <CardBody>
                          <Flex justify="space-between" align="flex-start">
                            <Heading size="md" mb={2}>
                              {kit.name}
                            </Heading>
                            <Badge colorScheme="green" fontSize="0.8em" p={1} borderRadius="md">
                              {kit.discount}
                            </Badge>
                          </Flex>

                          <Text color={mutedTextColor} mb={4}>
                            {kit.description}
                          </Text>

                          <VStack align="start" spacing={1} mb={4}>
                            {kit.items.map((item, index) => (
                              <Text key={index} fontSize="sm" color={mutedTextColor}>
                                • {item}
                              </Text>
                            ))}
                          </VStack>
                        </CardBody>

                        <CardFooter
                          justify="space-between"
                          alignItems="center"
                          borderTopWidth="1px"
                          borderColor={subtleColor}
                          py={3}
                        >
                          <Text fontWeight="bold" fontSize="xl" color={textColor}>
                            ${kit.price.toFixed(2)}
                          </Text>
                          <Button
                            leftIcon={<AddIcon />}
                            colorScheme="purple"
                            size="sm"
                            _hover={{
                              transform: "scale(1.05)",
                            }}
                            transition="all 0.2s"
                          >
                            Add Kit
                          </Button>
                        </CardFooter>
                      </Stack>
                    </Card>
                  ))}
                </SimpleGrid>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
      </SlideFade>

      {/* Mobile Drawer for Products and Kits */}
      <Drawer isOpen={isOpen} placement="bottom" onClose={onClose} size="full">
        <DrawerOverlay />
        <DrawerContent borderTopRadius="xl">
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">
            <Flex align="center">
              <Button
                leftIcon={<ChevronLeftIcon />}
                variant="ghost"
                mr={4}
                onClick={() => {
                  onClose()
                  setSelectedStore(null)
                }}
                size="sm"
              >
                Back
              </Button>
              {selectedStoreData?.name}
            </Flex>
          </DrawerHeader>
          <DrawerBody p={4}>
            <Tabs variant="soft-rounded" colorScheme="teal" isLazy>
              <TabList mb={6}>
                <Tab _selected={{ color: "white", bg: accentColor }}>Snacks</Tab>
                <Tab _selected={{ color: "white", bg: accentColor }}>Kits</Tab>
              </TabList>

              <TabPanels>
                {/* Individual Products Panel */}
                <TabPanel px={0}>
                  <VStack spacing={4} align="stretch">
                    {products.map((product) => (
                      <Card
                        key={product.id}
                        direction="row"
                        overflow="hidden"
                        variant="outline"
                        transition="all 0.2s"
                        _hover={{
                          shadow: "md",
                          borderColor: accentColor,
                        }}
                      >
                        <Image
                          src={product.image || "/placeholder.svg"}
                          alt={product.name}
                          width="100px"
                          height="100px"
                          objectFit="cover"
                        />

                        <Stack flex="1">
                          <CardBody py={2}>
                            <Heading size="sm">{product.name}</Heading>
                            <Text fontSize="sm" color={mutedTextColor} noOfLines={2} my={1}>
                              {product.description}
                            </Text>
                            <Flex justify="space-between" align="center">
                              <Text fontWeight="bold" color={textColor}>
                                ${product.price.toFixed(2)}
                              </Text>
                              <IconButton
                                aria-label="Add to cart"
                                icon={<AddIcon />}
                                size="sm"
                                colorScheme="teal"
                                isRound
                              />
                            </Flex>
                          </CardBody>
                        </Stack>
                      </Card>
                    ))}
                  </VStack>
                </TabPanel>

                {/* Special Kits Panel */}
                <TabPanel px={0}>
                  <VStack spacing={4} align="stretch">
                    {kits.map((kit) => (
                      <Card
                        key={kit.id}
                        overflow="hidden"
                        variant="outline"
                        transition="all 0.2s"
                        _hover={{
                          shadow: "md",
                          borderColor: purple500,
                        }}
                      >
                        <CardBody>
                          <Flex justify="space-between" align="flex-start" mb={2}>
                            <Heading size="sm">{kit.name}</Heading>
                            <Badge colorScheme="green" fontSize="0.8em">
                              {kit.discount}
                            </Badge>
                          </Flex>

                          <Text fontSize="sm" color={mutedTextColor} mb={2}>
                            {kit.description}
                          </Text>

                          <Flex justify="space-between" align="center">
                            <Text fontWeight="bold" color={textColor}>
                              ${kit.price.toFixed(2)}
                            </Text>
                            <Button leftIcon={<AddIcon />} colorScheme="purple" size="sm">
                              Add Kit
                            </Button>
                          </Flex>
                        </CardBody>
                      </Card>
                    ))}
                  </VStack>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  )
}
