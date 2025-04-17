import { useState, useEffect } from "react"
import {
  Box,
  Flex,
  IconButton,
  Text,
  VStack,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerHeader,
  DrawerBody,
  Divider,
  useColorModeValue,
  Badge,
  Avatar,
  Tooltip,
  Button,
  HStack,
  useToken,
} from "@chakra-ui/react"
import {
  ChevronRightIcon,
  ChevronLeftIcon,
  InfoIcon,
  ViewIcon,
  CalendarIcon,
  SettingsIcon,
  ExternalLinkIcon,
  StarIcon,
  TimeIcon,
} from "@chakra-ui/icons"
import useRedirect from "../../hooks/useRedirect"
import { getDataCookies } from "../../../../app/infrastructure/service/CookiesService"
import { UserType } from "../../../../app/domain/models/cookies/DataCookies"

// Configuración de opciones para admin y usuario regular
const adminItems = [
  {
    name: "Dashboard",
    icon: ViewIcon,
    path: "/dashboard",
    highlight: true,
    notification: 3,
  },
  {
    name: "Usuarios",
    icon: ViewIcon,
    path: "/users",
  },
  {
    name: "Configuración",
    icon: SettingsIcon,
    path: "/admin-settings",
  },
]

const userItems = [
  {
    name: "Home",
    icon: InfoIcon,
    path: "/user/products",
    highlight: true,
  },
  {
    name: "Ordenes",
    icon: ViewIcon,
    path: "/user/orders",
    notification: 2,
  },
  {
    name: "Carrito",
    icon: CalendarIcon,
    path: "/user/cart",
  },
  {
    name: "Ajustes",
    icon: SettingsIcon,
    path: "/user/settings",
  },
]

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const redirect = useRedirect()
  const [isExpanded, setIsExpanded] = useState(true)
  const toggleSidebar = () => setIsExpanded(!isExpanded)
  const [activePath, setActivePath] = useState("")

  // Update active path whenever the component renders
  useEffect(() => {
    if (typeof window !== "undefined") {
      setActivePath(window.location.pathname)
    }

    // Add event listener for path changes
    const handleRouteChange = () => {
      setActivePath(window.location.pathname)
    }

    window.addEventListener("popstate", handleRouteChange)

    return () => {
      window.removeEventListener("popstate", handleRouteChange)
    }
  }, [])

  // Obtener el rol del usuario (por ejemplo: "admin" o "user")
  const role = getDataCookies(UserType.USER)

  // Seleccionar el array de items según el rol
  const sidebarItems = role === UserType.RESTAURANT ? adminItems : userItems

  // Get theme colors
  const [teal500, purple500] = useToken("colors", ["teal.500", "purple.500", "red.400"])

  // Configuración de colores
  const bgColor = useColorModeValue("white", "gray.800")
  const borderColor = useColorModeValue("gray.200", "gray.700")
  const gradientStart = useColorModeValue("teal.50", "gray.700")
  const itemHoverBg = useColorModeValue("teal.50", "gray.700")
  const itemHoverColor = useColorModeValue("teal.600", "teal.200")
  const itemActiveBg = useColorModeValue("purple.50", "purple.900")
  const itemActiveColor = useColorModeValue("purple.600", "purple.200")
  const logoutHoverBg = useColorModeValue("red.50", "red.900")
  const logoutHoverColor = useColorModeValue("red.600", "red.200")

  // Custom navigation function that updates the active path
  const handleNavigation = (path: string) => {
    setActivePath(path) // Update active path immediately
    redirect(path) // Then redirect
  }

  return (
    <>
      {/* Sidebar para escritorio */}
      <Box
        display={{ base: "none", md: "flex" }}
        flexDir="column"
        w={isExpanded ? "240px" : "80px"}
        bg={`linear-gradient(180deg, ${gradientStart} 0%, ${bgColor} 100%)`}
        borderRightWidth="1px"
        borderColor={borderColor}
        transition="all 0.3s ease"
        overflow="hidden"
        boxShadow="0 4px 12px rgba(0,0,0,0.05)"
        position="relative"
        zIndex="1"
      >
        <Flex
          h="20"
          alignItems="center"
          justifyContent={isExpanded ? "space-between" : "center"}
          px={isExpanded ? 6 : 0}
          borderBottomWidth="1px"
          borderColor={borderColor}
          bg={`linear-gradient(90deg, ${teal500}22 0%, ${purple500}22 100%)`}
        >
          {isExpanded && (
            <HStack spacing={2}>
              <Avatar size="sm" bg="teal.500" icon={<StarIcon fontSize="1.2rem" />} />
              <Text
                fontSize="xl"
                fontWeight="extrabold"
                bgGradient={`linear(to-r, ${teal500}, ${purple500})`}
                bgClip="text"
              >
                QuickBite
              </Text>
            </HStack>
          )}
          <IconButton
            aria-label="Toggle sidebar"
            icon={isExpanded ? <ChevronLeftIcon /> : <ChevronRightIcon />}
            onClick={toggleSidebar}
            variant="ghost"
            borderRadius="full"
            size="sm"
            _hover={{
              bg: itemHoverBg,
              transform: "scale(1.1)",
            }}
            transition="all 0.2s"
          />
        </Flex>

        {/* User info section */}
        {isExpanded && (
          <Flex p={4} alignItems="center" borderBottomWidth="1px" borderColor={borderColor}>
            <Avatar size="sm" name="User Name" mr={3} />
            <Box>
              <Text fontWeight="medium" fontSize="sm">
                {role === UserType.RESTAURANT ? "Admin User" : "Customer"}
              </Text>
              <Text fontSize="xs" color="gray.500">
                <TimeIcon mr={1} fontSize="10px" />
                Online
              </Text>
            </Box>
          </Flex>
        )}

        <VStack align="stretch" spacing={2} mt={4} mb={4} px={2}>
          {sidebarItems.map((item) => (
            <Tooltip key={item.name} label={item.name} placement="right" isDisabled={isExpanded} hasArrow>
              <Flex
                p={2.5}
                mx={1}
                borderRadius="lg"
                role="group"
                cursor="pointer"
                position="relative"
                alignItems="center"
                justify={isExpanded ? "flex-start" : "center"}
                bg={activePath === item.path ? itemActiveBg : "transparent"}
                color={activePath === item.path ? itemActiveColor : "inherit"}
                transition="all 0.2s"
                _hover={{
                  bg: activePath === item.path ? itemActiveBg : itemHoverBg,
                  color: activePath === item.path ? itemActiveColor : itemHoverColor,
                  transform: "translateX(3px)",
                }}
                onClick={() => handleNavigation(item.path)}
              >
                {/* Highlight indicator */}
                {item.highlight && (
                  <Box
                    position="absolute"
                    left={0}
                    top="50%"
                    transform="translateY(-50%)"
                    width="3px"
                    height="60%"
                    bg={activePath === item.path ? purple500 : teal500}
                    borderRightRadius="full"
                  />
                )}

                <Box
                  borderRadius="md"
                  p={1.5}
                  bg={activePath === item.path ? `${purple500}22` : "transparent"}
                  color={activePath === item.path ? itemActiveColor : "inherit"}
                  transition="all 0.2s"
                  _groupHover={{
                    bg: activePath === item.path ? `${purple500}22` : `${teal500}22`,
                  }}
                >
                  <item.icon boxSize={5} />
                </Box>

                {isExpanded && (
                  <Text ml={3} fontWeight={activePath === item.path ? "semibold" : "medium"}>
                    {item.name}
                  </Text>
                )}

                {/* Notification badge */}
                {item.notification && (
                  <Badge
                    ml="auto"
                    borderRadius="full"
                    px={2}
                    py={0.5}
                    colorScheme={activePath === item.path ? "purple" : "teal"}
                    fontSize="xs"
                    fontWeight="bold"
                  >
                    {item.notification}
                  </Badge>
                )}
              </Flex>
            </Tooltip>
          ))}
        </VStack>

        {/* Logout button at bottom */}
        {isExpanded && (
          <Box mt="auto" p={4} borderTopWidth="1px" borderColor={borderColor}>
            <Button
              leftIcon={<ExternalLinkIcon />}
              variant="ghost"
              size="sm"
              width="full"
              justifyContent="flex-start"
              color="gray.600"
              _hover={{
                bg: logoutHoverBg,
                color: logoutHoverColor,
              }}
            >
              Cerrar Sesión
            </Button>
          </Box>
        )}
        {!isExpanded && (
          <Box mt="auto" p={2} borderTopWidth="1px" borderColor={borderColor} textAlign="center">
            <IconButton
              aria-label="Logout"
              icon={<ExternalLinkIcon />}
              variant="ghost"
              size="sm"
              borderRadius="full"
              _hover={{
                bg: logoutHoverBg,
                color: logoutHoverColor,
              }}
            />
          </Box>
        )}
      </Box>

      {/* Drawer para dispositivos móviles */}
      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay backdropFilter="blur(2px)" />
        <DrawerContent borderRightRadius="2xl">
          <DrawerHeader
            borderBottomWidth="1px"
            bg={`linear-gradient(90deg, ${teal500}22 0%, ${purple500}22 100%)`}
            display="flex"
            alignItems="center"
          >
            <Avatar size="sm" bg="teal.500" icon={<StarIcon fontSize="1.2rem" />} mr={3} />
            <Text fontWeight="extrabold" bgGradient={`linear(to-r, ${teal500}, ${purple500})`} bgClip="text">
              QuickBite
            </Text>
            <DrawerCloseButton top="3" />
          </DrawerHeader>

          {/* User info section */}
          <Flex p={4} alignItems="center" borderBottomWidth="1px" borderColor={borderColor}>
            <Avatar size="sm" name="User Name" mr={3} />
            <Box>
              <Text fontWeight="medium" fontSize="sm">
                {role === UserType.RESTAURANT ? "Admin User" : "Customer"}
              </Text>
              <Text fontSize="xs" color="gray.500">
                <TimeIcon mr={1} fontSize="10px" />
                Online
              </Text>
            </Box>
          </Flex>

          <DrawerBody p={3}>
            <VStack align="stretch" spacing={2}>
              {sidebarItems.map((item) => (
                <Flex
                  key={item.name}
                  p={3}
                  borderRadius="lg"
                  role="group"
                  cursor="pointer"
                  position="relative"
                  alignItems="center"
                  bg={activePath === item.path ? itemActiveBg : "transparent"}
                  color={activePath === item.path ? itemActiveColor : "inherit"}
                  transition="all 0.2s"
                  _hover={{
                    bg: activePath === item.path ? itemActiveBg : itemHoverBg,
                    color: activePath === item.path ? itemActiveColor : itemHoverColor,
                  }}
                  onClick={() => {
                    handleNavigation(item.path)
                    onClose()
                  }}
                >
                  {/* Highlight indicator */}
                  {item.highlight && (
                    <Box
                      position="absolute"
                      left={0}
                      top="50%"
                      transform="translateY(-50%)"
                      width="3px"
                      height="60%"
                      bg={activePath === item.path ? purple500 : teal500}
                      borderRightRadius="full"
                    />
                  )}

                  <Box
                    borderRadius="md"
                    p={1.5}
                    bg={activePath === item.path ? `${purple500}22` : "transparent"}
                    color={activePath === item.path ? itemActiveColor : "inherit"}
                    transition="all 0.2s"
                    _groupHover={{
                      bg: activePath === item.path ? `${purple500}22` : `${teal500}22`,
                    }}
                  >
                    <item.icon boxSize={5} />
                  </Box>

                  <Text ml={3} fontWeight={activePath === item.path ? "semibold" : "medium"}>
                    {item.name}
                  </Text>

                  {/* Notification badge */}
                  {item.notification && (
                    <Badge
                      ml="auto"
                      borderRadius="full"
                      px={2}
                      py={0.5}
                      colorScheme={activePath === item.path ? "purple" : "teal"}
                      fontSize="xs"
                      fontWeight="bold"
                    >
                      {item.notification}
                    </Badge>
                  )}
                </Flex>
              ))}

              <Divider my={2} />

              <Flex
                p={3}
                borderRadius="lg"
                role="group"
                cursor="pointer"
                alignItems="center"
                color="gray.600"
                _hover={{
                  bg: logoutHoverBg,
                  color: logoutHoverColor,
                }}
              >
                <Box borderRadius="md" p={1.5}>
                  <ExternalLinkIcon boxSize={5} />
                </Box>
                <Text ml={3}>Cerrar Sesión</Text>
              </Flex>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  )
}
