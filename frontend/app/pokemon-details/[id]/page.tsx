import React from "react";
import User from "@/data/User";
import Pokemon from "@/data/Pokemon";
import Game from "@/data/Game";
import EvolutionChain, {EvolvesTo} from "@/data/EvolutionChain";
import Parent from "@/app/pokemon-details/[id]/Parent";

async function getData(path: string) {
    const res = await fetch(`http://localhost:8080/${path}`)
    if (!res.ok) {
        // This will activate the closest `error.js` Error Boundary
        throw new Error('Failed to fetch data')
    }

    return res.json();
}

async function getPokemon(id: number) : Promise<Pokemon> {
    return getData(`pokemon/${id}`);
}

function getAllIdsInChain(next : EvolvesTo) {
    let calculation = [next.pokedexNumber]
    if(!next?.evolvesTo?.length) {
        return calculation;
    }
    next.evolvesTo.forEach(e => {
        const childResults = getAllIdsInChain(e);
        calculation.push(...childResults);
    })

    return calculation;
}

async function getAllPokemonInChain(evolutionChain: EvolutionChain) : Promise<Pokemon[]> {
    const ids = getAllIdsInChain(evolutionChain.chain);
    const promises = ids.map(id => getData(`pokemon/${id}`));
    return Promise.all(promises);
}

async function getEvolutionChain(id: number) : Promise<EvolutionChain> {
    return getData(`evolution-chains/${id}`);
}

async function getGames() : Promise<Game[]> {
    return getData('games');
}


export default async function Page({params}: {
    params: {
        id: number
    }
}) {
    const pokemon = await getPokemon(params.id);
    const evolutionChain = await getEvolutionChain(pokemon.evolutionChainId);
    const allPokemonInChain = await getAllPokemonInChain(evolutionChain);
    const games = await getGames();

    return <Parent games={games} pokemon={pokemon} evolutionChain={evolutionChain} allPokemonInChain={allPokemonInChain}/>
}