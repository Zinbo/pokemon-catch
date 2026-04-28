'use client'
import {Box, Grid, Text} from "@chakra-ui/react";
import PokemonGridItem from "@/app/PokemonGridItem";
import User from "@/types/User";
import Pokemon, {PokemonWithMeta} from "@/types/Pokemon";
import Game from "@/types/Game";
import EvolutionChain from "@/types/EvolutionChain";
import {calculateMetaDataForAllPokemon, isBestCatchRateInOwnedGames} from "@/lib/PokemonService";
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

    const [filters, setFilters] = useState<Filters>(() => {
        try {
            const saved = localStorage.getItem('pokemon-filters');
            return saved ? JSON.parse(saved) : {
                hideOwned: false,
                hideUncatchable: false,
                hideCatchable: false,
                hideBreedable: false,
                onlyShowBestEncounters: false
            };
        } catch {
            return {hideOwned: false, hideUncatchable: false, hideCatchable: false, hideBreedable: false, onlyShowBestEncounters: false};
        }
    });
    const [user, setUser] = useState<User | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedGame, setSelectedGame] = useState<Game | null>(() => {
        try {
            const savedId = localStorage.getItem('pokemon-selected-game');
            return savedId ? games.find(g => g.id === parseInt(savedId)) ?? null : null;
        } catch {
            return null;
        }
    });

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

    useEffect(() => {
        localStorage.setItem('pokemon-filters', JSON.stringify(filters));
    }, [filters]);

    useEffect(() => {
        if (selectedGame) {
            localStorage.setItem('pokemon-selected-game', String(selectedGame.id));
        } else {
            localStorage.removeItem('pokemon-selected-game');
        }
    }, [selectedGame]);

    const calculatedPokemon: PokemonWithMeta[] = calculateMetaDataForAllPokemon(pokemon, evolutionChains, user);

    const isVisible = (p: PokemonWithMeta) => {
        if (!filters.onlyShowBestEncounters) {
            if (filters.hideOwned && p.owned) return false;
            if (filters.hideUncatchable && !p.catchable && !p.catchAndBreed) return false;
            if (filters.hideCatchable && (p.catchable || p.catchAndBreed)) return false;
            if (filters.hideBreedable && p.breedable) return false;
        }
        if (filters.onlyShowBestEncounters && !hasBestEncounterInGame(p)) return false;
        if (!!selectedGame && !p.encounterDetails.encounters.find(e => e.location.gameId === selectedGame.id)) return false;

        const potentialNumber = parseInt(searchTerm);
        return !searchTerm || (!!potentialNumber && p.pokedexNumber === potentialNumber) || (p.name.toLowerCase().startsWith(searchTerm.toLowerCase()));

    }

    const hasBestEncounterInGame = (p: PokemonWithMeta) => {
        if (!selectedGame || !user || p.owned) return false;
        return isBestCatchRateInOwnedGames(p, selectedGame.id, user.ownedGames);
    }

    let generation = 0;

    const groupByGeneration: PokemonWithMeta[][] = [];
    calculatedPokemon.forEach(p => {
        if (p.pokedexNumber > GENERATION_ENDS[generation]) generation++;
        groupByGeneration[generation] = groupByGeneration[generation] ?? [];
        groupByGeneration[generation].push(p);
    })

    const GenerationAccordion = () => {
        return groupByGeneration.map((pokemonInGeneration, index) => {
            return (
                <PokemonAccordionItem key={index} isVisible={!!pokemonInGeneration.find(isVisible)}
                                      heading={`Generation ${ROMAN_NUMERALS[index]}`}>
                    <Grid templateColumns='repeat(8, 1fr)'>
                        {pokemonInGeneration.map((p) => {
                            return <PokemonGridItem key={p.pokedexNumber} pokedexNumber={p.pokedexNumber} name={p.name}
                                                    isOwned={p.owned} canBeAcquired={p.catchable}
                                                    canBeBred={p.breedable}
                                                    catchAndBreed={p.catchAndBreed}
                                                    hasBestCatchRate={hasBestEncounterInGame(p)}
                                                    visible={isVisible(p)}
                                                    toggleCatchStatus={toggleCatchStatus}/>;
                        })}
                    </Grid>
                </PokemonAccordionItem>
            )
        });
    }

    const hasResults = !!groupByGeneration.find(group => group.find(isVisible));

    return (
        <>
            <Box>
                <Search filters={filters} setFilters={setFilters} searchTerm={searchTerm} setSearchTerm={setSearchTerm}
                        selectedGame={selectedGame} setSelectedGame={setSelectedGame} games={games}/>
            </Box>
            {!hasResults && <Text alignSelf={"center"}>No results found - do you have any filters enabled?</Text>}
            {GenerationAccordion()}
        </>
    )
}