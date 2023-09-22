'use client'
import {Box, Flex, Heading} from "@chakra-ui/react";
import React, {ReactNode, useState} from "react";
import {ChevronDownIcon, ChevronUpIcon} from "@chakra-ui/icons";

export default function PokemonAccordionItem({isVisible, heading, children} : {isVisible: boolean, heading: string, children: ReactNode}) {

    const [open, setOpen] = useState(true);

    return (
        <Box style={{display: isVisible ? "block" : "none"}}>
            <Flex onClick={() => setOpen(!open)}><Heading>{heading}</Heading> {open ? <ChevronUpIcon boxSize={"2em"}/> : <ChevronDownIcon boxSize={"2em"}/>}</Flex>
            <Box style={{display: open? "block" : "none"}}>
                {children}
            </Box>
        </Box>
    )
}