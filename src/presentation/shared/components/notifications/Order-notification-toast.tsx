"use client"

import { useEffect, useCallback } from "react"
import { useToast, Box, Flex, Text, HStack, Icon, useColorModeValue } from "@chakra-ui/react"
import { CheckCircleIcon, InfoIcon, TimeIcon } from "@chakra-ui/icons"

import { useAppDispatch } from "../../../../app/infrastructure/store/Hooks"
import { addNotification, type OrderStatusUpdate } from "../../../../app/infrastructure/store/NotificationSlice"
import { StatusOrder } from "../../../../app/domain/models/oreder/Order"
import { webSocketService } from "../../../../app/infrastructure/service/WebSocketService"
import { getJWTDataDecoded } from "../../../../app/infrastructure/service/JWTDecoded"

/* Traducción human-friendly */
const STATUS_LABEL: Record<StatusOrder, string> = {
  [StatusOrder.Created]: "Creada",
  [StatusOrder.Accepted]: "Aceptada",
  [StatusOrder.Finalized]: "Finalizada",
}

const OrderNotificationToast = () => {
  const toast = useToast()
  const dispatch = useAppDispatch()

  // colores más vibrantes para destacar mejor
  const secondary = useColorModeValue("purple.600", "purple.400")
  const warn = useColorModeValue("orange.500", "orange.300")
  const success = useColorModeValue("green.600", "green.400")
  const info = useColorModeValue("cyan.600", "cyan.400")

  // Color de fondo para la notificación (más oscuro para mayor contraste)
  const bgDark = useColorModeValue("gray.900", "black")

  /** Normaliza el mensaje crudo del WS al modelo del slice */
  const wsToOrderStatus = (msg: any): OrderStatusUpdate | null => {
    if (msg.event !== "order_status_changed" || !msg.order) return null
    const order = msg.order
    return {
      orderId: order.id,
      status: order.status as StatusOrder,
      restaurantName: order.Restaurant?.name, // puede venir o no
      timestamp: new Date().toISOString(),
    }
  }

  const handleWebSocketMessage = useCallback(
    (raw: any) => {
      /* El servicio ya parsea JSON.
         Si no, haz: const msg = JSON.parse(raw as string) */
      const update = wsToOrderStatus(raw)
      if (!update) return

      dispatch(addNotification(update))

      /* icono+color según estatus */
      let icon = InfoIcon
      let bg = info
      if (update.status === StatusOrder.Accepted) {
        icon = TimeIcon
        bg = warn
      } else if (update.status === StatusOrder.Finalized) {
        icon = CheckCircleIcon
        bg = success
      }

      /* mensaje amigable */
      const orderTag = `#${update.orderId.slice(0, 8).toUpperCase()}`
      const statusText = STATUS_LABEL[update.status]
      toast({
        position: "top-right",
        duration: 6000,
        isClosable: true,
        render: () => (
          <Box
            color="white"
            p={0}
            borderRadius="xl"
            boxShadow={`0 4px 20px 0 ${bg}50, 0 0 0 1px ${bg}30`}
            maxW="sm"
            mt={55}
            overflow="hidden"
            border={`2px solid ${bg}`}
            animation="pulse 2s infinite"
            sx={{
              "@keyframes pulse": {
                "0%": { boxShadow: `0 4px 20px 0 ${bg}50, 0 0 0 1px ${bg}30` },
                "50%": { boxShadow: `0 4px 25px 5px ${bg}70, 0 0 0 1px ${bg}50` },
                "100%": { boxShadow: `0 4px 20px 0 ${bg}50, 0 0 0 1px ${bg}30` },
              },
            }}
          >
            {/* Barra superior de color */}
            <Box h="4px" bg={bg} w="full" />

            {/* Contenido principal con fondo oscuro para mayor contraste */}
            <Box p={4} bg={bgDark} position="relative">
              <Flex alignItems="center">
                <Box borderRadius="full" bg={`${bg}30`} p={2.5} mr={3} boxShadow={`0 0 0 2px ${bg}50`}>
                  <Icon as={icon} boxSize={5} color={bg} />
                </Box>
                <Box flex="1">
                  <HStack justify="space-between" mb={1}>
                    <Text fontWeight="bold" fontSize="md">
                      Estado de orden actualizado
                    </Text>
                    <Text fontSize="xs" color="gray.400">
                      {new Date().toLocaleTimeString()}
                    </Text>
                  </HStack>
                  <Text fontSize="sm">
                    La orden{" "}
                    <Text as="span" fontWeight="bold" color={bg}>
                      {orderTag}
                    </Text>{" "}
                    cambió a&nbsp;
                    <Text as="span" fontWeight="bold" bg={`${bg}20`} color={bg} px={2} py={0.5} borderRadius="md">
                      {statusText}
                    </Text>
                  </Text>
                </Box>
              </Flex>
            </Box>
          </Box>
        ),
      })

      /* notificación nativa */
      new Notification("QuickBite – actualización de orden", {
        body: `La orden ${orderTag} cambió a ${statusText}`,
      })
    },
    [dispatch, toast, info, warn, success, secondary, bgDark],
  )

  /* pedimos permiso 1 vez */
  useEffect(() => {
      Notification.requestPermission()
  }, [])

  /* registro cliente → WS */
  useEffect(() => {
    const customer = getJWTDataDecoded<Record<string, any>>()
    if (customer?.sub) {
      webSocketService.registerClient("user", customer.sub)
      webSocketService.addMessageListener(handleWebSocketMessage)
    }
    return () => webSocketService.removeMessageListener(handleWebSocketMessage)
  }, [handleWebSocketMessage])

  return null
}

export default OrderNotificationToast
