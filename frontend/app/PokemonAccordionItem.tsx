'use client'
import {Box, Button, Flex, Heading} from "@chakra-ui/react";
import React, {ReactNode, useState} from "react";
import {ChevronDownIcon, ChevronUpIcon} from "@chakra-ui/icons";

export default function PokemonAccordionItem({isVisible, heading, children} : {isVisible: boolean, heading: string, children: ReactNode}) {

    const [open, setOpen] = useState(true);

    return (
        <Box style={{display: isVisible ? "block" : "none"}}>
            <Flex onClick={() => setOpen(!open)}><Button flex={1} variant='outline'><Box as="span" flex={1} textAlign={'left'}><Heading as='h6' size='md'>{heading}</Heading></Box>{open ? <ChevronUpIcon boxSize={"2em"}/> : <ChevronDownIcon boxSize={"2em"}/>}</Button></Flex>
            <Box style={{display: open? "block" : "none"}} paddingTop={"10px"}>
                {children}
            </Box>
        </Box>
    )
}