import { useState } from "react";
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
} from "@chakra-ui/react";
import {
  ChevronRightIcon,
  ChevronLeftIcon,
  InfoIcon,
  ViewIcon,
  CalendarIcon,
  SettingsIcon,
  ExternalLinkIcon,
} from "@chakra-ui/icons";
import useRedirect from "../../hooks/useRedirect";
import { getDataCookies } from "../../../../app/infrastructure/service/CookiesService";
import { UserType } from "../../../../app/domain/models/cookies/DataCookies";
// Supongamos que tenemos un hook para obtener el rol actual del usuario

// Configuración de opciones para admin y usuario regular

const adminItems = [
  { name: "Dashboard", icon: ViewIcon, path: "/dashboard" },
  { name: "Usuarios", icon: ViewIcon, path: "/users" },
  { name: "Configuración", icon: SettingsIcon, path: "/admin-settings" },
];

const userItems = [
  { name: "Home", icon: InfoIcon, path: "/user/" },
  { name: "Ordenes", icon: ViewIcon, path: "/user/orders" },
  { name: "Carrito", icon: CalendarIcon, path: "/user/cart" },
  { name: "Ajustes", icon: SettingsIcon, path: "/user/settings" },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const redirect = useRedirect();
  const [isExpanded, setIsExpanded] = useState(true);
  const toggleSidebar = () => setIsExpanded(!isExpanded);

  // Obtener el rol del usuario (por ejemplo: "admin" o "user")
  const role = getDataCookies(UserType.USER);

  // Seleccionar el array de items según el rol
  const sidebarItems = role === UserType.RESTAURANT ? adminItems : userItems;

  // Configuración de colores
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  return (
    <>
      {/* Sidebar para escritorio */}
      <Box
        display={{ base: "none", md: "flex" }}
        flexDir="column"
        w={isExpanded ? "240px" : "80px"}
        bg={bgColor}
        borderRightWidth="1px"
        borderColor={borderColor}
        transition="width 0.2s ease"
        overflow="hidden"
      >
        <Flex
          h="20"
          alignItems="center"
          justifyContent={isExpanded ? "space-between" : "center"}
          px={isExpanded ? 8 : 0}
        >
          {isExpanded && (
            <Text fontSize="2xl" fontWeight="bold">
              QuickBite
            </Text>
          )}
          <IconButton
            aria-label="Toggle sidebar"
            icon={isExpanded ? <ChevronLeftIcon /> : <ChevronRightIcon />}
            onClick={toggleSidebar}
            variant="ghost"
          />
        </Flex>
        <VStack align="stretch" spacing={1} mt={2}>
          {sidebarItems.map((item) => (
            <Flex
              key={item.name}
              p={3}
              mx={3}
              borderRadius="md"
              role="group"
              cursor="pointer"
              _hover={{
                bg: "teal.50",
                color: "teal.600",
              }}
              justify={isExpanded ? "flex-start" : "center"}
              alignItems={"center"}
              onClick={() => redirect(item.path)}
            >
              <item.icon />
              {isExpanded && <Text ml={4}>{item.name}</Text>}
            </Flex>
          ))}
        </VStack>
      </Box>

      {/* Drawer para dispositivos móviles */}
      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">FoodApp</DrawerHeader>
          <DrawerBody p={0}>
            <VStack align="stretch" spacing={0}>
              {sidebarItems.map((item) => (
                <Flex
                  key={item.name}
                  p={4}
                  role="group"
                  cursor="pointer"
                  _hover={{
                    bg: "teal.50",
                    color: "teal.600",
                  }}
                  align="center"
                  onClick={() => redirect(item.path)}
                >
                  <item.icon />
                  <Text ml={4}>{item.name}</Text>
                </Flex>
              ))}
              <Divider />
              <Flex
                p={4}
                role="group"
                cursor="pointer"
                _hover={{
                  bg: "red.50",
                  color: "red.600",
                }}
                align="center"
              >
                <ExternalLinkIcon />
                <Text ml={4}>Logout</Text>
              </Flex>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
}
