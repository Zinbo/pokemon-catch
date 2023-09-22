'use client'
import {Box, Grid, Heading} from "@chakra-ui/react";
import PokemonGridItem from "@/app/PokemonGridItem";
import User from "@/data/User";
import Pokemon from "@/data/Pokemon";
import Game from "@/data/Game";
import EvolutionChain from "@/data/EvolutionChain";
import {canBeAcquired, notOwnedAndCanBeBred, userOwnsPokemon} from "@/lib/PokemonService";
import Filters from "@/app/Filters";
import React, {useEffect, useMemo, useState} from "react";
import Search from "@/app/Search";

interface Props {
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

const calculateMetaDataForPokemon = (pokemon: Pokemon[], evolutionChains: EvolutionChain[], user: User | null) => {

    return pokemon.map((p) => {
        const evolutionChain = (evolutionChains.find(e => e.id === p.evolutionChainId) as EvolutionChain);
        if(user === null) return {
            ...p,
            owned: true,
            catchable: true,
            breedable: false,
            evolutionChain
        }

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
}

const MAX_POKEDEX_NUMBER = 1017;
const GENERATION_ENDS = [151, 251, 386, 493, 649, 721, 809, 905, MAX_POKEDEX_NUMBER];
const ROMAN_NUMERALS = ["I", "II", "III", "VI", "V", "VI", "VII", "VIII", "IX", "X"];

const getUser = async () => {
    const url = `users/123`;
    const response = await fetch(url);
    return await response.json();
}



export default function PokemonGrid({pokemon, evolutionChains}: Props) {
    const [filters, setFilters] = useState<Filters>({hideOwned: false, hideUncatchable: false, onlyShowBreedable: false});
    const [user, setUser] = useState<User | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const toggleCatchStatus = async (pokedexNumber: number, isOwned: boolean) => {
        const url = `users/123/pokemon/${pokedexNumber}`;
        await fetch(url, {method: isOwned ? "DELETE" : "PUT"});

        console.log("Reloading user!");
        setUser(await getUser());
    }

    useEffect(() => {
        const getData = async () => {
            setUser(await getUser());
        }
        getData();
    }, []);

    const calculatedPokemon: PokemonWithMeta[] = calculateMetaDataForPokemon(pokemon, evolutionChains, user);

    const isVisible = (p: PokemonWithMeta) => {
        if (filters.hideOwned && p.owned) return false;
        if (filters.hideUncatchable && !p.catchable) return false;
        if(filters.onlyShowBreedable && !p.breedable) return false;
        return !searchTerm || p.name.toLowerCase().startsWith(searchTerm.toLowerCase());

    }

    let generation = 0;

    const groupByGeneration: PokemonWithMeta[][] = [];
    calculatedPokemon.forEach(p => {
        if (p.pokedexNumber > GENERATION_ENDS[generation]) generation++;
        groupByGeneration[generation] = groupByGeneration[generation] ?? [];
        groupByGeneration[generation].push(p);
    })

    const Grids = () => {
        return groupByGeneration.map((pokemonInGeneration, index) => {
            return (
                <Box key={index} style={{display: pokemonInGeneration.find(isVisible) ? "block" : "none"}}>
                    <Heading>Generation {ROMAN_NUMERALS[index]}</Heading>
                    <Grid templateColumns='repeat(8, 1fr)'>
                        {pokemonInGeneration.map((p) => {
                            return <PokemonGridItem key={p.pokedexNumber} pokedexNumber={p.pokedexNumber} name={p.name}
                                                    isOwned={p.owned} canBeAcquired={p.catchable} canBeBred={p.breedable}
                                                    visible={isVisible(p)}
                                                    toggleCatchStatus={toggleCatchStatus}/>;
                        })}
                    </Grid>
                </Box>
            )
        })
    }

    return (
        <>
            <Box>
                <Search filters={filters} setFilters={setFilters} searchTerm={searchTerm} setSearchTerm={setSearchTerm}/>
            </Box>
            {Grids()}

        </>
    )
}