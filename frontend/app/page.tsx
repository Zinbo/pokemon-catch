import {Flex} from "@chakra-ui/react";
import PokemonGrid from "@/app/PokemonGrid";
import React from "react";
import Pokemon from "@/data/Pokemon";
import EvolutionChain from "@/data/EvolutionChain";
import games from "@/data/games.json"

async function getData(path: string) {
    const res = await fetch(`http://localhost:8080/${path}`)
    if (!res.ok) {
        // This will activate the closest `error.js` Error Boundary
        throw new Error('Failed to fetch data')
    }

    return res.json();
}

async function getPokemon() : Promise<Pokemon[]> {
    return getData('pokemon');
}

async function getEvolutionChains() : Promise<EvolutionChain[]> {
    return getData('evolution-chains');
}

export default async function Home() {
    const evolutionChains = await getEvolutionChains();
    const pokemon = await getPokemon();

    return(
        <Flex direction={"column"} rowGap={5} style={{paddingTop: "20px"}}>
            <PokemonGrid pokemon={pokemon} games={games} evolutionChains={evolutionChains}/>
        </Flex>)
}
