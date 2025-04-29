"use client"

import { useRef, useState } from "react"
import {
  Box,
  IconButton,
  Badge,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  PopoverFooter,
  PopoverHeader,
  Button,
  Text,
  Flex,
  Divider,
  useDisclosure,
  useColorModeValue,
  Portal,
  VStack,
  HStack,
  Image,
  useToast,
  Tooltip,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Tag,
  Heading,
} from "@chakra-ui/react"
import { Plus, Minus, Trash2, ShoppingBag, ShoppingCart } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useAppSelector, useAppDispatch } from "../../../../app/infrastructure/store/Hooks"
import { selectCartItems, removeItemFromCart, updateItemQuantity } from "../../../../app/infrastructure/store/CartSlice"
import useRedirect from "../../../shared/hooks/useRedirect"

const MotionIconButton = motion(IconButton)
const MotionBox = motion(Box)
const MotionBadge = motion(Badge)
const MotionFlex = motion(Flex)

// Default images
const DEFAULT_PRODUCT_IMAGE =
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
const DEFAULT_KIT_IMAGE =
  "https://images.unsplash.com/photo-1576866209830-589e1bfbaa4d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"

export default function CartIcon() {
  const cartItems = useAppSelector(selectCartItems)
  const dispatch = useAppDispatch()
  const toast = useToast()
  const redirect = useRedirect()

  const { isOpen: isPopoverOpen, onOpen: onPopoverOpen, onClose: onPopoverClose } = useDisclosure()
  const [itemToDelete, setItemToDelete] = useState<string | null>(null)
  const { isOpen: isAlertOpen, onOpen: onAlertOpen, onClose: onAlertClose } = useDisclosure()
  const cancelRef = useRef<HTMLButtonElement>(null)

  // Colors
  const bgColor = useColorModeValue("white", "gray.800")
  const borderColor = useColorModeValue("gray.100", "gray.700")
  const hoverBgColor = useColorModeValue("gray.50", "gray.700")
  const accentColor = useColorModeValue("pink.500", "pink.300")
  const secondaryColor = useColorModeValue("purple.500", "purple.300")
  const subtleColor = useColorModeValue("gray.100", "gray.700")
  const mutedTextColor = useColorModeValue("gray.600", "gray.400")
  const badgeBgColor = useColorModeValue("pink.500", "pink.400")
  const gradientStart = useColorModeValue("pink.50", "gray.700")
  const gradientEnd = useColorModeValue("purple.50", "gray.900")

  // Calculate total items in cart
  const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0)

  // Calculate total price
  const totalPrice = cartItems.reduce((total, item) => {
    if (item.type === "product" && item.product) {
      const selectedPrice = item.product.productPrices?.find((price) => price.id === item.selectedPriceId)
      return total + (selectedPrice?.price || 0) * item.quantity
    } else if (item.type === "kit" && item.kit) {
      const kitPrice = item.kit.KitPrice[0]?.price || 0
      return total + kitPrice * item.quantity
    }
    return total
  }, 0)

  // Handle quantity change
  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      if (newQuantity === 0) {
        setItemToDelete(itemId)
        onAlertOpen()
        return
      }
    } else {
      dispatch(updateItemQuantity({ cartItemId: itemId, quantity: newQuantity }))
      toast({
        title: "Cart updated",
        description: "Item quantity has been updated",
        status: "success",
        duration: 2000,
        isClosable: true,
        position: "top-right",
      })
    }
  }

  // Handle item removal
  const handleRemoveItem = () => {
    if (itemToDelete) {
      dispatch(removeItemFromCart(itemToDelete))
      toast({
        title: "Item removed",
        description: "Item has been removed from your cart",
        status: "info",
        duration: 2000,
        isClosable: true,
        position: "top-right",
      })
      onAlertClose()
      setItemToDelete(null)
    }
  }

  // Get item image based on type
  const getItemImage = (item: (typeof cartItems)[0]) => {
    if (item.type === "product") {
      return item.product?.image || DEFAULT_PRODUCT_IMAGE
    } else {
      return item.kit?.image || DEFAULT_KIT_IMAGE
    }
  }

  // Get item price based on type
  const getItemPrice = (item: (typeof cartItems)[0]) => {
    if (item.type === "product" && item.product) {
      const selectedPrice = item.product.productPrices?.find((price) => price.id === item.selectedPriceId)
      return selectedPrice?.price || 0
    } else if (item.type === "kit" && item.kit) {
      return item.kit.KitPrice[0]?.price || 0
    }
    return 0
  }

  // Get item name
  const getItemName = (item: (typeof cartItems)[0]) => {
    if (item.type === "product" && item.product) {
      return item.product.name
    } else if (item.type === "kit" && item.kit) {
      return item.kit.name
    }
    return "Unknown Item"
  }

  // Get item description
  const getItemDescription = (item: (typeof cartItems)[0]) => {
    if (item.type === "product" && item.product) {
      return item.product.description
    } else if (item.type === "kit" && item.kit) {
      return item.kit.description
    }
    return ""
  }

  return (
    <>
      <Popover
        isOpen={isPopoverOpen}
        onOpen={onPopoverOpen}
        onClose={onPopoverClose}
        placement="bottom-end"
        closeOnBlur={true}
        gutter={2}
      >
        <PopoverTrigger>
          <Box position="relative" display="inline-block">
            <MotionIconButton
              aria-label="Shopping cart"
              icon={<ShoppingCart size={18} />}
              variant="ghost"
              size="md"
              borderRadius="full"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              _hover={{ bg: useColorModeValue("pink.50", "whiteAlpha.100") }}
            />
            <AnimatePresence>
              {totalItems > 0 && (
                <MotionBadge
                  position="absolute"
                  top="-2px"
                  right="-2px"
                  borderRadius="full"
                  bg={badgeBgColor}
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
                  {totalItems}
                </MotionBadge>
              )}
            </AnimatePresence>
          </Box>
        </PopoverTrigger>
        <Portal>
          <PopoverContent
            width="380px"
            maxH="500px"
            shadow="xl"
            border="1px solid"
            borderColor={borderColor}
            bg={bgColor}
            _focus={{ outline: "none" }}
            borderRadius="xl"
            overflow="hidden"
          >
            <PopoverHeader
              fontWeight="bold"
              borderBottomWidth="1px"
              p={4}
              bg={`linear-gradient(90deg, ${accentColor}22 0%, ${secondaryColor}22 100%)`}
            >
              <Flex align="center" justify="space-between">
                <HStack>
                  <MotionBox
                    borderRadius="md"
                    p={1.5}
                    bg={`${accentColor}22`}
                    color={accentColor}
                    whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    <ShoppingBag size={18} />
                  </MotionBox>
                  <Text
                    fontWeight="extrabold"
                    bgGradient={`linear(to-r, ${accentColor}, ${secondaryColor})`}
                    bgClip="text"
                  >
                    Your Cart
                  </Text>
                </HStack>
                <Badge colorScheme="pink" borderRadius="full" px={2} py={1} fontSize="xs" fontWeight="bold">
                  {totalItems} {totalItems === 1 ? "item" : "items"}
                </Badge>
              </Flex>
            </PopoverHeader>
            <PopoverBody p={0} maxH="350px" overflowY="auto">
              {cartItems.length === 0 ? (
                <MotionFlex
                  direction="column"
                  align="center"
                  justify="center"
                  py={10}
                  px={4}
                  textAlign="center"
                  bg={`linear-gradient(180deg, ${gradientStart} 0%, ${bgColor} 100%)`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <MotionBox
                    bg={`${accentColor}22`}
                    p={4}
                    borderRadius="full"
                    mb={4}
                    color={accentColor}
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
                    <ShoppingCart size={24} />
                  </MotionBox>
                  <Heading size="sm" mb={1}>
                    Your cart is empty
                  </Heading>
                  <Text fontSize="sm" color={mutedTextColor} maxW="250px">
                    Add some delicious items from our menu to get started!
                  </Text>
                  <Button
                    mt={6}
                    size="sm"
                    colorScheme="pink"
                    onClick={onPopoverClose}
                    _hover={{
                      transform: "translateY(-2px)",
                      shadow: "md",
                    }}
                    transition="all 0.2s"
                  >
                    Browse Menu
                  </Button>
                </MotionFlex>
              ) : (
                <VStack spacing={0} align="stretch" divider={<Divider />}>
                  <AnimatePresence>
                    {cartItems.map((item) => (
                      <MotionFlex
                        key={item.id}
                        p={3}
                        align="center"
                        _hover={{
                          bg: hoverBgColor,
                        }}
                        position="relative"
                        overflow="hidden"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                      >
                        {/* Background indicator for item type */}
                        <Box
                          position="absolute"
                          left={0}
                          top="50%"
                          transform="translateY(-50%)"
                          width="3px"
                          height="60%"
                          bg={item.type === "product" ? accentColor : secondaryColor}
                          borderRightRadius="full"
                        />

                        <Image
                          src={getItemImage(item) || "/placeholder.svg"}
                          alt={getItemName(item)}
                          boxSize="55px"
                          objectFit="cover"
                          borderRadius="lg"
                          mr={3}
                          ml={1}
                          fallbackSrc="/placeholder.svg?height=55&width=55"
                          shadow="sm"
                        />
                        <Box flex="1" minW={0}>
                          <Flex justify="space-between" align="center">
                            <Text fontWeight="semibold" fontSize="sm" noOfLines={1}>
                              {getItemName(item)}
                            </Text>
                            <Tag
                              size="sm"
                              colorScheme={item.type === "product" ? "pink" : "purple"}
                              borderRadius="full"
                              fontSize="xs"
                            >
                              {item.type === "product" ? "Product" : "Kit"}
                            </Tag>
                          </Flex>

                          <Text fontSize="xs" color={mutedTextColor} noOfLines={1} mb={1} mt={0.5}>
                            {getItemDescription(item).substring(0, 40)}
                            {getItemDescription(item).length > 40 ? "..." : ""}
                          </Text>

                          <Flex align="center" justify="space-between">
                            <Text
                              fontWeight="bold"
                              color={item.type === "product" ? accentColor : secondaryColor}
                              fontSize="sm"
                            >
                              ${(getItemPrice(item) * item.quantity).toFixed(2)}
                            </Text>
                            <HStack spacing={1}>
                              <Tooltip label="Decrease quantity">
                                <IconButton
                                  aria-label="Decrease quantity"
                                  icon={<Minus size={12} />}
                                  size="xs"
                                  variant="ghost"
                                  colorScheme="gray"
                                  onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                  borderRadius="full"
                                  _hover={{
                                    bg: `${accentColor}22`,
                                  }}
                                />
                              </Tooltip>
                              <Box
                                fontSize="xs"
                                fontWeight="bold"
                                minW="22px"
                                textAlign="center"
                                bg={subtleColor}
                                borderRadius="full"
                                px={1.5}
                                py={0.5}
                              >
                                {item.quantity}
                              </Box>
                              <Tooltip label="Increase quantity">
                                <IconButton
                                  aria-label="Increase quantity"
                                  icon={<Plus size={12} />}
                                  size="xs"
                                  variant="ghost"
                                  colorScheme="pink"
                                  onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                  borderRadius="full"
                                  _hover={{
                                    bg: `${accentColor}22`,
                                  }}
                                />
                              </Tooltip>
                              <Tooltip label="Remove item">
                                <IconButton
                                  aria-label="Remove item"
                                  icon={<Trash2 size={12} />}
                                  size="xs"
                                  variant="ghost"
                                  colorScheme="red"
                                  onClick={() => {
                                    setItemToDelete(item.id)
                                    onAlertOpen()
                                  }}
                                  borderRadius="full"
                                  ml={1}
                                  _hover={{
                                    bg: "red.50",
                                  }}
                                />
                              </Tooltip>
                            </HStack>
                          </Flex>
                        </Box>
                      </MotionFlex>
                    ))}
                  </AnimatePresence>
                </VStack>
              )}
            </PopoverBody>
            <PopoverFooter
              borderTopWidth="1px"
              p={4}
              bg={`linear-gradient(90deg, ${gradientStart} 0%, ${gradientEnd} 100%)`}
            >
              <VStack spacing={3} align="stretch">
                <Flex justify="space-between" fontWeight="medium">
                  <Text>Subtotal:</Text>
                  <Text
                    fontWeight="extrabold"
                    bgGradient={`linear(to-r, ${accentColor}, ${secondaryColor})`}
                    bgClip="text"
                    fontSize="lg"
                  >
                    ${totalPrice.toFixed(2)}
                  </Text>
                </Flex>

                <Button
                  colorScheme="pink"
                  size="md"
                  width="full"
                  isDisabled={cartItems.length === 0}
                  onClick={() => {
                    onPopoverClose()
                    toast({
                      title: "Proceeding to checkout",
                      status: "info",
                      duration: 1500,
                      isClosable: true,
                    })
                    redirect("/user/checkout")
                  }}
                  _hover={{
                    transform: "translateY(-2px)",
                    shadow: "md",
                  }}
                  transition="all 0.2s"
                  borderRadius="lg"
                >
                  Proceed to Checkout
                </Button>
              </VStack>
            </PopoverFooter>
          </PopoverContent>
        </Portal>
      </Popover>

      {/* Confirmation Dialog for Item Removal */}
      <AlertDialog
        isOpen={isAlertOpen}
        leastDestructiveRef={cancelRef}
        onClose={onAlertClose}
        isCentered
        motionPreset="slideInBottom"
      >
        <AlertDialogOverlay>
          <AlertDialogContent borderRadius="xl" shadow="xl">
            <AlertDialogHeader
              fontSize="lg"
              fontWeight="bold"
              bg={`linear-gradient(90deg, ${accentColor}11 0%, ${secondaryColor}11 100%)`}
              borderTopRadius="xl"
              pb={3}
            >
              <Flex align="center">
                <Box borderRadius="md" p={1.5} bg="red.50" color="red.500" mr={2}>
                  <Trash2 size={16} />
                </Box>
                Remove Item
              </Flex>
            </AlertDialogHeader>

            <AlertDialogBody py={6}>Are you sure you want to remove this item from your cart?</AlertDialogBody>

            <AlertDialogFooter borderTopWidth="1px" borderColor={borderColor}>
              <Button
                ref={cancelRef}
                onClick={onAlertClose}
                variant="outline"
                _hover={{
                  bg: subtleColor,
                }}
              >
                Cancel
              </Button>
              <Button
                colorScheme="red"
                onClick={handleRemoveItem}
                ml={3}
                _hover={{
                  transform: "translateY(-2px)",
                }}
                transition="all 0.2s"
              >
                Remove
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  )
}
