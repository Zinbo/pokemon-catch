import './globals.css'
import {Providers} from "@/app/providers";
import {Container} from "@chakra-ui/react";
import Navbar from "@/components/Navbar";
import BottomBar from "@/components/BottomBar";
import React from "react";

export default function RootLayout({
                                     children,
                                   }: {
  children: React.ReactNode
}) {
  return (
      <html lang="en">
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
