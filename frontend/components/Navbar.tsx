'use client'

import {Box, Flex, Link, Stack, Text, useBreakpointValue, useColorModeValue,} from '@chakra-ui/react'
import localFont from 'next/font/local'
import NextLink from 'next/link'
import Image from "next/image";

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
                    <Image src={"/logo.png"} alt={"logo"} width={223} height={40}/>
                </Flex>
            </Flex>
        </Box>
    )
}
