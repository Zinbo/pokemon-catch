'use client'

import {
    Avatar,
    Box,
    Button,
    Center, Checkbox,
    Flex,
    IconButton, Input, InputGroup, InputRightElement, Link,
    Menu,
    MenuButton,
    MenuDivider, MenuGroup,
    MenuItem,
    MenuList, Select,
    Stack,
    Text,
    useBreakpointValue,
    useColorMode,
    useColorModeValue,
    useDisclosure,
} from '@chakra-ui/react'
import {CloseIcon, HamburgerIcon, Icon, MoonIcon, SearchIcon, SunIcon,} from '@chakra-ui/icons'
import localFont from "next/font/local";
import {BsFilter} from "react-icons/bs";
import NextLink from "next/link";

const pokemon = localFont({
    src: [
        {
            path: '../public/fonts/pokemongb.ttf',
            weight: '400'
        }
    ],
    variable: '--font-pokemon'
})

export default function Navbar() {
    const { isOpen, onToggle } = useDisclosure()
    const { colorMode, toggleColorMode } = useColorMode()

    return (
        <Box>
            <Flex
                bg={useColorModeValue('white', 'gray.800')}
                color={useColorModeValue('gray.600', 'white')}
                minH={'60px'}
                py={{ base: 2 }}
                px={{ base: 4 }}
                borderBottom={1}
                borderStyle={'solid'}
                borderColor={useColorModeValue('gray.200', 'gray.900')}
                align={'center'}>
                <Flex
                    flex={{ base: 1, md: 'auto' }}
                    ml={{ base: -2 }}
                    display={{ base: 'flex', md: 'none' }}>
                    <IconButton
                        onClick={onToggle}
                        icon={isOpen ? <CloseIcon w={3} h={3} /> : <HamburgerIcon w={5} h={5} />}
                        variant={'ghost'}
                        aria-label={'Toggle Navigation'}
                    />
                </Flex>
                <Flex flex={{ base: 1 }} justify={{ base: 'center', md: 'start' }}>
                    <Text
                        textAlign={useBreakpointValue({ base: 'center', md: 'left' })}
                        fontFamily={'heading'}
                        color={useColorModeValue('gray.800', 'white')}
                    className={pokemon.className}>
                        <Link as={NextLink} href='/'>
                            Pokémon Catch
                        </Link>

                    </Text>
                </Flex>
                <Flex alignItems={'center'}>
                    <Stack direction={'row'} spacing={7}>
                        <Button onClick={toggleColorMode}>
                            {colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
                        </Button>

                        <Menu>
                            <MenuButton
                                as={Button}
                                rounded={'full'}
                                variant={'link'}
                                cursor={'pointer'}
                                minW={0}>
                                <Avatar
                                    size={'sm'}
                                    src={'https://avatars.dicebear.com/api/male/username.svg'}
                                />
                            </MenuButton>
                            <MenuList alignItems={'center'}>
                                <br />
                                <Center>
                                    <Avatar
                                        size={'2xl'}
                                        src={'https://avatars.dicebear.com/api/male/username.svg'}
                                    />
                                </Center>
                                <br />
                                <Center>
                                    <p>Username</p>
                                </Center>
                                <br />
                                <MenuDivider />
                                <MenuItem>Your Games</MenuItem>
                                <MenuItem>Help</MenuItem>
                                <MenuItem>Account Settings</MenuItem>
                                <MenuItem>Logout</MenuItem>
                            </MenuList>
                        </Menu>
                    </Stack>
                </Flex>
            </Flex>
        </Box>
    )
}