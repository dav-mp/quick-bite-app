"use client"

import type React from "react"
import { useState } from "react"
import {
  Box,
  Heading,
  Text,
  Button,
  VStack,
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
  Badge,
  Card,
  CardBody,
  SimpleGrid,
  useToken,
  Stack,
  Tag,
  Container,
} from "@chakra-ui/react"
import { CheckCircleIcon, InfoIcon, WarningIcon, TimeIcon, InfoOutlineIcon, createIcon } from "@chakra-ui/icons"

// Importamos las utilidades del carrito
import { useAppSelector, useAppDispatch } from "../../../../app/infrastructure/store/Hooks"
import { selectCartItems, clearCart, selectRestaurantId } from "../../../../app/infrastructure/store/CartSlice"

// Importamos la función buildCreateOrderRequest y el caso de uso
import { buildCreateOrderRequest } from "../../../../app/infrastructure/service/OrderUtils"
import { orderUseCase } from "../../../../app/infrastructure/DI/OrderContainer"

// Importamos para leer cookies (por ejemplo, customerId)
import { getJWTDataDecoded } from "../../../../app/infrastructure/service/JWTDecoded"

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

// Custom LocationIcon
const LocationIcon = createIcon({
  displayName: "LocationIcon",
  viewBox: "0 0 24 24",
  path: (
    <>
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
    </>
  ),
})

// Custom CreditCardIcon
const CreditCardIcon = createIcon({
  displayName: "CreditCardIcon",
  viewBox: "0 0 24 24",
  path: (
    <>
      <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" />
    </>
  ),
})

// Imágenes por defecto (solo ejemplo)
const DEFAULT_PRODUCT_IMAGE =
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
const DEFAULT_KIT_IMAGE =
  "https://images.unsplash.com/photo-1576866209830-589e1bfbaa4d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"

const CheckoutView: React.FC = () => {
  // Accedemos al carrito y al restaurantId
  const cartItems = useAppSelector(selectCartItems)
  const cartRestaurantId = useAppSelector(selectRestaurantId) // <-- el ID real del restaurante
  const dispatch = useAppDispatch()
  const toast = useToast()

  // Estados locales
  const [loadingOrder, setLoadingOrder] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [orderSuccess, setOrderSuccess] = useState(false)
  const [orderId, setOrderId] = useState<string | null>(null)

  // Get theme colors
  const [teal500, purple500] = useToken("colors", ["teal.500", "purple.500"])

  // Estilos
  const borderColor = useColorModeValue("gray.200", "gray.600")
  const bgColor = useColorModeValue("white", "gray.800")
  const subtleColor = useColorModeValue("gray.100", "gray.700")
  const gradientStart = useColorModeValue("teal.50", "gray.700")
  const mutedTextColor = useColorModeValue("gray.600", "gray.400")
  const accentColor = useColorModeValue("teal.500", "teal.300")

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

  // Calcular número total de items
  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0)

  /**
   * Maneja la creación de la orden.
   */
  const handleCreateOrder = async () => {
    try {
      setLoadingOrder(true)
      setErrorMsg(null)

      const customer = getJWTDataDecoded<Record<string, any>>()

      // Validación básica: si no hay restaurante asignado:
      if (!cartRestaurantId) {
        throw new Error("No hay restaurante seleccionado. Selecciona un restaurante antes de crear la orden.")
      }

      // 1) Construimos el request con la utilidad
      const orderRequest = buildCreateOrderRequest(cartItems, customer.sub, cartRestaurantId)
      // 2) Llamamos al caso de uso
      const newOrder = await orderUseCase.createOrder(orderRequest)

      // 3) Si todo ok, mostrar toast y vaciar carrito (o redirigir)
      toast({
        title: "¡Orden creada con éxito!",
        description: `Tu orden #${newOrder.id.substring(0, 8)} ha sido recibida y está siendo procesada.`,
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "top",
      })

      // Guardar ID de orden y mostrar pantalla de éxito
      setOrderId(newOrder.id)
      setOrderSuccess(true)

      // Vaciar carrito
      dispatch(clearCart())

      // Aquí puedes redirigir a "/user/orders" o donde gustes...
    } catch (error: any) {
      console.error(error)
      setErrorMsg(error.message || "Error al crear la orden.")
    } finally {
      setLoadingOrder(false)
    }
  }

  // Renderizar pantalla de éxito
  if (orderSuccess) {
    return (
      <Container maxW="container.md" py={10}>
        <Card
          borderRadius="xl"
          overflow="hidden"
          boxShadow="xl"
          bg={`linear-gradient(135deg, ${gradientStart} 0%, ${bgColor} 100%)`}
        >
          <Box
            bg={`linear-gradient(90deg, ${teal500}22 0%, ${purple500}22 100%)`}
            p={6}
            textAlign="center"
            borderBottomWidth="1px"
            borderColor={borderColor}
          >
            <Flex
              width="80px"
              height="80px"
              borderRadius="full"
              bg={`${teal500}22`}
              color="green.500"
              align="center"
              justify="center"
              mx="auto"
              mb={4}
            >
              <CheckCircleIcon boxSize={10} />
            </Flex>
            <Heading
              size="lg"
              mb={2}
              fontWeight="extrabold"
              bgGradient={`linear(to-r, ${teal500}, ${purple500})`}
              bgClip="text"
            >
              ¡Orden Completada!
            </Heading>
            <Text color={mutedTextColor}>Tu pedido ha sido recibido y está siendo procesado</Text>
          </Box>

          <CardBody p={6}>
            <VStack spacing={6} align="stretch">
              <Box p={4} borderRadius="lg" bg={subtleColor} textAlign="center">
                <Text fontSize="sm" color={mutedTextColor} mb={1}>
                  Número de Orden
                </Text>
                <Text fontWeight="bold" fontSize="xl">
                  #{orderId?.substring(0, 8).toUpperCase()}
                </Text>
              </Box>

              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                <Card variant="outline" p={4} borderRadius="lg">
                  <Flex align="center">
                    <Box borderRadius="full" bg={`${teal500}22`} p={2} color={accentColor} mr={3}>
                      <TimeIcon boxSize={5} />
                    </Box>
                    <Box>
                      <Text fontSize="sm" color={mutedTextColor}>
                        Tiempo Estimado
                      </Text>
                      <Text fontWeight="bold">30-45 minutos</Text>
                    </Box>
                  </Flex>
                </Card>

                <Card variant="outline" p={4} borderRadius="lg">
                  <Flex align="center">
                    <Box borderRadius="full" bg={`${purple500}22`} p={2} color={purple500} mr={3}>
                      <LocationIcon boxSize={5} />
                    </Box>
                    <Box>
                      <Text fontSize="sm" color={mutedTextColor}>
                        Método de Entrega
                      </Text>
                      <Text fontWeight="bold">Recoger en Tienda</Text>
                    </Box>
                  </Flex>
                </Card>

                <Card variant="outline" p={4} borderRadius="lg">
                  <Flex align="center">
                    <Box borderRadius="full" bg={`${teal500}22`} p={2} color={accentColor} mr={3}>
                      <CreditCardIcon boxSize={5} />
                    </Box>
                    <Box>
                      <Text fontSize="sm" color={mutedTextColor}>
                        Método de Pago
                      </Text>
                      <Text fontWeight="bold">Pago en Tienda</Text>
                    </Box>
                  </Flex>
                </Card>
              </SimpleGrid>

              <Divider />

              <Box>
                <Flex justify="space-between" mb={2}>
                  <Text fontWeight="medium">Total Pagado:</Text>
                  <Text fontWeight="bold" fontSize="xl" color={accentColor}>
                    ${totalPrice.toFixed(2)}
                  </Text>
                </Flex>
                <Text fontSize="sm" color={mutedTextColor}>
                  Recibirás un correo electrónico con los detalles de tu pedido.
                </Text>
              </Box>

              <Button
                colorScheme="teal"
                size="lg"
                onClick={() => {
                  // Redirigir a la página de órdenes o a la página principal
                  window.location.href = "/user/orders"
                }}
                _hover={{
                  transform: "translateY(-2px)",
                  boxShadow: "lg",
                }}
                transition="all 0.2s"
              >
                Ver Mis Órdenes
              </Button>
            </VStack>
          </CardBody>
        </Card>
      </Container>
    )
  }

  return (
    <Container maxW="container.lg" py={8}>
      <Box
        bg={`linear-gradient(135deg, ${teal500}22 0%, ${purple500}22 100%)`}
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
          bgGradient={`linear(to-r, ${teal500}, ${purple500})`}
          bgClip="text"
          size="xl"
        >
          Finalizar Pedido
        </Heading>
        <Text color={mutedTextColor}>Revisa tu orden y confirma para completar tu pedido</Text>
      </Box>

      {errorMsg && (
        <Alert status="error" mb={6} borderRadius="lg">
          <AlertIcon as={WarningIcon} />
          <Box>
            <AlertTitle fontWeight="bold">Error al procesar tu orden</AlertTitle>
            <AlertDescription>{errorMsg}</AlertDescription>
          </Box>
        </Alert>
      )}

      {cartItems.length === 0 ? (
        <Card
          borderRadius="xl"
          overflow="hidden"
          boxShadow="md"
          bg={`linear-gradient(180deg, ${gradientStart} 0%, ${bgColor} 100%)`}
          p={8}
          textAlign="center"
        >
          <VStack spacing={6}>
            <Flex
              width="100px"
              height="100px"
              borderRadius="full"
              bg={`${teal500}11`}
              color={mutedTextColor}
              align="center"
              justify="center"
            >
              <ShoppingBagIcon boxSize={10} />
            </Flex>
            <Box>
              <Heading size="md" mb={2}>
                Tu carrito está vacío
              </Heading>
              <Text color={mutedTextColor} maxW="400px" mx="auto">
                Parece que aún no has agregado productos a tu carrito. Explora nuestro menú para encontrar deliciosos
                platillos.
              </Text>
            </Box>
            <Button
              colorScheme="teal"
              size="lg"
              onClick={() => {
                // Redirigir al menú
                window.location.href = "/stores"
              }}
              _hover={{
                transform: "translateY(-2px)",
                boxShadow: "lg",
              }}
              transition="all 0.2s"
            >
              Explorar Menú
            </Button>
          </VStack>
        </Card>
      ) : (
        <SimpleGrid columns={{ base: 1, lg: 5 }} spacing={8} alignItems="start">
          <Box gridColumn={{ lg: "span 3" }}>
            <Card borderRadius="xl" overflow="hidden" boxShadow="md" mb={6}>
              <Box
                bg={`linear-gradient(90deg, ${teal500}11 0%, ${purple500}11 100%)`}
                p={4}
                borderBottomWidth="1px"
                borderColor={borderColor}
              >
                <Flex align="center">
                  <Box borderRadius="md" p={1.5} bg={`${teal500}22`} color={accentColor} mr={3}>
                    <ShoppingBagIcon boxSize={5} />
                  </Box>
                  <Box>
                    <Heading size="md">Resumen del Pedido</Heading>
                    <Text fontSize="sm" color={mutedTextColor}>
                      {totalItems} {totalItems === 1 ? "producto" : "productos"} en tu carrito
                    </Text>
                  </Box>
                </Flex>
              </Box>

              <VStack align="stretch" spacing={0} divider={<Divider />}>
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
                  const description = isProduct ? item.product?.description : item.kit?.description

                  return (
                    <Box key={item.id} p={4} position="relative" transition="all 0.2s">
                      <Flex>
                        {/* Indicator for product type */}
                        <Box
                          position="absolute"
                          left={0}
                          top="50%"
                          transform="translateY(-50%)"
                          width="3px"
                          height="60%"
                          bg={isProduct ? teal500 : purple500}
                          borderRightRadius="full"
                        />

                        <Image
                          src={imageUrl || "/placeholder.svg"}
                          alt={name}
                          boxSize="80px"
                          objectFit="cover"
                          borderRadius="lg"
                          mr={4}
                          ml={2}
                          fallbackSrc="/placeholder.svg?height=80&width=80"
                        />

                        <Stack flex="1" spacing={1}>
                          <Flex justify="space-between" align="center">
                            <Heading size="sm">{name}</Heading>
                            <Tag size="sm" colorScheme={isProduct ? "teal" : "purple"} borderRadius="full">
                              {isProduct ? "Producto" : "Kit"}
                            </Tag>
                          </Flex>

                          <Text fontSize="sm" color={mutedTextColor} noOfLines={2}>
                            {description}
                          </Text>

                          <Flex justify="space-between" align="center" mt={1}>
                            <Badge colorScheme="gray" borderRadius="full" px={2} py={0.5} fontSize="xs">
                              Cantidad: {quantity}
                            </Badge>
                            <Text fontWeight="bold" color={isProduct ? accentColor : purple500}>
                              ${(price * quantity).toFixed(2)}
                            </Text>
                          </Flex>
                        </Stack>
                      </Flex>
                    </Box>
                  )
                })}
              </VStack>
            </Card>

            <Alert status="info" borderRadius="lg">
              <AlertIcon as={InfoIcon} />
              <Box>
                <AlertTitle fontWeight="bold">Información de Entrega</AlertTitle>
                <AlertDescription>
                  Tu pedido estará listo para recoger en la tienda. Recibirás una notificación cuando esté listo.
                </AlertDescription>
              </Box>
            </Alert>
          </Box>

          <Box gridColumn={{ lg: "span 2" }}>
            <Card borderRadius="xl" overflow="hidden" boxShadow="md" position="sticky" top="20px">
              <Box
                bg={`linear-gradient(90deg, ${teal500}11 0%, ${purple500}11 100%)`}
                p={4}
                borderBottomWidth="1px"
                borderColor={borderColor}
              >
                <Heading size="md">Resumen de Pago</Heading>
              </Box>

              <CardBody p={6}>
                <VStack spacing={4} align="stretch">
                  <Flex justify="space-between">
                    <Text color={mutedTextColor}>Subtotal:</Text>
                    <Text fontWeight="medium">${totalPrice.toFixed(2)}</Text>
                  </Flex>

                  <Flex justify="space-between">
                    <Text color={mutedTextColor}>Impuestos:</Text>
                    <Text fontWeight="medium">${(totalPrice * 0.16).toFixed(2)}</Text>
                  </Flex>

                  <Divider />

                  <Flex justify="space-between" fontWeight="bold" fontSize="lg">
                    <Text>Total:</Text>
                    <Text bgGradient={`linear(to-r, ${teal500}, ${purple500})`} bgClip="text">
                      ${(totalPrice * 1.16).toFixed(2)}
                    </Text>
                  </Flex>

                  <Box bg={subtleColor} p={4} borderRadius="md" fontSize="sm" color={mutedTextColor}>
                    <Flex align="center" mb={2}>
                      <InfoOutlineIcon mr={2} />
                      <Text fontWeight="medium">Método de Pago</Text>
                    </Flex>
                    <Text>Pago en tienda al recoger tu pedido</Text>
                  </Box>

                  <Button
                    colorScheme="teal"
                    size="lg"
                    onClick={handleCreateOrder}
                    isDisabled={cartItems.length === 0 || loadingOrder}
                    _hover={{
                      transform: "translateY(-2px)",
                      boxShadow: "lg",
                    }}
                    transition="all 0.2s"
                    height="60px"
                    mt={2}
                  >
                    {loadingOrder ? (
                      <Flex align="center">
                        <Spinner size="sm" mr={2} />
                        Procesando...
                      </Flex>
                    ) : (
                      "Confirmar Pedido"
                    )}
                  </Button>
                </VStack>
              </CardBody>
            </Card>
          </Box>
        </SimpleGrid>
      )}
    </Container>
  )
}

export default CheckoutView
