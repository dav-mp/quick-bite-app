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
  Spinner,
  Center,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from "@chakra-ui/react"
import {
  AddIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  LockIcon,
  InfoIcon,
  TimeIcon,
  ChevronDownIcon,
} from "@chakra-ui/icons"
import { restaurantUseCase } from "../../../../app/infrastructure/DI/RestaurantContainer"
import { productUseCase } from "../../../../app/infrastructure/DI/ProductContainer"
import { categoryUseCase } from "../../../../app/infrastructure/DI/CategoryContainer"
import { Restaurant } from "../../../../app/domain/models/restaurant/Restaurant"
import { Product, ProductPrice } from "../../../../app/domain/models/product/Product"
import { Category } from "../../../../app/domain/models/category/Category"


// Default restaurant image
const DEFAULT_RESTAURANT_IMAGE =
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"

// Default product image
const DEFAULT_PRODUCT_IMAGE =
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"

export default function StoreShowcase() {
  const [selectedStore, setSelectedStore] = useState<string | null>(null)
  const [showStores, setShowStores] = useState(true)
  const [showProducts, setShowProducts] = useState(false)
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedPriceOptions, setSelectedPriceOptions] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState({
    restaurants: true,
    products: false,
    categories: false,
  })
  const { isOpen, onOpen, onClose } = useDisclosure()
  const storesRef = useRef<HTMLDivElement>(null)
  const productsRef = useRef<HTMLDivElement>(null)

  // Get theme colors
  const [teal500, _purple500] = useToken("colors", ["teal.500", "purple.500"])

  // Colors
  const cardBg = useColorModeValue("white", "gray.800")
  const accentColor = useColorModeValue("teal.500", "teal.300")
  const subtleColor = useColorModeValue("gray.100", "gray.700")
  const textColor = useColorModeValue("gray.800", "white")
  const mutedTextColor = useColorModeValue("gray.600", "gray.400")
  const closedBg = useColorModeValue("gray.100", "gray.700")
  const closedTextColor = useColorModeValue("gray.500", "gray.400")

  // Fetch restaurants on component mount
  useEffect(() => {
    getRestaurantsOpen()
  }, [])

  // Fetch products and categories when a restaurant is selected
  useEffect(() => {
    if (selectedStore) {
      getProductsAndCategories()
    }
  }, [selectedStore])

  const getRestaurantsOpen = async () => {
    setLoading((prev) => ({ ...prev, restaurants: true }))
    try {
      const resp = await restaurantUseCase.getRestaurantsWithShifts()
      setRestaurants(resp)
    } catch (error) {
      console.error("Error fetching restaurants:", error)
    } finally {
      setLoading((prev) => ({ ...prev, restaurants: false }))
    }
  }

  const getProductsAndCategories = async () => {
    setLoading((prev) => ({ ...prev, products: true, categories: true }))
    try {
      // Fetch products for the selected restaurant
      const productsResp = await productUseCase.getProductsActive()

      // Initialize selected price options with the first price option for each product
      const initialPriceOptions: Record<string, string> = {}
      productsResp.forEach((product) => {
        if (product.productPrices && product.productPrices.length > 0) {
          initialPriceOptions[product.id] = product.productPrices[0].id
        }
      })

      setSelectedPriceOptions(initialPriceOptions)
      setProducts(productsResp)

      // Fetch all categories
      const categoriesResp = await categoryUseCase.getAllCategories()
      setCategories(categoriesResp)

      // Set the first category as selected if there are categories
      if (categoriesResp.length > 0) {
        setSelectedCategory(categoriesResp[0].id)
      }
    } catch (error) {
      console.error("Error fetching products or categories:", error)
    } finally {
      setLoading((prev) => ({ ...prev, products: false, categories: false }))
    }
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

  // Get products filtered by selected category
  const getFilteredProducts = () => {
    if (!selectedCategory) return products
    return products.filter((product) => product.categoryId === selectedCategory)
  }

  // Get category name by ID
  const getCategoryName = (categoryId: string) => {
    const category = categories.find((cat) => cat.id === categoryId)
    return category ? category.name : "Unknown Category"
  }

  // Check if a product is popular (for demo purposes, we'll consider 30% of products as popular)
  const isProductPopular = (productId: string) => {
    // Convert the product ID to a number for deterministic "randomness"
    const numericValue = productId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
    return numericValue % 10 < 3 // 30% chance of being popular
  }

  // Get the selected price for a product
  const getSelectedPrice = (product: Product): number | undefined => {
    if (!product.productPrices || product.productPrices.length === 0) {
      return undefined
    }

    const selectedPriceId = selectedPriceOptions[product.id]
    if (selectedPriceId) {
      const selectedPrice = product.productPrices.find((price) => price.id === selectedPriceId)
      return selectedPrice?.price
    }

    // Default to first price if no selection
    return product.productPrices[0].price
  }

  // Handle price option selection
  const handlePriceSelect = (productId: string, priceId: string) => {
    setSelectedPriceOptions((prev) => ({
      ...prev,
      [productId]: priceId,
    }))
  }

  // Get price option label (for demo purposes)
  const getPriceOptionLabel = (_price: ProductPrice, index: number): string => {
    const sizeOptions = ["Small", "Medium", "Large", "Extra Large"]
    return index < sizeOptions.length ? sizeOptions[index] : `Option ${index + 1}`
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

          {loading.restaurants ? (
            <Center py={10}>
              <Spinner size="xl" color={accentColor} thickness="4px" />
            </Center>
          ) : (
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
          )}
        </Box>
      </SlideFade>

      {/* Products and Categories Section - Visible when a store is selected */}
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

          {loading.categories || loading.products ? (
            <Center py={10}>
              <Spinner size="xl" color={accentColor} thickness="4px" />
            </Center>
          ) : (
            <>
              {/* Category Tabs */}
              <Tabs
                variant="soft-rounded"
                colorScheme="teal"
                isLazy
                onChange={(index) => {
                  if (categories[index]) {
                    setSelectedCategory(categories[index].id)
                  }
                }}
              >
                <TabList
                  mb={6}
                  overflowX="auto"
                  css={{
                    scrollbarWidth: "none",
                    "&::-webkit-scrollbar": {
                      display: "none",
                    },
                  }}
                >
                  {categories.map((category) => (
                    <Tab key={category.id} _selected={{ color: "white", bg: accentColor }} whiteSpace="nowrap">
                      {category.name}
                    </Tab>
                  ))}
                </TabList>

                <TabPanels>
                  {categories.map((category) => (
                    <TabPanel key={category.id} px={0}>
                      <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} spacing={6}>
                        {getFilteredProducts().map((product) => (
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
                                src={product.image || DEFAULT_PRODUCT_IMAGE}
                                alt={product.name}
                                height="180px"
                                width="100%"
                                objectFit="cover"
                                fallbackSrc="/colorful-fruit-display.png"
                              />
                              {isProductPopular(product.id) && (
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
                                  {getCategoryName(product.categoryId)}
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
                              {product.productPrices && product.productPrices.length > 0 ? (
                                <Flex direction="column">
                                  <Text fontWeight="bold" fontSize="xl" color={textColor}>
                                    ${getSelectedPrice(product)?.toFixed(2)}
                                  </Text>

                                  {product.productPrices.length > 1 && (
                                    <Menu>
                                      <MenuButton
                                        as={Button}
                                        size="xs"
                                        variant="outline"
                                        mt={1}
                                        rightIcon={<ChevronDownIcon />}
                                      >
                                        {product.productPrices.findIndex(
                                          (p) => p.id === selectedPriceOptions[product.id],
                                        ) !== -1
                                          ? getPriceOptionLabel(
                                              product.productPrices.find(
                                                (p) => p.id === selectedPriceOptions[product.id],
                                              )!,
                                              product.productPrices.findIndex(
                                                (p) => p.id === selectedPriceOptions[product.id],
                                              ),
                                            )
                                          : "Select Size"}
                                      </MenuButton>
                                      <MenuList>
                                        {product.productPrices.map((price, index) => (
                                          <MenuItem
                                            key={price.id}
                                            onClick={() => handlePriceSelect(product.id, price.id)}
                                          >
                                            {getPriceOptionLabel(price, index)} - ${price.price.toFixed(2)}
                                          </MenuItem>
                                        ))}
                                      </MenuList>
                                    </Menu>
                                  )}
                                </Flex>
                              ) : (
                                <Text fontWeight="bold" fontSize="xl" color={textColor}>
                                  Price not available
                                </Text>
                              )}

                              <Button
                                leftIcon={<AddIcon />}
                                colorScheme="teal"
                                size="sm"
                                _hover={{
                                  transform: "scale(1.05)",
                                }}
                                transition="all 0.2s"
                                isDisabled={!product.productPrices || product.productPrices.length === 0}
                              >
                                Add to Cart
                              </Button>
                            </CardFooter>
                          </Card>
                        ))}
                      </SimpleGrid>
                    </TabPanel>
                  ))}
                </TabPanels>
              </Tabs>
            </>
          )}
        </Box>
      </SlideFade>

      {/* Mobile Drawer for Products */}
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
            {loading.categories || loading.products ? (
              <Center py={10}>
                <Spinner size="xl" color={accentColor} thickness="4px" />
              </Center>
            ) : (
              <Tabs
                variant="soft-rounded"
                colorScheme="teal"
                isLazy
                onChange={(index) => {
                  if (categories[index]) {
                    setSelectedCategory(categories[index].id)
                  }
                }}
              >
                <TabList
                  mb={6}
                  overflowX="auto"
                  css={{
                    scrollbarWidth: "none",
                    "&::-webkit-scrollbar": {
                      display: "none",
                    },
                  }}
                >
                  {categories.map((category) => (
                    <Tab key={category.id} _selected={{ color: "white", bg: accentColor }} whiteSpace="nowrap">
                      {category.name}
                    </Tab>
                  ))}
                </TabList>

                <TabPanels>
                  {categories.map((category) => (
                    <TabPanel key={category.id} px={0}>
                      <VStack spacing={4} align="stretch">
                        {getFilteredProducts().map((product) => (
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
                              src={product.image || DEFAULT_PRODUCT_IMAGE}
                              alt={product.name}
                              width="100px"
                              height="100px"
                              objectFit="cover"
                              fallbackSrc="/colorful-fruit-display.png"
                            />

                            <Stack flex="1">
                              <CardBody py={2}>
                                <Heading size="sm">{product.name}</Heading>
                                <Text fontSize="sm" color={mutedTextColor} noOfLines={2} my={1}>
                                  {product.description}
                                </Text>

                                {product.productPrices && product.productPrices.length > 0 ? (
                                  <Flex justify="space-between" align="center">
                                    <Flex direction="column">
                                      <Text fontWeight="bold" color={textColor}>
                                        ${getSelectedPrice(product)?.toFixed(2)}
                                      </Text>

                                      {product.productPrices.length > 1 && (
                                        <Menu>
                                          <MenuButton
                                            as={Button}
                                            size="xs"
                                            variant="outline"
                                            mt={1}
                                            rightIcon={<ChevronDownIcon />}
                                          >
                                            {product.productPrices.findIndex(
                                              (p) => p.id === selectedPriceOptions[product.id],
                                            ) !== -1
                                              ? getPriceOptionLabel(
                                                  product.productPrices.find(
                                                    (p) => p.id === selectedPriceOptions[product.id],
                                                  )!,
                                                  product.productPrices.findIndex(
                                                    (p) => p.id === selectedPriceOptions[product.id],
                                                  ),
                                                )
                                              : "Select Size"}
                                          </MenuButton>
                                          <MenuList>
                                            {product.productPrices.map((price, index) => (
                                              <MenuItem
                                                key={price.id}
                                                onClick={() => handlePriceSelect(product.id, price.id)}
                                              >
                                                {getPriceOptionLabel(price, index)} - ${price.price.toFixed(2)}
                                              </MenuItem>
                                            ))}
                                          </MenuList>
                                        </Menu>
                                      )}
                                    </Flex>

                                    <IconButton
                                      aria-label="Add to cart"
                                      icon={<AddIcon />}
                                      size="sm"
                                      colorScheme="teal"
                                      isRound
                                      isDisabled={!product.productPrices || product.productPrices.length === 0}
                                    />
                                  </Flex>
                                ) : (
                                  <Flex justify="space-between" align="center">
                                    <Text fontWeight="bold" color={textColor}>
                                      Price not available
                                    </Text>
                                    <IconButton
                                      aria-label="Add to cart"
                                      icon={<AddIcon />}
                                      size="sm"
                                      colorScheme="teal"
                                      isRound
                                      isDisabled={true}
                                    />
                                  </Flex>
                                )}
                              </CardBody>
                            </Stack>
                          </Card>
                        ))}
                      </VStack>
                    </TabPanel>
                  ))}
                </TabPanels>
              </Tabs>
            )}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  )
}
