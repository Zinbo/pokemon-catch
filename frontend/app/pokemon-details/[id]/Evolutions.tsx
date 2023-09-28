'use client'

import {Card, CardBody, CardHeader, Flex, Heading} from "@chakra-ui/react";
import React from "react";
import EvolutionChain, {EvolvesTo} from "@/data/EvolutionChain";
import CriteriaArrow from "@/app/pokemon-details/[id]/CriteriaArrow";
import {PokemonWithMeta} from "@/data/Pokemon";
import PokemonImage from "@/app/PokemonImage";

export default function Evolutions({evolutionChain, allPokemonInChain}: { evolutionChain: EvolutionChain, allPokemonInChain: PokemonWithMeta[] }) {


    const getEvoSection = (next: EvolvesTo) => {

        const pokemon = (allPokemonInChain.find(p => p.pokedexNumber === next.pokedexNumber) as PokemonWithMeta);

        const pokemonCard = (
            <Flex direction={"column"} alignItems={"center"} className={"pokemon-evo"}>
                <PokemonImage pokedexNumber={pokemon.pokedexNumber} name={pokemon.name} isOwned={pokemon.owned} canBeAcquired={pokemon.catchable}/>
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