'use client'
import {Box, Grid, Heading} from "@chakra-ui/react";
import PokemonGridItem from "@/app/PokemonGridItem";
import User from "@/data/User";
import Pokemon from "@/data/Pokemon";
import Game from "@/data/Game";
import EvolutionChain from "@/data/EvolutionChain";
import {canBeAcquired, notOwnedAndCanBeBred, userOwnsPokemon} from "@/lib/PokemonService";
import Filters from "@/app/Filters";
import React, {useMemo, useState} from "react";
import Search from "@/app/Search";

interface Props {
    user: User
    pokemon: Pokemon[]
    games: Game[]
    evolutionChains: EvolutionChain[]
}

interface PokemonWithMeta extends Pokemon {
    owned: boolean
    catchable: boolean
    breedable: boolean
    evolutionChain: EvolutionChain
}

const MAX_POKEDEX_NUMBER = 1017;
const GENERATION_ENDS = [151, 251, 386, 493, 649, 721, 809, 905, MAX_POKEDEX_NUMBER];
const ROMAN_NUMERALS = ["I", "II", "III", "VI", "V", "VI", "VII", "VIII", "IX", "X"];

export default function PokemonGrid({user, pokemon, evolutionChains}: Props) {
    const [filters, setFilters] = useState<Filters>({hideOwned: false, hideUncatchable: false, onlyShowBreedable: false});

    const calculatedPokemon: PokemonWithMeta[] = useMemo(() => {
        return pokemon.map((p) => {
            const evolutionChain = (evolutionChains.find(e => e.id === p.evolutionChainId) as EvolutionChain);
            const owned = userOwnsPokemon(p.pokedexNumber, user);
            const catchable = canBeAcquired(p, evolutionChain, user);
            const breedable = notOwnedAndCanBeBred(p, evolutionChain, user);
            return {
                ...p,
                owned,
                catchable,
                breedable,
                evolutionChain
            };
        });
    }, [pokemon.length, user.id]);

    const isVisible = (p: PokemonWithMeta) => {
        if (filters.hideOwned && p.owned) return false;
        if (filters.hideUncatchable && !p.catchable) return false;
        return !(filters.onlyShowBreedable && !p.breedable);
    }

    let generation = 0;

    const groupByGeneration: PokemonWithMeta[][] = Array(GENERATION_ENDS.length).fill([]);
    calculatedPokemon.forEach(p => {
        if (p.pokedexNumber > GENERATION_ENDS[generation]) generation++;
        groupByGeneration[generation].push(p);
    })

    return (
        <>
            <Box>
                <Search filters={filters} setFilters={setFilters}/>
            </Box>
            {
                    groupByGeneration.map((pokemonInGeneration, index) => (
                        <Box>
                            <Heading>Generation {ROMAN_NUMERALS[index]}</Heading>
                            <Grid templateColumns='repeat(8, 1fr)'>
                                {pokemonInGeneration.map((p) => {
                                    return <PokemonGridItem key={p.pokedexNumber} pokedexNumber={p.pokedexNumber} name={p.name}
                                                            isOwned={p.owned} canBeAcquired={p.catchable} canBeBred={p.breedable}
                                                            visible={isVisible(p)}/>;
                                })}
                            </Grid>
                        </Box>
                    ))
                }

        </>
    )
}