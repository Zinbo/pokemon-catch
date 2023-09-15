'use client'
import {Flex, Grid, GridItem, Text} from "@chakra-ui/react";
import Legend from "@/app/Legend";
import AddGame from "@/app/AddGame";
import Search from "@/app/Search";
import Image from "next/image";
import {StarIcon} from "@chakra-ui/icons";
import PokemonGrid from "@/app/PokemonGrid";

export default function Home() {

    return (
        <Flex direction={"column"} rowGap={5}>
            <Flex justifyContent={"space-between"} gap={"50px"}>
                <AddGame/>
                <Search/>
                <Legend/>
            </Flex>
            <PokemonGrid/>
        </Flex>
    )
}
