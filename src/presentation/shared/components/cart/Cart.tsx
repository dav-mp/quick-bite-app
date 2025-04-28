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
} from "@chakra-ui/react"
import { AddIcon, MinusIcon, DeleteIcon, createIcon } from "@chakra-ui/icons"
import { useAppSelector, useAppDispatch } from "../../../../app/infrastructure/store/Hooks"
import { selectCartItems, removeItemFromCart, updateItemQuantity } from "../../../../app/infrastructure/store/CartSlice"

// << IMPORTA AQUÍ TU HOOK DE REDIRECCIÓN >>
import useRedirect from "../../../shared/hooks/useRedirect"

// Custom ShoppingCartIcon
const ShoppingCartIcon = createIcon({
  displayName: "ShoppingCartIcon",
  viewBox: "0 0 24 24",
  path: (
    <>
      <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-1.99.9-1.99 2S15.9 22 17 22s2-.9 2-2-.9-2-2-2z" />
      <path d="M7.16 14h9.68c.75 0 1.41-.41 1.75-1.03l3.38-6.15a1.002 1.002 0 00-.9-1.47H5.21l-.94-2H1v2h2l3.6 7.59-1.35 2.44C4.52 15.37 5.48 17 7 17h12v-2H7.16z" />
    </>
  ),
})

// Custom ShoppingBagIcon
const ShoppingBagIcon = createIcon({
  displayName: "ShoppingBagIcon",
  viewBox: "0 0 24 24",
  path: (
    <>
      <path d="M18 6h-2V4c0-1.1-.9-2-2-2H10C8.9 2 8 2.9 8 4v2H6c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-6 0h4V4h-4v2z" />
    </>
  ),
})

// Default images
const DEFAULT_PRODUCT_IMAGE =
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
const DEFAULT_KIT_IMAGE =
  "https://images.unsplash.com/photo-1576866209830-589e1bfbaa4d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"

export default function CartIcon() {
  const cartItems = useAppSelector(selectCartItems)
  const dispatch = useAppDispatch()
  const toast = useToast()

  // << Instancia de nuestra función de redirección >>
  const redirect = useRedirect()

  const { isOpen: isPopoverOpen, onOpen: onPopoverOpen, onClose: onPopoverClose } = useDisclosure()
  const [itemToDelete, setItemToDelete] = useState<string | null>(null)
  const { isOpen: isAlertOpen, onOpen: onAlertOpen, onClose: onAlertClose } = useDisclosure()
  const cancelRef = useRef<HTMLButtonElement>(null)

  // Colors
  const bgColor = useColorModeValue("white", "gray.800")
  const borderColor = useColorModeValue("gray.200", "gray.700")
  const hoverBgColor = useColorModeValue("gray.50", "gray.700")
  const accentColor = useColorModeValue("teal.500", "teal.300")
  const subtleColor = useColorModeValue("gray.100", "gray.700")
  const textColor = useColorModeValue("gray.800", "white")
  const mutedTextColor = useColorModeValue("gray.600", "gray.400")
  const badgeBgColor = useColorModeValue("red.500", "red.400")
  const gradientStart = useColorModeValue("teal.50", "gray.700")
  const gradientEnd = useColorModeValue("purple.50", "gray.900")
  const [teal500, purple500] = useColorModeValue(["teal.500", "purple.500"], ["teal.300", "purple.300"])

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
            <IconButton
              aria-label="Shopping cart"
              icon={<ShoppingCartIcon boxSize={5} />}
              variant="ghost"
              size="md"
              position="relative"
              _hover={{
                bg: `${teal500}22`,
                transform: "translateY(-2px)",
              }}
              transition="all 0.2s"
            />
            {totalItems > 0 && (
              <Badge
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
                animation="pulse 1.5s infinite"
                sx={{
                  "@keyframes pulse": {
                    "0%": { transform: "scale(1)" },
                    "50%": { transform: "scale(1.1)" },
                    "100%": { transform: "scale(1)" },
                  },
                }}
              >
                {totalItems}
              </Badge>
            )}
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
              bg={`linear-gradient(90deg, ${teal500}22 0%, ${purple500}22 100%)`}
            >
              <Flex align="center" justify="space-between">
                <HStack>
                  <Box borderRadius="md" p={1.5} bg={`${teal500}22`} color={accentColor}>
                    <ShoppingBagIcon boxSize={5} />
                  </Box>
                  <Text fontWeight="extrabold" bgGradient={`linear(to-r, ${teal500}, ${purple500})`} bgClip="text">
                    Your Cart
                  </Text>
                </HStack>
                <Badge colorScheme="teal" borderRadius="full" px={2} py={1} fontSize="xs" fontWeight="bold">
                  {totalItems} {totalItems === 1 ? "item" : "items"}
                </Badge>
              </Flex>
            </PopoverHeader>
            <PopoverBody p={0} maxH="350px" overflowY="auto">
              {cartItems.length === 0 ? (
                <Flex
                  direction="column"
                  align="center"
                  justify="center"
                  py={10}
                  px={4}
                  textAlign="center"
                  bg={`linear-gradient(180deg, ${gradientStart} 0%, ${bgColor} 100%)`}
                >
                  <Box bg={`${teal500}22`} p={4} borderRadius="full" mb={4} color={accentColor}>
                    <ShoppingCartIcon boxSize={8} />
                  </Box>
                  <Text fontWeight="bold" mb={1} fontSize="lg">
                    Your cart is empty
                  </Text>
                  <Text fontSize="sm" color={mutedTextColor} maxW="250px">
                    Add some delicious items from our menu to get started!
                  </Text>
                  <Button
                    mt={6}
                    size="sm"
                    colorScheme="teal"
                    onClick={onPopoverClose}
                    _hover={{
                      transform: "translateY(-2px)",
                      shadow: "md",
                    }}
                    transition="all 0.2s"
                  >
                    Browse Menu
                  </Button>
                </Flex>
              ) : (
                <VStack spacing={0} align="stretch" divider={<Divider />}>
                  {cartItems.map((item) => (
                    <Flex
                      key={item.id}
                      p={3}
                      align="center"
                      transition="all 0.2s"
                      _hover={{
                        bg: hoverBgColor,
                        transform: "translateX(3px)",
                      }}
                      position="relative"
                      overflow="hidden"
                    >
                      {/* Background indicator for item type */}
                      <Box
                        position="absolute"
                        left={0}
                        top="50%"
                        transform="translateY(-50%)"
                        width="3px"
                        height="60%"
                        bg={item.type === "product" ? teal500 : purple500}
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
                            colorScheme={item.type === "product" ? "teal" : "purple"}
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
                          <Text fontWeight="bold" color={item.type === "product" ? teal500 : purple500} fontSize="sm">
                            ${(getItemPrice(item) * item.quantity).toFixed(2)}
                          </Text>
                          <HStack spacing={1}>
                            <Tooltip label="Decrease quantity">
                              <IconButton
                                aria-label="Decrease quantity"
                                icon={<MinusIcon boxSize={2.5} />}
                                size="xs"
                                variant="ghost"
                                colorScheme="gray"
                                onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                borderRadius="full"
                                _hover={{
                                  bg: `${teal500}22`,
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
                                icon={<AddIcon boxSize={2.5} />}
                                size="xs"
                                variant="ghost"
                                colorScheme="teal"
                                onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                borderRadius="full"
                                _hover={{
                                  bg: `${teal500}22`,
                                }}
                              />
                            </Tooltip>
                            <Tooltip label="Remove item">
                              <IconButton
                                aria-label="Remove item"
                                icon={<DeleteIcon boxSize={2.5} />}
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
                    </Flex>
                  ))}
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
                    bgGradient={`linear(to-r, ${teal500}, ${purple500})`}
                    bgClip="text"
                    fontSize="lg"
                  >
                    ${totalPrice.toFixed(2)}
                  </Text>
                </Flex>

                {/* << AQUÍ el onClick que redirige >> */}
                <Button
                  colorScheme="teal"
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
                    // Al cerrar el popover, redirige a /user/checkout
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
              bg={`linear-gradient(90deg, ${teal500}11 0%, ${purple500}11 100%)`}
              borderTopRadius="xl"
              pb={3}
            >
              <Flex align="center">
                <Box borderRadius="md" p={1.5} bg="red.50" color="red.500" mr={2}>
                  <DeleteIcon boxSize={4} />
                </Box>
                Remove Item
              </Flex>
            </AlertDialogHeader>

            <AlertDialogBody py={6}>
              Are you sure you want to remove this item from your cart?
            </AlertDialogBody>

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
