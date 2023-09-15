import './globals.css'
import type {Metadata} from 'next'
import {Providers} from "@/app/providers";
import {Container} from "@chakra-ui/react";
import Navbar from "@/app/Navbar";
import localFont from '@next/font/local'
import BottomBar from "@/app/BottomBar";

const pokemon = localFont({
    src: [
        {
            path: '../public/fonts/pokemon.ttf',
            weight: '400'
        }
    ],
    variable: '--font-pokemon'
})

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
        {/*<body className={pokemon.className}>*/}
        <body>
        <Providers>
            <div style={{minHeight: '100vh', display: "flex", flexDirection: "column"}}>
                <Navbar/>
                <Container maxW="container.xl" sx={{display: "flex", flexDirection: "column", flex: 1}}>
                    {children}
                </Container>
                <BottomBar/>
            </div>
        </Providers>
        </body>
        </html>
    )
}
