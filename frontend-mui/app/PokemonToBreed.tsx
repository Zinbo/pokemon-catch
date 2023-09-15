import {Typography} from "@mui/material";
import React from "react";
import User from "@/data/User";
import Pokemon from "@/data/Pokemon";
import Game from "@/data/Game";
import EvolutionChain from "@/data/EvolutionChain";

interface Props {
    user: User
    pokemon: Pokemon[]
    games: Game[]
    evolutionChains: EvolutionChain[];
}

interface BreedablePokemon {
    pokemonToBreed: Pokemon;
    pokemonToBreedFrom: Pokemon;
    extraSteps : string[];
}

export default function PokemonToBreed({pokemon, evolutionChains, user}: Props) {

    const pokemonNotOwned = pokemon.filter(p => !user.ownedPokemon.includes(p.pokedexNumber));
    const evolutionChainById = evolutionChains.reduce((map : {[id: string]: EvolutionChain}, e) => {
        map[e.id] = e;
        return map
    }, {});
    const pokemonById = pokemon.reduce((map : {[id: string]: Pokemon}, p) => {
        map[p.pokedexNumber] = p;
        return map
    }, {});

    const getPokemonToBeBred = () => {
        const breedable = pokemonNotOwned.filter(p => !!p.evolutionChainId);
        const breedingList: BreedablePokemon[] = [];
        breedable.forEach(p => {
            const chain = evolutionChainById[p.evolutionChainId];
            const ownedPokemonToBreedFrom = user.ownedPokemon.find(o => chain.allPokemonInChain.includes(o));
            if(!ownedPokemonToBreedFrom) return;

            const pokemonToBreedFrom = pokemon.find(pokemon => pokemon.pokedexNumber === ownedPokemonToBreedFrom);
            if(!pokemonToBreedFrom) return;
            const pokemonToBreed = p;

            const extraSteps = calculateSteps(pokemonToBreed, pokemonToBreedFrom, chain);

            breedingList.push({pokemonToBreedFrom, pokemonToBreed, extraSteps});
        })
        return breedingList;
    }

    const calculateSteps = (pokemonToBreed: Pokemon, pokemonToBreedFrom: Pokemon, chain: EvolutionChain) => {
        const extraSteps: string[] = [];
        if(chain.evolutions[0].from === pokemonToBreed.pokedexNumber) return extraSteps;
        let index = chain.evolutions.length-1;
        let evolution = chain.evolutions[index];
        let next = pokemonToBreed.pokedexNumber;
        while(index >= 0) {
            if(evolution.to !== next) {
                index--;
                evolution = chain.evolutions[index];
                continue;
            }
            const firstStage = pokemonById[evolution.from];
            const secondStage = pokemonById[evolution.to];
            const ways = evolution.waysToEvolve.map(way => `Trigger: ${way.trigger},  Conditions: [${way.triggerCriteria.map(c => `${c.type}: ${c.value}`).join(", ")}]`).join(" OR ");
            extraSteps.push(`${firstStage.name} -> ${secondStage.name}, by: ${ways}`);

            next = firstStage.pokedexNumber;
            index--;
            evolution = chain.evolutions[index];
        }
        extraSteps.reverse();
        return extraSteps;
    }

    return (
        <>
            <Typography variant="h2">Pokemon To Breed</Typography>
            <ul>
                {getPokemonToBeBred().map(b => {
                    return <li>{`${b.pokemonToBreed.name} (Breed from ${b.pokemonToBreedFrom.name})${b.extraSteps?.length > 0 ? `Steps: ${b.extraSteps.map((step, index) => `Step ${index+1}: ${step}`)}` : ""}`}</li>
                })}
            </ul>
        </>
    )
}