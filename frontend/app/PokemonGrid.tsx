'use client'
import {Box, Grid} from "@chakra-ui/react";
import PokemonGridItem from "@/app/PokemonGridItem";
import User from "@/data/User";
import Pokemon, {PokemonWithMeta} from "@/data/Pokemon";
import Game from "@/data/Game";
import EvolutionChain from "@/data/EvolutionChain";
import {calculateMetaDataForAllPokemon} from "@/lib/PokemonService";
import Filters from "@/app/Filters";
import React, {useEffect, useState} from "react";
import Search from "@/app/Search";
import PokemonAccordionItem from "@/app/PokemonAccordionItem";

interface Props {
    pokemon: Pokemon[]
    games: Game[]
    evolutionChains: EvolutionChain[]
}

const MAX_POKEDEX_NUMBER = 1017;
const GENERATION_ENDS = [151, 251, 386, 493, 649, 721, 809, 905, MAX_POKEDEX_NUMBER];
const ROMAN_NUMERALS = ["I", "II", "III", "VI", "V", "VI", "VII", "VIII", "IX", "X"];

const getUser = async () => {
    const url = `users/123`;
    const response = await fetch(url);
    return await response.json();
}


export default function PokemonGrid({pokemon, evolutionChains, games}: Props) {
    const [filters, setFilters] = useState<Filters>({
        hideOwned: false,
        hideUncatchable: false,
        onlyShowBreedable: false,
        onlyShowBestEncounters: false
    });
    const [user, setUser] = useState<User | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedGame, setSelectedGame] = useState<Game | null>(null);

    const toggleCatchStatus = async (pokedexNumber: number, isOwned: boolean) => {
        const url = `users/123/pokemon/${pokedexNumber}`;
        await fetch(url, {method: isOwned ? "DELETE" : "PUT"});
        setUser(await getUser());
    }

    useEffect(() => {
        const getData = async () => {
            setUser(await getUser());
        }
        getData();
    }, []);

    const calculatedPokemon: PokemonWithMeta[] = calculateMetaDataForAllPokemon(pokemon, evolutionChains, user);

    const isVisible = (p: PokemonWithMeta) => {
        if (filters.hideOwned && p.owned) return false;
        if (filters.hideUncatchable && !p.catchable) return false;
        if (filters.onlyShowBreedable && !p.breedable) return false;
        if (filters.onlyShowBestEncounters && !hasBestEncounterInGame(p)) return false;
        if (!!selectedGame && !p.encounterDetails.encounters.find(e => e.location.gameId === selectedGame.id)) return false;

        const potentialNumber = parseInt(searchTerm);
        return !searchTerm || (!!potentialNumber && p.pokedexNumber === potentialNumber) || (p.name.toLowerCase().startsWith(searchTerm.toLowerCase()));

    }

    const hasBestEncounterInGame = (p: PokemonWithMeta) => {
        if (!selectedGame) return false;
        if (p.owned) return false;
        return !!p.encounterDetails.encounters.find(e => e.location.gameId === selectedGame.id && p.encounterDetails.bestCatchRate === e.catchRate);
    }

    let generation = 0;

    const groupByGeneration: PokemonWithMeta[][] = [];
    calculatedPokemon.forEach(p => {
        if (p.pokedexNumber > GENERATION_ENDS[generation]) generation++;
        groupByGeneration[generation] = groupByGeneration[generation] ?? [];
        groupByGeneration[generation].push(p);
    })

    const Accordion = () => {
        return groupByGeneration.map((pokemonInGeneration, index) => {
            return (
                <PokemonAccordionItem key={index} isVisible={!!pokemonInGeneration.find(isVisible)} heading={`Generation ${ROMAN_NUMERALS[index]}`}>
                    <Grid templateColumns='repeat(8, 1fr)'>
                        {pokemonInGeneration.map((p) => {
                            return <PokemonGridItem key={p.pokedexNumber} pokedexNumber={p.pokedexNumber} name={p.name}
                                                    isOwned={p.owned} canBeAcquired={p.catchable}
                                                    canBeBred={p.breedable}
                                                    hasBestCatchRate={hasBestEncounterInGame(p)}
                                                    visible={isVisible(p)}
                                                    toggleCatchStatus={toggleCatchStatus}/>;
                        })}
                    </Grid>
                </PokemonAccordionItem>
            )
        })
    }
    return (
        <>
            <Box>
                <Search filters={filters} setFilters={setFilters} searchTerm={searchTerm} setSearchTerm={setSearchTerm}
                        selectedGame={selectedGame} setSelectedGame={setSelectedGame} games={games}/>
            </Box>
            {Accordion()}
        </>
    )
}