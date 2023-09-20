'use client'
import {Box, Flex, Heading, Text} from "@chakra-ui/react";
import Search from "@/app/Search";
import PokemonGrid from "@/app/PokemonGrid";
import React, {useState} from "react";
import User from "@/data/User";
import useSWR from "swr";
import Pokemon from "@/data/Pokemon";
import EvolutionChain from "@/data/EvolutionChain";
import Game from "@/data/Game";
import Filters from "@/app/Filters";

const fetcher = (url: string) => fetch(url).then(r => r.json())
const MAX_POKEDEX_NUMBER = 1017;
const GENERATION_ENDS = [151, 251, 386, 493, 649, 721, 809, 905, MAX_POKEDEX_NUMBER];
const ROMAN_NUMERALS = ["I", "II", "III", "VI", "V", "VI", "VII", "VIII", "IX", "X"];

export default function Home() {
    const userResponse = useSWR<User, any>(`/users/123`, fetcher);
    const pokemonResponse = useSWR<Pokemon[], any>(`/pokemon`, fetcher);
    const evolutionChainsResponse = useSWR<EvolutionChain[], any>(`/evolution-chains`, fetcher);
    const gamesResponse = useSWR<Game[], any>(`/games`, fetcher);
    const [filters, setFilters] = useState<Filters>({hideOwned: false, hideUncatchable: false, onlyShowBreedable: false});



    const groupBy = <T, K extends keyof any>(arr: T[], key: (i: T) => K) =>
        arr.reduce((groups, item) => {
            (groups[key(item)] ||= []).push(item);
            return groups;
        }, {} as Record<K, T[]>);

    const Render = () => {
        if (pokemonResponse.isLoading || userResponse.isLoading || evolutionChainsResponse.isLoading || gamesResponse.isLoading) return <>Loading!</>;
        else if(!pokemonResponse.data || !userResponse.data || !evolutionChainsResponse.data || !gamesResponse.data) return <>Error!</>;
        const pokemon = pokemonResponse.data;
        const evolutionChains = evolutionChainsResponse.data;
        const user = userResponse.data;
        const games = gamesResponse.data;

        let generation = 0;
        const groupByGeneration = pokemon.reduce((group: any, p: Pokemon) => {
            if(p.pokedexNumber > GENERATION_ENDS[generation]) generation++;
            group[generation] = group[generation] ?? [];
            group[generation].push(p);
            return group;
        }, {});


        return (
            <Flex direction={"column"} rowGap={5} style={{paddingTop: "20px"}}>
                <Search filters={filters} setFilters={setFilters}/>
                {
                    Object.keys(groupByGeneration).map(key => (
                        <Box>
                            <Heading>Generation {ROMAN_NUMERALS[key]}</Heading>
                            <PokemonGrid pokemon={groupByGeneration[key]} games={games} user={user} evolutionChains={evolutionChains} filters={filters}/>
                        </Box>
                    ))
                }
            </Flex>
        )
    }

    return <Render/>
}
