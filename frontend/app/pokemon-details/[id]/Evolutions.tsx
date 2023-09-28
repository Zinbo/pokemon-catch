'use client'

import {Card, CardBody, CardHeader, Flex, Heading, Text} from "@chakra-ui/react";
import React from "react";
import EvolutionChain, {EvolvesTo} from "@/data/EvolutionChain";
import Image from "next/image";
import CriteriaArrow from "@/app/pokemon-details/[id]/CriteriaArrow";

export default function Evolutions({evolutionChain}: { evolutionChain: EvolutionChain }) {

    // have a list of rows
    // first row with one column is the first evo
    // then for each child there is a second row added

    const getEvoSection = (next: EvolvesTo) => {
        const pokemonCard = (
            <Flex direction={"column"} alignItems={"center"} className={"pokemon-evo"}>
                <Image src={`/images/list/${next.pokedexNumber}.png`} width="96" height="96" alt="pokemon"/>
                <Text>{next.name}</Text>
            </Flex>
        )
        if (!next.waysToEvolve.length) return [pokemonCard];

        const arrow = <CriteriaArrow pokemonEvolution={next}/>

        return [arrow, pokemonCard];
    }

    const calculateElements = (next: EvolvesTo): React.JSX.Element[] => {
        const own = getEvoSection(next);
        if (!next.evolvesTo.length) return own;

        if (next.evolvesTo.length === 1) return [...own, ...calculateElements(next.evolvesTo[0])];

        const childElements = next.evolvesTo.map(child => {
            return (
                <Flex justifyContent={"space-between"} className={"child-evo"}>
                    {calculateElements(child)}
                </Flex>
            )
        });
        const rows = <Flex direction={"column"} justifyContent={"center"}
                           className={"child-evo-row"}>{childElements}</Flex>
        return [...own, rows];

    }

    const Evo = () => {
        if (!evolutionChain.chain.evolvesTo?.length) return <>Pokemon does not evolve</>;
        return (
            <Flex justifyContent={"center"} alignItems={"center"} className={"first-evo-row"}>
                {calculateElements(evolutionChain.chain)}
            </Flex>
        )
    }

    return (
        <Card>
            <CardHeader>
                <Heading size='md'>Evolutions</Heading>
            </CardHeader>

            <CardBody>

                <Evo/>
            </CardBody>
        </Card>
    )
}