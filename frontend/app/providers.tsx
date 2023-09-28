'use client'

import { CacheProvider } from '@chakra-ui/next-js'
import { ChakraProvider } from '@chakra-ui/react'
import { extendTheme } from '@chakra-ui/react'

const colors = {
    brand: {
        900: '#AF0000',
        800: '#153e75',
        700: '#2a69ac',
    },
}

import {Epilogue} from 'next/font/google'

const epilogue = Epilogue({
    weight: ["300", "400"],
    style: ["normal", "italic"],
    subsets: ["latin"],
});


export const theme = extendTheme({ colors,
fonts: {
    heading: epilogue.style.fontFamily,
    body: epilogue.style.fontFamily
}})

export function Providers({
                              children
                          }: {
    children: React.ReactNode
}) {
    return (
        <CacheProvider>
            <ChakraProvider theme={theme}>
                {children}
            </ChakraProvider>
        </CacheProvider>
    )
}