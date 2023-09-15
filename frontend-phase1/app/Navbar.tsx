'use client'

import {Box, Flex, Link, Stack, Text, useBreakpointValue, useColorModeValue,} from '@chakra-ui/react'
import localFont from '@next/font/local'
import NextLink from 'next/link'

const pokemon = localFont({
    src: [
        {
            path: '../public/fonts/pokemon.ttf',
            weight: '400'
        }
    ],
    variable: '--font-pokemon'
})

export default function Navbar() {

    return (
        <Box>
            <Flex
                bg={useColorModeValue('#AF0000', 'gray.800')}
                color={useColorModeValue('gray.600', 'white')}
                minH={'60px'}
                py={{ base: 2 }}
                px={{ base: 4 }}
                borderBottom={1}
                borderStyle={'solid'}
                borderColor={useColorModeValue('gray.200', 'gray.900')}
                align={'center'}>
                <Flex flex={{ base: 1 }} justify={{ base: 'center', md: 'start' }}>
                    <Text
                        textAlign={useBreakpointValue({ base: 'center', md: 'left' })}
                        fontFamily={'heading'}
                        fontSize='3xl'
                        style={{WebkitTextStroke: '2px #356ABC'}}
                        color={useColorModeValue('#FFCD00', 'white')}
                    className={pokemon.className}>
                        Pokemon Catch
                    </Text>
                </Flex>

                <Stack
                    flex={1}
                    justify={'flex-end'}
                    direction={'row'}
                    spacing={6}>
                    <Link as={NextLink} href='/add-games' color={'white'}>
                        Add Games
                    </Link>
                </Stack>
            </Flex>
        </Box>
    )
}
