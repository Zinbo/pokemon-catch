'use client'

import {Card, CardBody, CardHeader, Flex, Heading, Text} from "@chakra-ui/react";
import React from "react";
import EvolutionChain, {EvolvesTo} from "@/data/EvolutionChain";
import Image from "next/image";
import {ArrowForwardIcon, ArrowRightIcon, Icon} from "@chakra-ui/icons";
import {HiOutlineArrowLongRight} from "react-icons/hi2";
import {CgArrowLongRight} from "react-icons/cg";

export default function Evolutions({evolutionChain} : {evolutionChain: EvolutionChain}) {

    // have a list of rows
    // first row with one column is the first evo
    // then for each child there is a second row added

    if(!evolutionChain.chain.evolvesTo?.length) return <>Pokemon does not evolve</>;

    const getEvoSection = (next: EvolvesTo) => {
        const pokemonCard = (
            <Flex direction={"column"} alignItems={"center"}>
                <Image src={`/images/list/${next.pokedexNumber}.png`} width="96" height="96" alt="pokemon"/>
                <Text>{next.name}</Text>
            </Flex>
        )
        if(!next.waysToEvolve.length) return [pokemonCard];

        const criteria = next.waysToEvolve.map(criteria => `Trigger: ${criteria.trigger}, Conditions: [${criteria.triggerCriteria.map(c => `${c.type}: ${c.value}`).join(", ")}]`).join(" OR ");
        const arrow = (
            <Flex direction={"column"} className={"criteria"} justifyContent={"center"} alignItems={"center"} flex={1}>
                <Icon boxSize={"4em"} viewBox={"0 0 24 10"} as={HiOutlineArrowLongRight}/>
                <Text>{criteria}</Text>
            </Flex>
        )

        return [arrow, pokemonCard];
    }

    const calculateElements = (next: EvolvesTo) : React.JSX.Element[] => {
        const own = getEvoSection(next);
        if(!next.evolvesTo.length) return own;

        if(next.evolvesTo.length === 1) return [...own, ...calculateElements(next.evolvesTo[0])];

        const childElements = next.evolvesTo.map(child => {
            return (
                <Flex justifyContent={"space-between"}>
                    {calculateElements(child)}
                </Flex>
            )
        });
        const rows = <Flex direction={"column"} justifyContent={"center"}>{childElements}</Flex>
        return [...own, rows];

    }

    const Evo = () => (
        <Flex justifyContent={"center"} alignItems={"center"}>
            {calculateElements(evolutionChain.chain)}
        </Flex>
    )

    return (
        <Card>
            <CardHeader>
                <Heading size='md'>Evolutions V2</Heading>
            </CardHeader>

            <CardBody>
                <Evo/>
            </CardBody>
        </Card>
    )
}