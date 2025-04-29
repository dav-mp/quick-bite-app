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
  Spinner,
  Center,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  List,
  ListItem,
  Tooltip,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  Container,
  InputGroup,
  InputLeftElement,
  Input,
  ListIcon,
} from "@chakra-ui/react"
import {
  Plus,
  ChevronRight,
  ChevronLeft,
  Lock,
  Clock,
  ChevronDown,
  CheckCircle,
  Star,
  Package,
  Search,
  MapPin,
  Filter,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

// --- Importamos nuestros casos de uso y modelos ---
import { restaurantUseCase } from "../../../../app/infrastructure/DI/RestaurantContainer"
import { productUseCase } from "../../../../app/infrastructure/DI/ProductContainer"
import { categoryUseCase } from "../../../../app/infrastructure/DI/CategoryContainer"
import { kitUseCase } from "../../../../app/infrastructure/DI/KitContainer"
import type { Restaurant } from "../../../../app/domain/models/restaurant/Restaurant"
import type { Product, ProductPrice } from "../../../../app/domain/models/product/Product"
import type { Kit } from "../../../../app/domain/models/kit/Kit"
import type { Category } from "../../../../app/domain/models/category/Category"

// --- Importamos las acciones y el hook de Redux para dispatch y select ---
import { useAppDispatch, useAppSelector } from "../../../../app/infrastructure/store/Hooks"
import {
  addKitToCart,
  addProductToCart,
  clearCart,
  setRestaurantId,
  selectRestaurantId,
} from "../../../../app/infrastructure/store/CartSlice"

const MotionBox = motion(Box)
const MotionCard = motion(Card)
const MotionButton = motion(Button)
const MotionHeading = motion(Heading)

// Default restaurant image
const DEFAULT_RESTAURANT_IMAGE =
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"

// Default product image
const DEFAULT_PRODUCT_IMAGE =
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"

// Default kit image
const DEFAULT_KIT_IMAGE =
  "https://images.unsplash.com/photo-1576866209830-589e1bfbaa4d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"

// Tab types
type TabType = "products" | "kits"

export default function StoreShowcase() {
  const dispatch = useAppDispatch()

  // Obtenemos el restaurantId actual del carrito
  const currentCartRestaurantId = useAppSelector(selectRestaurantId)

  const [selectedStore, setSelectedStore] = useState<string | null>(null)
  const [showStores, setShowStores] = useState(true)
  const [showProducts, setShowProducts] = useState(false)
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [kits, setKits] = useState<Kit[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedPriceOptions, setSelectedPriceOptions] = useState<Record<string, string>>({})
  const [activeTab, setActiveTab] = useState<TabType>("products")
  const [loading, setLoading] = useState({
    restaurants: true,
    products: false,
    categories: false,
    kits: false,
  })
  const [searchTerm, setSearchTerm] = useState("")

  // Para confirmar cambio de restaurante
  const { isOpen: isAlertOpen, onOpen: onAlertOpen, onClose: onAlertClose } = useDisclosure()
  const cancelRef = useRef<HTMLButtonElement>(null)
  const [storeToSwitch, setStoreToSwitch] = useState<string | null>(null)

  const { isOpen, onOpen: onDrawerOpen, onClose: onDrawerClose } = useDisclosure()
  const storesRef = useRef<HTMLDivElement>(null)
  const productsRef = useRef<HTMLDivElement>(null)

  // Colors
  const accentColor = useColorModeValue("pink.500", "pink.300")
  const cardBg = useColorModeValue("white", "gray.800")
  const subtleColor = useColorModeValue("gray.100", "gray.700")
  const textColor = useColorModeValue("gray.800", "white")
  const mutedTextColor = useColorModeValue("gray.600", "gray.400")
  const closedBg = useColorModeValue("gray.100", "gray.700")
  const closedTextColor = useColorModeValue("gray.500", "gray.400")
  const kitBg = useColorModeValue("purple.50", "purple.900")
  const kitAccentColor = useColorModeValue("purple.500", "purple.300")

  const searchIconColor = useColorModeValue("gray.400", "gray.300")

  // 1) Efecto para cargar restaurantes
  useEffect(() => {
    getRestaurantsOpen()
  }, [])

  // 2) Efecto para cargar productos, categorías, kits cuando se elige un restaurante
  useEffect(() => {
    if (selectedStore) {
      getProductsAndCategories()
      getKits()
    }
  }, [selectedStore])

  // ----------------------------------
  //        OBTENER RESTAURANTES
  // ----------------------------------
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

  // ----------------------------------
  //      OBTENER PRODUCTOS Y CAT
  // ----------------------------------
  const getProductsAndCategories = async () => {
    setLoading((prev) => ({ ...prev, products: true, categories: true }))
    try {
      const productsResp = await productUseCase.getProductsActive()

      // Inicializamos selected price options
      const initialPriceOptions: Record<string, string> = {}
      productsResp.forEach((product) => {
        if (product.productPrices && product.productPrices.length > 0) {
          initialPriceOptions[product.id] = product.productPrices[0].id
        }
      })

      setSelectedPriceOptions(initialPriceOptions)
      setProducts(productsResp)

      const categoriesResp = await categoryUseCase.getAllCategories()
      setCategories(categoriesResp)

      // Seleccionamos la primera categoría si existe
      if (categoriesResp.length > 0) {
        setSelectedCategory(categoriesResp[0].id)
      }
    } catch (error) {
      console.error("Error fetching products or categories:", error)
    } finally {
      setLoading((prev) => ({ ...prev, products: false, categories: false }))
    }
  }

  // ----------------------------------
  //         OBTENER KITS
  // ----------------------------------
  const getKits = async () => {
    setLoading((prev) => ({ ...prev, kits: true }))
    try {
      const kitsResp = await kitUseCase.getAllKitsWithProducts()
      setKits(kitsResp)
    } catch (error) {
      console.error("Error fetching kits:", error)
    } finally {
      setLoading((prev) => ({ ...prev, kits: false }))
    }
  }

  // ----------------------------------
  //    CHEQUEAR SI RESTAURANTE ABIERTO
  // ----------------------------------
  const isRestaurantOpen = (restaurant: Restaurant): boolean => {
    if (!restaurant.Shift || restaurant.Shift.length === 0) return false
    const latestShift = restaurant.Shift[restaurant.Shift.length - 1]
    return !!latestShift.openShift && !latestShift.closeShift
  }

  // ----------------------------------
  //  MANEJAR SELECCIÓN DE RESTAURANTE
  // ----------------------------------
  const handleStoreSelect = (storeId: string) => {
    const restaurant = restaurants.find((r) => r.id === storeId)
    if (!restaurant || !isRestaurantOpen(restaurant)) return

    // Si actualmente no hay restaurante en el carrito, o coincide con el que se quiere seleccionar:
    if (!currentCartRestaurantId || currentCartRestaurantId === storeId) {
      // Simplemente seleccionamos y fijamos este restaurante en el carrito
      dispatch(setRestaurantId(storeId))
      setSelectedStore(storeId)

      // En mobile => abrimos Drawer
      if (window.innerWidth < 768) {
        onDrawerOpen()
      } else {
        // Desktop => animamos
        setShowStores(false)
        setTimeout(() => {
          setShowProducts(true)
        }, 300)
      }
    } else {
      // Significa que el carrito ya tenía un restaurante distinto,
      // necesitamos confirmar si se vacía el carrito.
      setStoreToSwitch(storeId)
      onAlertOpen() // Abrimos el AlertDialog para confirmar
    }
  }

  // ----------------------------------
  //      VOLVER A LISTA RESTAURANTES
  // ----------------------------------
  const handleBackToStores = () => {
    setShowProducts(false)
    setTimeout(() => {
      setShowStores(true)
      setSelectedStore(null)
    }, 300)
  }

  // Manejar confirmación del cambio de restaurante
  const handleConfirmChangeRestaurant = () => {
    if (storeToSwitch) {
      // Vaciamos el carrito y seteamos el nuevo restaurante
      dispatch(clearCart())
      dispatch(setRestaurantId(storeToSwitch))
      setSelectedStore(storeToSwitch)
    }
    onAlertClose()
    setStoreToSwitch(null)

    // Modo responsive
    if (window.innerWidth < 768) {
      onDrawerOpen()
    } else {
      setShowStores(false)
      setTimeout(() => {
        setShowProducts(true)
      }, 300)
    }
  }

  // Manejar cancelación del cambio de restaurante
  const handleCancelChangeRestaurant = () => {
    setStoreToSwitch(null)
    onAlertClose()
  }

  // Dato del restaurante seleccionado
  const selectedStoreData = restaurants.find((store) => store.id === selectedStore)

  // ----------------------------------
  //    ESTADO DEL TURNO (TEXTO)
  // ----------------------------------
  const getShiftStatusText = (restaurant: Restaurant): string => {
    if (!restaurant.Shift || restaurant.Shift.length === 0) {
      return "No Shifts"
    }
    const latestShift = restaurant.Shift[restaurant.Shift.length - 1]
    if (latestShift.openShift && !latestShift.closeShift) {
      const openTime = new Date(latestShift.openShift)
      const formattedTime = openTime.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
      return `Open since ${formattedTime}`
    } else if (latestShift.openShift && latestShift.closeShift) {
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

  // ----------------------------------
  //   FILTRADO DE PRODUCTOS POR CAT
  // ----------------------------------
  const getFilteredProducts = () => {
    if (!selectedCategory) return products
    let filtered = products.filter((product) => product.categoryId === selectedCategory)

    // Apply search filter if there's a search term
    if (searchTerm.trim() !== "") {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchLower) ||
          (product.description && product.description.toLowerCase().includes(searchLower)),
      )
    }

    return filtered
  }

  // ----------------------------------
  //   OBTENER NOMBRE DE CATEGORÍA
  // ----------------------------------
  const getCategoryName = (categoryId: string) => {
    const category = categories.find((cat) => cat.id === categoryId)
    return category ? category.name : "Unknown Category"
  }

  // ----------------------------------
  //  PRODUCTO "POPULAR" (demo)
  // ----------------------------------
  const isProductPopular = (productId: string) => {
    const numericValue = productId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
    return numericValue % 10 < 3
  }

  // ----------------------------------
  //      OBTENER PRECIO SELECCIONADO
  // ----------------------------------
  const getSelectedPrice = (product: Product): number | undefined => {
    if (!product.productPrices || product.productPrices.length === 0) return undefined
    const selectedPriceId = selectedPriceOptions[product.id]
    if (selectedPriceId) {
      const selectedPrice = product.productPrices.find((price) => price.id === selectedPriceId)
      return selectedPrice?.price
    }
    return product.productPrices[0].price
  }

  // ----------------------------------
  //         OBTENER PRECIO DE KIT
  // ----------------------------------
  const getKitPrice = (kit: Kit): number | undefined => {
    if (!kit.KitPrice || kit.KitPrice.length === 0) return undefined
    return kit.KitPrice[0].price
  }

  // ----------------------------------
  //  SELECCIONAR UNA OPCIÓN DE PRECIO
  // ----------------------------------
  const handlePriceSelect = (productId: string, priceId: string) => {
    setSelectedPriceOptions((prev) => ({
      ...prev,
      [productId]: priceId,
    }))
  }

  // ----------------------------------
  // ETIQUETA PARA UNA OPCIÓN DE PRECIO
  // ----------------------------------
  const getPriceOptionLabel = (_price: ProductPrice, index: number): string => {
    const sizeOptions = ["Small", "Medium", "Large", "Extra Large"]
    return index < sizeOptions.length ? sizeOptions[index] : `Option ${index + 1}`
  }

  // ----------------------------------
  //  OBTENER NOMBRE DE PRODUCTO
  // ----------------------------------
  const getProductName = (productId: string): string => {
    const product = products.find((p) => p.id === productId)
    return product ? product.name : "Unknown Product"
  }

  // ----------------------------------
  //     MANEJAR CAMBIO DE TAB
  // ----------------------------------
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab)
  }

  // ----------------------------------
  //    HANDLERS PARA EL CARRITO
  // ----------------------------------
  const handleAddProductToCart = (product: Product) => {
    const selectedPriceId = selectedPriceOptions[product.id]
    dispatch(
      addProductToCart({
        product,
        quantity: 1,
        selectedPriceId,
      }),
    )
  }

  const handleAddKitToCart = (kit: Kit) => {
    dispatch(
      addKitToCart({
        kit,
        quantity: 1,
      }),
    )
  }

  // Filter restaurants based on search term
  const filteredRestaurants =
    searchTerm.trim() !== ""
      ? restaurants.filter(
          (restaurant) =>
            restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            restaurant.address.toLowerCase().includes(searchTerm.toLowerCase()),
        )
      : restaurants

  // ----------------------------------
  //             RENDER
  // ----------------------------------
  return (
    <Container maxW="container.xl" px={{ base: 2, md: 4 }}>
      <AnimatePresence mode="wait">
        {showStores && (
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            ref={storesRef}
          >
            {/* Hero Section */}
            <MotionBox
              bg="linear-gradient(135deg, #FF0080 0%, #7928CA 100%)"
              color="white"
              py={8}
              px={6}
              borderRadius="2xl"
              mb={8}
              position="relative"
              overflow="hidden"
              boxShadow="xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
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

              <MotionHeading
                size="xl"
                fontWeight="extrabold"
                mb={2}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                Discover Amazing Food
              </MotionHeading>
              <MotionBox
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                <Text fontSize="lg" opacity={0.9} mb={6}>
                  Find your favorite meals and special combos
                </Text>

                <InputGroup maxW="md" bg="rgba(255,255,255,0.15)" borderRadius="full" overflow="hidden">
                  <InputLeftElement pointerEvents="none">
                    <Search color="white" size={18} />
                  </InputLeftElement>
                  <Input
                    placeholder="Search restaurants or locations..."
                    border="none"
                    color="white"
                    _placeholder={{ color: "whiteAlpha.700" }}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </InputGroup>
              </MotionBox>
            </MotionBox>

            {/* Restaurants Section */}
            <Box mb={selectedStore ? 8 : 0}>
              <Flex justify="space-between" align="center" mb={4}>
                <Heading size="lg" fontWeight="bold">
                  Available Restaurants
                </Heading>
                <HStack>
                  <IconButton
                    aria-label="Filter options"
                    icon={<Filter size={18} />}
                    variant="ghost"
                    borderRadius="full"
                    colorScheme="pink"
                  />
                  <Button
                    variant="ghost"
                    rightIcon={<ChevronRight size={16} />}
                    color={accentColor}
                    _hover={{ bg: "pink.50" }}
                  >
                    View All
                  </Button>
                </HStack>
              </Flex>

              {loading.restaurants ? (
                <Center py={10}>
                  <Spinner size="xl" color={accentColor} thickness="4px" />
                </Center>
              ) : (
                <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={6}>
                  <AnimatePresence>
                    {filteredRestaurants.map((restaurant, index) => {
                      const isOpen = isRestaurantOpen(restaurant)

                      return (
                        <MotionCard
                          key={restaurant.id}
                          overflow="hidden"
                          variant="outline"
                          bg={!isOpen ? closedBg : cardBg}
                          opacity={!isOpen ? 0.8 : 1}
                          borderWidth={selectedStore === restaurant.id ? "2px" : "1px"}
                          borderColor={selectedStore === restaurant.id ? accentColor : "transparent"}
                          borderRadius="xl"
                          boxShadow={isOpen ? "md" : "none"}
                          cursor={isOpen ? "pointer" : "default"}
                          position="relative"
                          onClick={() => isOpen && handleStoreSelect(restaurant.id)}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          whileHover={isOpen ? { y: -5, boxShadow: "lg" } : {}}
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
                              <Lock size={24} color="red" />
                              <Text fontWeight="bold" color="red.500" mt={2}>
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
                              <Tag size="sm" colorScheme={!isOpen ? "gray" : "pink"} borderRadius="full">
                                <MapPin size={12} style={{ marginRight: "4px" }} />
                                {restaurant.address.length > 15
                                  ? restaurant.address.substring(0, 15) + "..."
                                  : restaurant.address}
                              </Tag>
                            </HStack>

                            <Text fontSize="sm" color={!isOpen ? closedTextColor : "green.500"} mb={3}>
                              <Clock size={12} style={{ display: "inline", marginRight: "4px" }} />
                              {getShiftStatusText(restaurant)}
                            </Text>

                            <MotionButton
                              size="sm"
                              width="full"
                              colorScheme={!isOpen ? "gray" : "pink"}
                              variant={selectedStore === restaurant.id ? "solid" : "outline"}
                              mt={2}
                              isDisabled={!isOpen}
                              whileHover={{ scale: isOpen ? 1.03 : 1 }}
                              whileTap={{ scale: isOpen ? 0.97 : 1 }}
                            >
                              {!isOpen ? "Closed Now" : selectedStore === restaurant.id ? "Selected" : "View Menu"}
                            </MotionButton>
                          </CardBody>
                        </MotionCard>
                      )
                    })}
                  </AnimatePresence>
                </SimpleGrid>
              )}
            </Box>
          </MotionBox>
        )}

        {showProducts && (
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            ref={productsRef}
          >
            <Flex align="center" mb={6} mt={2}>
              <MotionButton
                leftIcon={<ChevronLeft size={16} />}
                variant="ghost"
                mr={4}
                onClick={handleBackToStores}
                _hover={{
                  bg: `${accentColor}22`,
                }}
                whileHover={{ x: -3 }}
                whileTap={{ scale: 0.95 }}
              >
                Back to Restaurants
              </MotionButton>

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
                    <Clock size={12} style={{ display: "inline", marginRight: "4px" }} />
                    {getShiftStatusText(selectedStoreData)}
                  </Text>
                )}
              </Box>
            </Flex>

            {/* Search Bar */}
            <InputGroup mb={6} maxW="md">
              <InputLeftElement pointerEvents="none">
                <Search size={18} color={searchIconColor} />
              </InputLeftElement>
              <Input
                placeholder="Search for food..."
                borderRadius="full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                bg={useColorModeValue("white", "gray.800")}
                border="1px solid"
                borderColor={useColorModeValue("gray.200", "gray.700")}
                _focus={{
                  borderColor: accentColor,
                  boxShadow: `0 0 0 1px ${accentColor}`,
                }}
              />
            </InputGroup>

            {/* Main/Kits Tab Selector */}
            <Flex mb={6} borderBottom="1px" borderColor={subtleColor}>
              <MotionButton
                variant="ghost"
                colorScheme={activeTab === "products" ? "pink" : "gray"}
                borderBottom={activeTab === "products" ? "2px solid" : "none"}
                borderRadius="0"
                mr={4}
                onClick={() => handleTabChange("products")}
                px={6}
                py={4}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                Individual Products
              </MotionButton>
              <MotionButton
                variant="ghost"
                colorScheme={activeTab === "kits" ? "purple" : "gray"}
                borderBottom={activeTab === "kits" ? "2px solid" : "none"}
                borderRadius="0"
                onClick={() => handleTabChange("kits")}
                px={6}
                py={4}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                Meal Kits & Combos
              </MotionButton>
            </Flex>

            {loading.categories || loading.products || loading.kits ? (
              <Center py={10}>
                <Spinner size="xl" color={accentColor} thickness="4px" />
              </Center>
            ) : (
              <>
                {/* Products Tab Content */}
                {activeTab === "products" && (
                  <Box>
                    {/* Category Tabs */}
                    <Tabs
                      variant="soft-rounded"
                      colorScheme="pink"
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
                          <Tab
                            key={category.id}
                            _selected={{ color: "white", bg: accentColor }}
                            whiteSpace="nowrap"
                            mx={1}
                          >
                            {category.name}
                          </Tab>
                        ))}
                      </TabList>

                      <TabPanels>
                        {categories.map((category) => (
                          <TabPanel key={category.id} px={0}>
                            <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} spacing={6}>
                              <AnimatePresence>
                                {getFilteredProducts().map((product, index) => (
                                  <MotionCard
                                    key={product.id}
                                    overflow="hidden"
                                    variant="outline"
                                    borderRadius="xl"
                                    boxShadow="md"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: index * 0.05 }}
                                    whileHover={{ y: -5, boxShadow: "xl" }}
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
                                        <Tag
                                          width="fit-content"
                                          colorScheme="pink"
                                          borderRadius="full"
                                          variant="subtle"
                                        >
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
                                          <Text fontWeight="bold" fontSize="xl" color={accentColor}>
                                            ${getSelectedPrice(product)?.toFixed(2)}
                                          </Text>

                                          {product.productPrices.length > 1 && (
                                            <Menu>
                                              <MenuButton
                                                as={Button}
                                                size="xs"
                                                variant="outline"
                                                mt={1}
                                                rightIcon={<ChevronDown size={12} />}
                                                colorScheme="pink"
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

                                      <MotionButton
                                        leftIcon={<Plus size={16} />}
                                        colorScheme="pink"
                                        size="sm"
                                        isDisabled={!product.productPrices || product.productPrices.length === 0}
                                        onClick={() => handleAddProductToCart(product)}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                      >
                                        Add to Cart
                                      </MotionButton>
                                    </CardFooter>
                                  </MotionCard>
                                ))}
                              </AnimatePresence>
                            </SimpleGrid>
                          </TabPanel>
                        ))}
                      </TabPanels>
                    </Tabs>
                  </Box>
                )}

                {/* Kits Tab Content */}
                {activeTab === "kits" && (
                  <Box>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                      <AnimatePresence>
                        {kits.map((kit, index) => (
                          <MotionCard
                            key={kit.id}
                            overflow="hidden"
                            variant="outline"
                            bg={kitBg}
                            borderRadius="xl"
                            boxShadow="md"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                            whileHover={{ y: -5, boxShadow: "xl" }}
                          >
                            <Box position="relative">
                              <Image
                                src={kit.image || DEFAULT_KIT_IMAGE}
                                alt={kit.name}
                                height="200px"
                                width="100%"
                                objectFit="cover"
                                fallbackSrc="/classic-burger-fries-drink.png"
                              />
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
                                Combo
                              </Badge>
                            </Box>

                            <CardBody>
                              <Stack spacing={3}>
                                <Heading size="md" color={textColor}>
                                  {kit.name}
                                </Heading>
                                <Text color={mutedTextColor} noOfLines={2}>
                                  {kit.description}
                                </Text>

                                <Box>
                                  <Text fontWeight="medium" mb={2}>
                                    Includes:
                                  </Text>
                                  <List spacing={1}>
                                    {kit.ProductKit.map((kitProduct) => (
                                      <ListItem key={kitProduct.productId} fontSize="sm">
                                        <ListIcon as={CheckCircle} color={kitAccentColor} />
                                        {kitProduct.quantity}x {getProductName(kitProduct.productId)}
                                      </ListItem>
                                    ))}
                                  </List>
                                </Box>
                              </Stack>
                            </CardBody>

                            <CardFooter
                              justify="space-between"
                              alignItems="center"
                              borderTopWidth="1px"
                              borderColor={`${kitAccentColor}33`}
                              py={3}
                            >
                              <Flex direction="column">
                                <Text fontWeight="bold" fontSize="xl" color={kitAccentColor}>
                                  ${getKitPrice(kit)?.toFixed(2)}
                                </Text>
                                <Badge colorScheme="purple" variant="subtle" mt={1}>
                                  <Star size={12} style={{ marginRight: "4px", display: "inline" }} />
                                  Save up to 15%
                                </Badge>
                              </Flex>

                              <MotionButton
                                leftIcon={<Package size={16} />}
                                colorScheme="purple"
                                size="sm"
                                onClick={() => handleAddKitToCart(kit)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                Add Kit to Cart
                              </MotionButton>
                            </CardFooter>
                          </MotionCard>
                        ))}
                      </AnimatePresence>
                    </SimpleGrid>
                  </Box>
                )}
              </>
            )}
          </MotionBox>
        )}
      </AnimatePresence>

      {/* Mobile Drawer for Products */}
      <Drawer isOpen={isOpen} placement="bottom" onClose={onDrawerClose} size="full">
        <DrawerOverlay backdropFilter="blur(5px)" />
        <DrawerContent borderTopRadius="xl">
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">
            <Flex align="center">
              <Button
                leftIcon={<ChevronLeft size={16} />}
                variant="ghost"
                mr={4}
                onClick={() => {
                  onDrawerClose()
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
            {/* Mobile Tab Selector */}
            <Flex mb={4} justify="center">
              <Button
                variant="outline"
                colorScheme={activeTab === "products" ? "pink" : "gray"}
                mr={2}
                onClick={() => handleTabChange("products")}
                size="sm"
                flex={1}
              >
                Products
              </Button>
              <Button
                variant="outline"
                colorScheme={activeTab === "kits" ? "purple" : "gray"}
                onClick={() => handleTabChange("kits")}
                size="sm"
                flex={1}
              >
                Kits & Combos
              </Button>
            </Flex>

            {/* Search Bar */}
            <InputGroup mb={4}>
              <InputLeftElement pointerEvents="none">
                <Search size={18} color={searchIconColor} />
              </InputLeftElement>
              <Input
                placeholder="Search for food..."
                borderRadius="full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>

            {loading.categories || loading.products || loading.kits ? (
              <Center py={10}>
                <Spinner size="xl" color={accentColor} thickness="4px" />
              </Center>
            ) : (
              <>
                {/* Mobile Products Tab Content */}
                {activeTab === "products" && (
                  <Tabs
                    variant="soft-rounded"
                    colorScheme="pink"
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
                        <Tab
                          key={category.id}
                          _selected={{ color: "white", bg: accentColor }}
                          whiteSpace="nowrap"
                          mx={1}
                        >
                          {category.name}
                        </Tab>
                      ))}
                    </TabList>

                    <TabPanels>
                      {categories.map((category) => (
                        <TabPanel key={category.id} px={0}>
                          <VStack spacing={4} align="stretch">
                            <AnimatePresence>
                              {getFilteredProducts().map((product, index) => (
                                <MotionCard
                                  key={product.id}
                                  direction="row"
                                  overflow="hidden"
                                  variant="outline"
                                  borderRadius="lg"
                                  boxShadow="sm"
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ duration: 0.3, delay: index * 0.05 }}
                                  whileHover={{ x: 5 }}
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
                                            <Text fontWeight="bold" color={accentColor}>
                                              ${getSelectedPrice(product)?.toFixed(2)}
                                            </Text>

                                            {product.productPrices.length > 1 && (
                                              <Menu>
                                                <MenuButton
                                                  as={Button}
                                                  size="xs"
                                                  variant="outline"
                                                  mt={1}
                                                  rightIcon={<ChevronDown size={12} />}
                                                  colorScheme="pink"
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
                                            icon={<Plus size={16} />}
                                            size="sm"
                                            colorScheme="pink"
                                            isRound
                                            isDisabled={!product.productPrices || product.productPrices.length === 0}
                                            onClick={() => handleAddProductToCart(product)}
                                          />
                                        </Flex>
                                      ) : (
                                        <Flex justify="space-between" align="center">
                                          <Text fontWeight="bold" color={textColor}>
                                            Price not available
                                          </Text>
                                          <IconButton
                                            aria-label="Add to cart"
                                            icon={<Plus size={16} />}
                                            size="sm"
                                            colorScheme="pink"
                                            isRound
                                            isDisabled={true}
                                          />
                                        </Flex>
                                      )}
                                    </CardBody>
                                  </Stack>
                                </MotionCard>
                              ))}
                            </AnimatePresence>
                          </VStack>
                        </TabPanel>
                      ))}
                    </TabPanels>
                  </Tabs>
                )}

                {/* Mobile Kits Tab Content */}
                {activeTab === "kits" && (
                  <VStack spacing={4} align="stretch">
                    <AnimatePresence>
                      {kits.map((kit, index) => (
                        <MotionCard
                          key={kit.id}
                          overflow="hidden"
                          variant="outline"
                          bg={kitBg}
                          borderRadius="lg"
                          boxShadow="sm"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          whileHover={{ x: 5 }}
                        >
                          <Box position="relative">
                            <Image
                              src={kit.image || DEFAULT_KIT_IMAGE}
                              alt={kit.name}
                              height="120px"
                              width="100%"
                              objectFit="cover"
                              fallbackSrc="/classic-burger-fries-drink.png"
                            />
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
                              Combo
                            </Badge>
                          </Box>

                          <CardBody py={3}>
                            <Heading size="sm" mb={1}>
                              {kit.name}
                            </Heading>
                            <Text fontSize="xs" color={mutedTextColor} noOfLines={2} mb={2}>
                              {kit.description}
                            </Text>

                            <Flex justify="space-between" align="center">
                              <Flex direction="column">
                                <Text fontWeight="bold" color={kitAccentColor}>
                                  ${getKitPrice(kit)?.toFixed(2)}
                                </Text>
                                <Badge colorScheme="purple" variant="subtle" mt={1} fontSize="2xs">
                                  <Star size={10} style={{ marginRight: "4px", display: "inline" }} />
                                  Save up to 15%
                                </Badge>
                              </Flex>

                              <Tooltip
                                label={kit.ProductKit.map(
                                  (kp) => `${kp.quantity}x ${getProductName(kp.productId)}`,
                                ).join(", ")}
                              >
                                <Button
                                  leftIcon={<Package size={14} />}
                                  colorScheme="purple"
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleAddKitToCart(kit)}
                                >
                                  Add Kit
                                </Button>
                              </Tooltip>
                            </Flex>
                          </CardBody>
                        </MotionCard>
                      ))}
                    </AnimatePresence>
                  </VStack>
                )}
              </>
            )}
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* AlertDialog para confirmar cambio de restaurante */}
      <AlertDialog isOpen={isAlertOpen} leastDestructiveRef={cancelRef} onClose={onAlertClose} isCentered>
        <AlertDialogOverlay>
          <AlertDialogContent borderRadius="xl">
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Change Restaurant
            </AlertDialogHeader>

            <AlertDialogBody>
              You have items in your cart from another restaurant. If you change restaurants, your cart will be emptied.
              Do you want to continue?
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={handleCancelChangeRestaurant}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleConfirmChangeRestaurant} ml={3}>
                Change
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Container>
  )
}
