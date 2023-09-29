'use client'

import {Card, CardBody, CardHeader, Flex, Heading} from "@chakra-ui/react";
import React from "react";
import EvolutionChain, {EvolvesTo} from "@/types/EvolutionChain";
import CriteriaArrow from "@/app/pokemon-details/[id]/CriteriaArrow";
import {PokemonWithMeta} from "@/types/Pokemon";
import PokemonImage from "@/app/PokemonImage";

interface ColumnsPair {
    arrows: React.JSX.Element[]
    pokemonImages: React.JSX.Element[]
}

export default function Evolutions({evolutionChain, allPokemonInChain}: {
    evolutionChain: EvolutionChain,
    allPokemonInChain: PokemonWithMeta[]
}) {


    const getEvoSection = (next: EvolvesTo, alolan: boolean, galarian: boolean) => {

        const pokemon = (allPokemonInChain.find(p => p.pokedexNumber === next.pokedexNumber) as PokemonWithMeta);

        const pokemonCard = (
            <Flex direction={"column"} alignItems={"center"}>
                <PokemonImage pokedexNumber={pokemon.pokedexNumber} name={pokemon.name} isOwned={pokemon.owned}
                              canBeAcquired={pokemon.catchable} alolan={alolan} galarian={galarian}/>
            </Flex>
        )
        if (!next.waysToEvolve.length) return {pokemonCard};

        const arrow = <CriteriaArrow pokemonEvolution={next}/>

        return {arrow, pokemonCard};
    }


    const calculateNextColumn = (next: EvolvesTo, index: number, columns: ColumnsPair[], alolan: boolean, galarian: boolean) => {
        const {arrow, pokemonCard} = getEvoSection(next, alolan, galarian);

        if (arrow) columns[index].arrows.push(arrow);
        columns[index].pokemonImages.push(pokemonCard);

        if (!next.evolvesTo.length) return;

        columns.push({arrows: [], pokemonImages: []});

        index++;

        next.evolvesTo.forEach(child => calculateNextColumn(child, index, columns, alolan, galarian));
        return;
    }

    const Evo = () => {
        if (allPokemonInChain.length === 1) return <>Pokemon does not evolve</>;
        const columns = [{arrows: [], pokemonImages: []}];
        if (!!evolutionChain.chain.evolvesTo.length) calculateNextColumn(evolutionChain.chain, 0, columns, false, false);

        const alolanFormColumns = [{arrows: [], pokemonImages: []}];
        if (!!evolutionChain.alolanChain) calculateNextColumn(evolutionChain.alolanChain, 0, alolanFormColumns, true, false);

        const galarianFormColumns = [{arrows: [], pokemonImages: []}];
        if (!!evolutionChain.galarianChain) calculateNextColumn(evolutionChain.galarianChain, 0, galarianFormColumns, false, true);

        return (
            <>
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
                <Flex justifyContent={"center"} gap={"20px"} className={"evo-chart"}>
                    {alolanFormColumns.map(c => (
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
                <Flex justifyContent={"center"} gap={"20px"} className={"evo-chart"}>
                    {galarianFormColumns.map(c => (
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
            </>

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