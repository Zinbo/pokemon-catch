import {Flex} from "@chakra-ui/react";
import PokemonGrid from "@/app/PokemonGrid";
import React from "react";
import User from "@/data/User";
import Pokemon from "@/data/Pokemon";
import EvolutionChain from "@/data/EvolutionChain";
import Game from "@/data/Game";

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

async function getUser() : Promise<User> {
    return getData('users/123');
}

async function getEvolutionChains() : Promise<EvolutionChain[]> {
    return getData('evolution-chains');
}

async function getGames() : Promise<Game[]> {
    return getData('games');
}

export default async function Home() {
    const evolutionChains = await getEvolutionChains();
    const games = await getGames();
    const pokemon = await getPokemon();

    return(
        <Flex direction={"column"} rowGap={5} style={{paddingTop: "20px"}}>
            <PokemonGrid pokemon={pokemon} games={games} evolutionChains={evolutionChains}/>
        </Flex>)
}
