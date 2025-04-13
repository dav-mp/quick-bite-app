"use client"

import {
  Flex,
  IconButton,
  Text,
  HStack,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useColorModeValue,
  useColorMode,
} from "@chakra-ui/react"
import { HamburgerIcon, BellIcon, SearchIcon, ExternalLinkIcon, MoonIcon, SunIcon } from "@chakra-ui/icons"
import { removeUserCookies } from "../../../../app/infrastructure/service/CookiesService"
import useRedirect from "../../hooks/useRedirect"

interface NavbarProps {
  onMobileMenuOpen: () => void
}

export default function Navbar({ onMobileMenuOpen }: NavbarProps) {
  const redirect = useRedirect();
  const { colorMode, toggleColorMode } = useColorMode()
  const bgColor = useColorModeValue("white", "gray.800")
  const borderColor = useColorModeValue("gray.200", "gray.700")

  const logout = () => {
    removeUserCookies()
    setTimeout(() => {
        redirect("/login-external")
    }, 1000);
  }

  return (
    <Flex
      as="nav"
      align="center"
      wrap="wrap"
      padding={4}
      bg={bgColor}
      color="gray.600"
      borderBottomWidth="1px"
      borderColor={borderColor}
      boxShadow="sm"
    >
      {/* Left section with hamburger menu on mobile and logo */}
      <Flex flex="1" align="center">
        <IconButton
          display={{ base: "flex", md: "none" }}
          onClick={onMobileMenuOpen}
          variant="outline"
          aria-label="open menu"
          icon={<HamburgerIcon />}
          mr={2}
        />
        <Text fontSize="xl" fontWeight="bold">
          QuickBite
        </Text>
      </Flex>

      {/* Right section with icons - always aligned to the right */}
      <HStack spacing={4}>
        <IconButton
          aria-label={`Switch to ${colorMode === "light" ? "dark" : "light"} mode`}
          icon={colorMode === "light" ? <MoonIcon /> : <SunIcon />}
          variant="ghost"
          onClick={toggleColorMode}
          size="md"
        />
        <IconButton aria-label="Search" icon={<SearchIcon />} variant="ghost" size="md" />
        <IconButton aria-label="Notifications" icon={<BellIcon />} variant="ghost" size="md" />
        <Menu>
          <MenuButton
            as={IconButton}
            aria-label="User menu"
            icon={<Avatar size="sm" name="User" bg="teal.500" />}
            variant="ghost"
          />
          <MenuList>
            <MenuItem icon={<ExternalLinkIcon />} color={"red"} onClick={logout}>Logout</MenuItem>
          </MenuList>
        </Menu>
      </HStack>
    </Flex>
  )
}
