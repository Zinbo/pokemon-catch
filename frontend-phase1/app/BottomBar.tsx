'use client'

import {Box, Flex, Link, Stack, Text, useBreakpointValue, useColorModeValue,} from '@chakra-ui/react'
import localFont from '@next/font/local'
import NextLink from 'next/link'

export default function BottomBar() {

    return (
        <Box>
            <Flex
                bg={useColorModeValue('#AF0000', 'gray.800')}
                color={useColorModeValue('white', 'white')}
                minH={'60px'}
                py={{ base: 2 }}
                px={{ base: 4 }}
                align={'center'}>
                <Flex flex={{ base: 1 }} justify='center'>
                    <Text
                        textAlign={useBreakpointValue({ base: 'center', md: 'left' })}
                        fontFamily={'heading'}
                        fontSize='1xl'>
                        Made with ❤️ by Shane Jennings
                    </Text>
                </Flex>
            </Flex>
        </Box>
    )
}
