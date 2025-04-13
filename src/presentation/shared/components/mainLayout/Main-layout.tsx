import { Flex, Box, useDisclosure } from "@chakra-ui/react"
import { Outlet } from "react-router-dom"
import Navbar from "./Navbar"
import { Sidebar } from "./Sidebar"

export default function MainLayout() {
  // Para el sidebar en mobile
  const { isOpen, onOpen, onClose } = useDisclosure()

  return (
    <Flex h="100vh" flexDirection="column">
      {/* Top Navbar */}
      <Navbar onMobileMenuOpen={onOpen} />

      <Flex flex={1} overflow="hidden">
        {/* Sidebar */}
        <Sidebar isOpen={isOpen} onClose={onClose} />

        {/* Contenido Principal */}
        <Box flex={1} p={4} overflow="auto">
          <Outlet />
        </Box>
      </Flex>
    </Flex>
  )
}
