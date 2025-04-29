"use client"

import { Box, useDisclosure } from "@chakra-ui/react"
import { Outlet } from "react-router-dom"
import Navbar from "./Navbar"
import { motion } from "framer-motion"

const MotionBox = motion(Box)

export default function MainLayout() {
  // Para el sidebar en mobile
  const { onOpen } = useDisclosure()

  return (
    <Box
      minH="100vh"
      bg={useColorModeValue("gray.50", "gray.900")}
      backgroundImage={useColorModeValue(
        "radial-gradient(at 100% 0%, rgba(255, 105, 180, 0.1) 0px, transparent 50%), radial-gradient(at 0% 100%, rgba(111, 66, 193, 0.1) 0px, transparent 50%)",
        "radial-gradient(at 100% 0%, rgba(255, 105, 180, 0.15) 0px, transparent 50%), radial-gradient(at 0% 100%, rgba(111, 66, 193, 0.15) 0px, transparent 50%)",
      )}
    >
      {/* Top Navbar */}
      <Navbar onMobileMenuOpen={onOpen} />

      {/* Main Content */}
      <MotionBox
        maxW="container.xl"
        mx="auto"
        px={4}
        py={6}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Outlet />
      </MotionBox>
    </Box>
  )
}

// Helper function for useColorModeValue
function useColorModeValue(light: string, dark: string) {
  return { light, dark }[useColorMode().colorMode] || light
}

// Add this at the top
import { useColorMode } from "@chakra-ui/react"
