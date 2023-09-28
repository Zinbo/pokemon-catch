'use client'

import {Card, CardBody, CardHeader, Flex, Heading} from "@chakra-ui/react";
import React from "react";
import EvolutionChain, {EvolvesTo} from "@/data/EvolutionChain";
import CriteriaArrow from "@/app/pokemon-details/[id]/CriteriaArrow";
import {PokemonWithMeta} from "@/data/Pokemon";
import PokemonImage from "@/app/PokemonImage";

interface ColumnsPair {
    arrows: React.JSX.Element[]
    pokemonImages: React.JSX.Element[]
}

export default function Evolutions({evolutionChain, allPokemonInChain}: {
    evolutionChain: EvolutionChain,
    allPokemonInChain: PokemonWithMeta[]
}) {


    const getEvoSection = (next: EvolvesTo) => {

        const pokemon = (allPokemonInChain.find(p => p.pokedexNumber === next.pokedexNumber) as PokemonWithMeta);

        const pokemonCard = (
            <Flex direction={"column"} alignItems={"center"}>
                <PokemonImage pokedexNumber={pokemon.pokedexNumber} name={pokemon.name} isOwned={pokemon.owned}
                              canBeAcquired={pokemon.catchable}/>
            </Flex>
        )
        if (!next.waysToEvolve.length) return {pokemonCard};

        const arrow = <CriteriaArrow pokemonEvolution={next}/>

        return {arrow, pokemonCard};
    }

    const columns: ColumnsPair[] = [{arrows: [], pokemonImages: []}];

    const calculateNextColumn = (next: EvolvesTo, index: number) => {
        const {arrow, pokemonCard} = getEvoSection(next);

        if (arrow) columns[index].arrows.push(arrow);
        columns[index].pokemonImages.push(pokemonCard);

        if (!next.evolvesTo.length) return;

        columns.push({arrows: [], pokemonImages: []});

        index++;

        next.evolvesTo.forEach(child => calculateNextColumn(child, index));
        return;
    }

    const Evo = () => {
        if (!evolutionChain.chain.evolvesTo?.length) return <>Pokemon does not evolve</>;
        calculateNextColumn(evolutionChain.chain, 0);

        return (
            <Flex justifyContent={"center"} gap={"20px"} className={"evo-chart"}>
                {columns.map(c => (
                    <>
                        {!!c.arrows.length &&
                            <Flex className={"evo-chart-column"} direction={"column"} justifyContent={"center"}
                                  alignItems={"center"}>
                                {c.arrows}
                            </Flex>}
                        <Flex className={"evo-chart-column"} direction={"column"} justifyContent={"center"}
                              alignItems={"center"}>
                            {c.pokemonImages}
                        </Flex>

                    </>
                ))}
            </Flex>
        )
    }

    return (
        <Card flex={1}>
            <CardHeader>
                <Heading size='md'>Evolutions</Heading>
            </CardHeader>

            <CardBody>

                <Evo/>
            </CardBody>
        </Card>
    )
}