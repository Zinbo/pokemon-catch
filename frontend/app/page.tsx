import {Flex} from "@chakra-ui/react";
import PokemonGrid from "@/app/PokemonGrid";
import React from "react";
import Pokemon from "@/types/Pokemon";
import EvolutionChain from "@/types/EvolutionChain";
import games from "@/data/games.json"

async function getData(path: string) {
    const res = await fetch(`http://localhost:8080/${path}`, { cache: 'no-store' })
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
    const pokemon = (await getPokemon()).sort((a, b) => a.pokedexNumber - b.pokedexNumber);
    console.log(`Found ${pokemon.length} pokemon`)

    return(
        <Flex direction={"column"} rowGap={5} style={{paddingTop: "20px"}}>
            <PokemonGrid pokemon={pokemon} games={games} evolutionChains={evolutionChains}/>
        </Flex>)
}
