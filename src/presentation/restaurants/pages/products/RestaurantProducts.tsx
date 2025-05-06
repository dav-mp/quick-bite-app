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
  CardBody,
  CardFooter,
  Badge,
  Button,
  VStack,
  HStack,
  Image,
  useColorModeValue,
  Spinner,
  Center,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  useDisclosure,
  InputGroup,
  InputLeftElement,
  Input,
  FormControl,
  FormLabel,
  Switch,
  Select,
  Textarea,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from "@chakra-ui/react"
import { motion } from "framer-motion"
import {
  Search,
  Plus,
  Edit,
  Trash2,
  MoreVertical,
  Tag,
  DollarSign,
  ImageIcon,
  Package,
  Filter,
  ArrowUpDown,
} from "lucide-react"
import { productUseCase } from "../../../../app/infrastructure/DI/ProductContainer"
import { categoryUseCase } from "../../../../app/infrastructure/DI/CategoryContainer"
import { kitUseCase } from "../../../../app/infrastructure/DI/KitContainer"
import type { Product } from "../../../../app/domain/models/product/Product"
import type { Category } from "../../../../app/domain/models/category/Category"
import type { Kit } from "../../../../app/domain/models/kit/Kit"

const MotionCard = motion(Card)
const MotionBox = motion(Box)

// Default images
const DEFAULT_PRODUCT_IMAGE =
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
const DEFAULT_KIT_IMAGE =
  "https://images.unsplash.com/photo-1576866209830-589e1bfbaa4d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"

export default function RestaurantProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [kits, setKits] = useState<Kit[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState({
    products: true,
    kits: true,
    categories: true,
  })
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [sortAlphabetical, setSortAlphabetical] = useState(true)
  const toast = useToast()

  // For product/kit edit modal
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [isEditing, setIsEditing] = useState(false)
  const [currentItem, setCurrentItem] = useState<Product | Kit | null>(null)
  const [itemType, setItemType] = useState<"product" | "kit">("product")

  // Colors
  const accentColor = useColorModeValue("teal.500", "teal.300")
  const secondaryColor = useColorModeValue("purple.500", "purple.300")
  const subtleColor = useColorModeValue("gray.100", "gray.700")
  const mutedTextColor = useColorModeValue("gray.600", "gray.400")
  const borderColor = useColorModeValue("gray.200", "gray.700")
  const gradientStart = useColorModeValue("teal.50", "gray.700")
  const gradientEnd = useColorModeValue("purple.50", "gray.900")

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading({ products: true, kits: true, categories: true })
      setError(null)

      // Fetch products
      const productsData = await productUseCase.getAllProducts()
      setProducts(productsData)
      setLoading((prev) => ({ ...prev, products: false }))

      // Fetch kits
      const kitsData = await kitUseCase.getAllKitsWithProducts()
      setKits(kitsData)
      setLoading((prev) => ({ ...prev, kits: false }))

      // Fetch categories
      const categoriesData = await categoryUseCase.getAllCategories()
      setCategories(categoriesData)
      setSelectedCategory(categoriesData.length > 0 ? categoriesData[0].id : null)
      setLoading((prev) => ({ ...prev, categories: false }))
    } catch (err: any) {
      console.error("Error fetching data:", err)
      setError(err.message || "Failed to load data")
      setLoading({ products: false, kits: false, categories: false })
    }
  }

  const handleOpenModal = (item: Product | Kit | null, type: "product" | "kit", edit = false) => {
    setCurrentItem(item)
    setItemType(type)
    setIsEditing(edit)
    onOpen()
  }

  const toggleSortOrder = () => {
    setSortAlphabetical(!sortAlphabetical)
  }

  const getCategoryName = (categoryId: string) => {
    const category = categories.find((cat) => cat.id === categoryId)
    return category ? category.name : "Unknown Category"
  }

  // Filter and sort products
  const getFilteredAndSortedProducts = () => {
    return products
      .filter((product) => {
        // Filter by category if selected
        if (selectedCategory && product.categoryId !== selectedCategory) return false

        // Filter by search term
        if (searchTerm === "") return true

        const searchLower = searchTerm.toLowerCase()
        return (
          product.name.toLowerCase().includes(searchLower) || product.description.toLowerCase().includes(searchLower)
        )
      })
      .sort((a, b) => {
        if (sortAlphabetical) {
          return a.name.localeCompare(b.name)
        } else {
          return b.name.localeCompare(a.name)
        }
      })
  }

  // Filter and sort kits
  const getFilteredAndSortedKits = () => {
    return kits
      .filter((kit) => {
        if (searchTerm === "") return true

        const searchLower = searchTerm.toLowerCase()
        return kit.name.toLowerCase().includes(searchLower) || kit.description.toLowerCase().includes(searchLower)
      })
      .sort((a, b) => {
        if (sortAlphabetical) {
          return a.name.localeCompare(b.name)
        } else {
          return b.name.localeCompare(a.name)
        }
      })
  }

  const filteredProducts = getFilteredAndSortedProducts()
  const filteredKits = getFilteredAndSortedKits()

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
          Manage Products
        </Heading>
        <Text color={mutedTextColor}>View and manage your products and meal kits</Text>
      </Box>

      {/* Search and Filter Section */}
      <Flex mb={6} justify="space-between" align="center" wrap="wrap" gap={4}>
        <InputGroup maxW={{ base: "full", md: "320px" }}>
          <InputLeftElement pointerEvents="none">
            <Search color={useColorModeValue("gray.400", "gray.300")} size={18} />
          </InputLeftElement>
          <Input
            placeholder="Search products or kits"
            borderRadius="full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </InputGroup>

        <HStack>
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
            {sortAlphabetical ? "A to Z" : "Z to A"}
          </Button>
          <Button
            leftIcon={<Plus size={16} />}
            colorScheme="teal"
            size="sm"
            onClick={() => handleOpenModal(null, "product", false)}
          >
            Add Product
          </Button>
        </HStack>
      </Flex>

      {/* Error State */}
      {error && (
        <Box bg="red.50" color="red.500" p={4} borderRadius="md" mb={6}>
          <Flex align="center">
            <Trash2 size={20} style={{ marginRight: "8px" }} />
            <Text fontWeight="medium">{error}</Text>
          </Flex>
        </Box>
      )}

      {/* Tabs for Products and Kits */}
      <Tabs colorScheme="teal" borderRadius="lg" variant="enclosed">
        <TabList>
          <Tab _selected={{ color: accentColor, borderColor: "currentColor" }}>Products</Tab>
          <Tab _selected={{ color: accentColor, borderColor: "currentColor" }}>Meal Kits</Tab>
        </TabList>

        <TabPanels>
          {/* Products Tab */}
          <TabPanel px={0}>
            {loading.products || loading.categories ? (
              <Center py={10}>
                <VStack spacing={4}>
                  <Spinner size="xl" color={accentColor} thickness="4px" />
                  <Text color={mutedTextColor}>Loading products...</Text>
                </VStack>
              </Center>
            ) : (
              <>
                {/* Category Filter */}
                <HStack spacing={2} overflowX="auto" py={4} mb={4}>
                  {categories.map((category) => (
                    <Button
                      key={category.id}
                      size="sm"
                      variant={selectedCategory === category.id ? "solid" : "outline"}
                      colorScheme="teal"
                      onClick={() => setSelectedCategory(category.id)}
                    >
                      {category.name}
                    </Button>
                  ))}
                </HStack>

                {filteredProducts.length === 0 ? (
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
                      <Tag size={32} color={accentColor} />
                    </Box>
                    <Heading size="lg" mb={2}>
                      No Products Found
                    </Heading>
                    <Text color={mutedTextColor} maxW="500px" mx="auto" mb={6}>
                      {searchTerm
                        ? `No products match your search "${searchTerm}"`
                        : "No products found in this category"}
                    </Text>
                    <Button
                      colorScheme="teal"
                      leftIcon={<Plus size={16} />}
                      onClick={() => handleOpenModal(null, "product", false)}
                    >
                      Add New Product
                    </Button>
                  </MotionBox>
                ) : (
                  <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                    {filteredProducts.map((product, index) => (
                      <MotionCard
                        key={product.id}
                        borderRadius="xl"
                        overflow="hidden"
                        boxShadow="md"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        whileHover={{ y: -5, boxShadow: "lg" }}
                      >
                        <Box position="relative">
                          <Image
                            src={product.image || DEFAULT_PRODUCT_IMAGE}
                            alt={product.name}
                            height="180px"
                            width="100%"
                            objectFit="cover"
                            fallbackSrc="/placeholder.svg?height=180&width=500"
                          />
                          <Badge
                            position="absolute"
                            top={2}
                            left={2}
                            colorScheme={product.status ? "green" : "red"}
                            borderRadius="full"
                            px={2}
                          >
                            {product.status ? "Active" : "Inactive"}
                          </Badge>
                          <Menu>
                            <MenuButton
                              as={IconButton}
                              icon={<MoreVertical size={16} />}
                              variant="ghost"
                              colorScheme="gray"
                              position="absolute"
                              top={2}
                              right={2}
                              size="sm"
                              borderRadius="full"
                              bg="whiteAlpha.800"
                              _hover={{ bg: "whiteAlpha.900" }}
                            />
                            <MenuList>
                              <MenuItem
                                icon={<Edit size={16} />}
                                onClick={() => handleOpenModal(product, "product", true)}
                              >
                                Edit Product
                              </MenuItem>
                              <MenuItem icon={<Trash2 size={16} />} color="red.500">
                                Delete Product
                              </MenuItem>
                            </MenuList>
                          </Menu>
                        </Box>

                        <CardBody>
                          <VStack align="start" spacing={2}>
                            <Heading size="md">{product.name}</Heading>
                            <Badge colorScheme="teal" borderRadius="full">
                              {getCategoryName(product.categoryId)}
                            </Badge>
                            <Text fontSize="sm" color={mutedTextColor} noOfLines={2}>
                              {product.description}
                            </Text>
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
                          <VStack align="start" spacing={0}>
                            <Text fontSize="xs" color={mutedTextColor}>
                              Price
                            </Text>
                            <Text fontWeight="bold" color={accentColor}>
                              {product.productPrices && product.productPrices.length > 0
                                ? `$${product.productPrices[0].price.toFixed(2)}`
                                : "No price set"}
                            </Text>
                          </VStack>
                          <Button
                            leftIcon={<Edit size={16} />}
                            variant="ghost"
                            size="sm"
                            color={accentColor}
                            _hover={{ bg: `${accentColor}22` }}
                            onClick={() => handleOpenModal(product, "product", true)}
                          >
                            Edit
                          </Button>
                        </CardFooter>
                      </MotionCard>
                    ))}
                  </SimpleGrid>
                )}
              </>
            )}
          </TabPanel>

          {/* Kits Tab */}
          <TabPanel px={0}>
            {loading.kits ? (
              <Center py={10}>
                <VStack spacing={4}>
                  <Spinner size="xl" color={accentColor} thickness="4px" />
                  <Text color={mutedTextColor}>Loading meal kits...</Text>
                </VStack>
              </Center>
            ) : filteredKits.length === 0 ? (
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
                  bg={`${secondaryColor}22`}
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
                  <Package size={32} color={secondaryColor} />
                </Box>
                <Heading size="lg" mb={2}>
                  No Meal Kits Found
                </Heading>
                <Text color={mutedTextColor} maxW="500px" mx="auto" mb={6}>
                  {searchTerm
                    ? `No meal kits match your search "${searchTerm}"`
                    : "You haven't created any meal kits yet"}
                </Text>
                <Button
                  colorScheme="purple"
                  leftIcon={<Plus size={16} />}
                  onClick={() => handleOpenModal(null, "kit", false)}
                >
                  Create New Kit
                </Button>
              </MotionBox>
            ) : (
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                {filteredKits.map((kit, index) => (
                  <MotionCard
                    key={kit.id}
                    borderRadius="xl"
                    overflow="hidden"
                    boxShadow="md"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    whileHover={{ y: -5, boxShadow: "lg" }}
                    bg={`${secondaryColor}11`}
                  >
                    <Box position="relative">
                      <Image
                        src={kit.image || DEFAULT_KIT_IMAGE}
                        alt={kit.name}
                        height="200px"
                        width="100%"
                        objectFit="cover"
                        fallbackSrc="/placeholder.svg?height=200&width=500"
                      />
                      <Badge
                        position="absolute"
                        top={2}
                        left={2}
                        colorScheme={kit.status ? "green" : "red"}
                        borderRadius="full"
                        px={2}
                      >
                        {kit.status ? "Active" : "Inactive"}
                      </Badge>
                      <Badge position="absolute" top={2} right={10} colorScheme="purple" borderRadius="full" px={2}>
                        Combo
                      </Badge>
                      <Menu>
                        <MenuButton
                          as={IconButton}
                          icon={<MoreVertical size={16} />}
                          variant="ghost"
                          colorScheme="gray"
                          position="absolute"
                          top={2}
                          right={2}
                          size="sm"
                          borderRadius="full"
                          bg="whiteAlpha.800"
                          _hover={{ bg: "whiteAlpha.900" }}
                        />
                        <MenuList>
                          <MenuItem icon={<Edit size={16} />} onClick={() => handleOpenModal(kit, "kit", true)}>
                            Edit Kit
                          </MenuItem>
                          <MenuItem icon={<Trash2 size={16} />} color="red.500">
                            Delete Kit
                          </MenuItem>
                        </MenuList>
                      </Menu>
                    </Box>

                    <CardBody>
                      <VStack align="start" spacing={3}>
                        <Heading size="md">{kit.name}</Heading>
                        <Text fontSize="sm" color={mutedTextColor} noOfLines={2}>
                          {kit.description}
                        </Text>

                        <Box w="full">
                          <Text fontSize="sm" fontWeight="medium" mb={2}>
                            Includes:
                          </Text>
                          <VStack align="stretch" spacing={1} maxH="120px" overflowY="auto">
                            {kit.ProductKit.map((kitProduct) => {
                              const product = products.find((p) => p.id === kitProduct.productId)
                              return (
                                <Flex key={kitProduct.productId} fontSize="xs" justify="space-between">
                                  <Text>
                                    {kitProduct.quantity}x {product?.name || "Unknown Product"}
                                  </Text>
                                </Flex>
                              )
                            })}
                          </VStack>
                        </Box>
                      </VStack>
                    </CardBody>

                    <CardFooter
                      pt={0}
                      pb={3}
                      px={4}
                      borderTop="1px solid"
                      borderColor={`${secondaryColor}33`}
                      justifyContent="space-between"
                    >
                      <VStack align="start" spacing={0}>
                        <Text fontSize="xs" color={mutedTextColor}>
                          Price
                        </Text>
                        <Text fontWeight="bold" color={secondaryColor}>
                          {kit.KitPrice && kit.KitPrice.length > 0
                            ? `$${kit.KitPrice[0].price.toFixed(2)}`
                            : "No price set"}
                        </Text>
                      </VStack>
                      <Button
                        leftIcon={<Edit size={16} />}
                        variant="ghost"
                        size="sm"
                        color={secondaryColor}
                        _hover={{ bg: `${secondaryColor}22` }}
                        onClick={() => handleOpenModal(kit, "kit", true)}
                      >
                        Edit
                      </Button>
                    </CardFooter>
                  </MotionCard>
                ))}
              </SimpleGrid>
            )}
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* Product/Kit Edit Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay backdropFilter="blur(5px)" />
        <ModalContent borderRadius="xl">
          <ModalHeader>
            {isEditing
              ? `Edit ${itemType === "product" ? "Product" : "Kit"}`
              : `Add New ${itemType === "product" ? "Product" : "Kit"}`}
            <ModalCloseButton />
          </ModalHeader>
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <FormControl>
                <FormLabel>Name</FormLabel>
                <Input placeholder={`Enter ${itemType} name`} defaultValue={currentItem?.name || ""} />
              </FormControl>

              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea placeholder={`Enter ${itemType} description`} defaultValue={currentItem?.description || ""} />
              </FormControl>

              {itemType === "product" && (
                <FormControl>
                  <FormLabel>Category</FormLabel>
                  <Select defaultValue={(currentItem as Product)?.categoryId || ""}>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </Select>
                </FormControl>
              )}

              <FormControl>
                <FormLabel>Price</FormLabel>
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <DollarSign size={16} color={useColorModeValue("gray.500", "gray.300")} />
                  </InputLeftElement>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    defaultValue={
                      itemType === "product"
                        ? (currentItem as Product)?.productPrices?.[0]?.price || ""
                        : (currentItem as Kit)?.KitPrice?.[0]?.price || ""
                    }
                  />
                </InputGroup>
              </FormControl>

              <FormControl>
                <FormLabel>Image URL</FormLabel>
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <ImageIcon size={16} color={useColorModeValue("gray.500", "gray.300")} />
                  </InputLeftElement>
                  <Input placeholder="Enter image URL" defaultValue={currentItem?.image || ""} />
                </InputGroup>
              </FormControl>

              <FormControl display="flex" alignItems="center">
                <FormLabel htmlFor="status-switch" mb="0">
                  Active
                </FormLabel>
                <Switch id="status-switch" defaultChecked={currentItem?.status || true} colorScheme="teal" />
              </FormControl>

              {itemType === "kit" && (
                <Box>
                  <FormLabel>Products in Kit</FormLabel>
                  <VStack
                    align="stretch"
                    spacing={2}
                    maxH="200px"
                    overflowY="auto"
                    p={2}
                    bg={subtleColor}
                    borderRadius="md"
                  >
                    {/* This would be a dynamic list of products with quantity selectors */}
                    <Text fontSize="sm" color={mutedTextColor} textAlign="center">
                      Product selection would go here
                    </Text>
                  </VStack>
                </Box>
              )}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme={itemType === "product" ? "teal" : "purple"}>
              {isEditing ? "Save Changes" : "Create"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  )
}
