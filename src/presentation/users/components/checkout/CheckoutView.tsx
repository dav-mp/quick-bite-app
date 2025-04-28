// File: src/presentation/users/pages/checkout/CheckoutView.tsx
import React, { useState } from "react"
import {
  Box,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  Image,
  Divider,
  useToast,
  useColorModeValue,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Spinner,
  Flex,
} from "@chakra-ui/react"

// Importamos las utilidades del carrito
import { useAppSelector, useAppDispatch } from "../../../../app/infrastructure/store/Hooks"
import { selectCartItems, clearCart } from "../../../../app/infrastructure/store/CartSlice"

// Importamos la función buildCreateOrderRequest y el caso de uso
import { buildCreateOrderRequest } from "../../../../app/infrastructure/service/OrderUtils"
import { orderUseCase } from "../../../../app/infrastructure/DI/OrderContainer"

// Importamos para leer cookies (por ejemplo, customerId, restaurantId...)
import { getDataCookies } from "../../../../app/infrastructure/service/CookiesService"
import { DataCookies } from "../../../../app/domain/models/cookies/DataCookies"

// Imágenes por defecto (solo ejemplo)
const DEFAULT_PRODUCT_IMAGE =
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
const DEFAULT_KIT_IMAGE =
  "https://images.unsplash.com/photo-1576866209830-589e1bfbaa4d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"

const CheckoutView: React.FC = () => {
  // Accedemos al carrito
  const cartItems = useAppSelector(selectCartItems)
  const dispatch = useAppDispatch()
  const toast = useToast()

  // Estados locales
  const [loadingOrder, setLoadingOrder] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Obtenemos (por ejemplo) el customerId desde cookies
  // Ajusta según como guardes el ID real del usuario en tu app
  const customerId = getDataCookies(DataCookies.EMAIL) || "" // O un ID real de tu backend
  // Igualmente, ajusta el restaurantId (puede venir de la selección previa o cookies)
  const restaurantId = "1234-RESTAURANT-MOCK-ID" // O un ID real

  // Estilos
  const borderColor = useColorModeValue("gray.200", "gray.600")

  // Calcular total a mostrar
  const totalPrice = cartItems.reduce((acc, item) => {
    if (item.type === "product" && item.product) {
      const selectedPrice = item.product.productPrices?.find((p) => p.id === item.selectedPriceId)
      const price = selectedPrice?.price || 0
      return acc + price * item.quantity
    } else if (item.type === "kit" && item.kit) {
      const kitPrice = item.kit.KitPrice[0]?.price || 0
      return acc + kitPrice * item.quantity
    }
    return acc
  }, 0)

  /**
   * Maneja la creación de la orden.
   */
  const handleCreateOrder = async () => {
    try {
      setLoadingOrder(true)
      setErrorMsg(null)

      // 1) Construimos el request con la utilidad
      const orderRequest = buildCreateOrderRequest(cartItems, customerId, restaurantId)
      // 2) Llamamos al caso de uso
      const newOrder = await orderUseCase.createOrder(orderRequest)
      // 3) Si todo ok, mostrar toast y vaciar carrito (o redirigir)
      toast({
        title: "Orden creada",
        description: `Orden #${newOrder.id} creada con éxito.`,
        status: "success",
        duration: 4000,
        isClosable: true,
      })
      // Vaciar carrito
      dispatch(clearCart())

      // Aquí puedes redirigir a "/user/orders" o donde gustes...
      // Por ejemplo: navigate("/user/orders")

    } catch (error: any) {
      console.error(error)
      setErrorMsg(error.message || "Error al crear la orden.")
    } finally {
      setLoadingOrder(false)
    }
  }

  return (
    <Box maxW="container.md" mx="auto" py={8}>
      <Heading as="h1" mb={4}>
        Checkout
      </Heading>

      {errorMsg && (
        <Alert status="error" mb={4}>
          <AlertIcon />
          <AlertTitle mr={2}>Error:</AlertTitle>
          <AlertDescription>{errorMsg}</AlertDescription>
        </Alert>
      )}

      {cartItems.length === 0 ? (
        <Text>No hay productos en tu carrito.</Text>
      ) : (
        <VStack align="stretch" spacing={4}>
          {cartItems.map((item) => {
            const isProduct = item.type === "product"
            const name = isProduct ? item.product?.name : item.kit?.name
            const quantity = item.quantity
            const imageUrl = isProduct
              ? item.product?.image || DEFAULT_PRODUCT_IMAGE
              : item.kit?.image || DEFAULT_KIT_IMAGE
            const price = isProduct
              ? item.product?.productPrices?.find((p) => p.id === item.selectedPriceId)?.price || 0
              : item.kit?.KitPrice[0]?.price || 0

            return (
              <Box key={item.id} borderWidth="1px" borderRadius="md" p={4} borderColor={borderColor}>
                <HStack spacing={4}>
                  <Image
                    src={imageUrl}
                    alt={name}
                    boxSize="70px"
                    objectFit="cover"
                    borderRadius="md"
                    fallbackSrc="/placeholder.svg"
                  />
                  <Box flex="1">
                    <Text fontWeight="bold">{name}</Text>
                    <Text fontSize="sm" color="gray.500">
                      Cantidad: {quantity}
                    </Text>
                  </Box>
                  <Text fontWeight="semibold">${(price * quantity).toFixed(2)}</Text>
                </HStack>
              </Box>
            )
          })}

          <Divider />

          <Flex justify="space-between" align="center" fontWeight="bold">
            <Text>Total:</Text>
            <Text fontSize="xl">${totalPrice.toFixed(2)}</Text>
          </Flex>

          <Button
            colorScheme="teal"
            size="lg"
            onClick={handleCreateOrder}
            isDisabled={cartItems.length === 0 || loadingOrder}
          >
            {loadingOrder ? <Spinner size="sm" /> : "Crear Orden"}
          </Button>
        </VStack>
      )}
    </Box>
  )
}

export default CheckoutView
