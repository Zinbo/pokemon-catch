import {Flex} from "@chakra-ui/react";
import React from "react";
import Pokemon from "@/types/Pokemon";
import EvolutionChain from "@/types/EvolutionChain";
import allGames from "@/data/games.json"
import PlanPage from "@/app/plan/PlanPage";

async function getData(path: string) {
    const res = await fetch(`http://localhost:8080/${path}`, {cache: 'no-store'})
    if (!res.ok) throw new Error('Failed to fetch data')
    return res.json();
}

async function getPokemon(): Promise<Pokemon[]> {
    return getData('pokemon');
}

async function getEvolutionChains(): Promise<EvolutionChain[]> {
    return getData('evolution-chains');
}

export default async function Plan() {
    const evolutionChains = await getEvolutionChains();
    const pokemon = (await getPokemon()).sort((a, b) => a.pokedexNumber - b.pokedexNumber);

    return (
        <Flex direction="column" rowGap={5} style={{paddingTop: "20px"}}>
            <PlanPage pokemon={pokemon} evolutionChains={evolutionChains}/>
        </Flex>
    )
}
