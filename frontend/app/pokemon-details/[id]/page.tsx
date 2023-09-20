'use client'

import {
    Badge,
    Box,
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    Button,
    Card,
    CardBody,
    CardFooter,
    Divider,
    Flex,
    Heading,
    Progress,
    Stack,
    Stat,
    StatLabel,
    StatNumber
} from "@chakra-ui/react";
import Image from "next/image";
import Evolutions from "@/app/pokemon-details/[id]/Evolutions";
import Breeding from "@/app/pokemon-details/[id]/Breeding";
import React, {useEffect, useState} from "react";
import User from "@/data/User";
import {ArrowBackIcon, ArrowForwardIcon, ExternalLinkIcon} from "@chakra-ui/icons";
import Link from "next/link";
import {canBeBred, calculateChainCompletion, canCatch} from "@/lib/PokemonService";
import useSWR from "swr";
import Pokemon from "@/data/Pokemon";
import Game from "@/data/Game";
import Encounters from "@/app/pokemon-details/[id]/Encounters";
import EvolutionChain from "@/data/EvolutionChain";

const MAX_POKEDEX_NUMBER = 1017;
const GENERATION_ENDS = [151, 251, 386, 493, 649, 721, 809, 905, MAX_POKEDEX_NUMBER];
const ROMAN_NUMERALS = ["I", "II", "III", "VI", "V", "VI", "VII", "VIII", "IX", "X"];

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function Page({params}: {
    params: {
        id: number
    }
}) {
    const userResponse = useSWR<User, any>(`/users/123`, fetcher);
    const pokemonResponse = useSWR<Pokemon, any>(`/pokemon/${params.id}`, fetcher);
    const evolutionChainResponse = useSWR<EvolutionChain, any>(`/evolution-chains/${pokemonResponse.data?.pokedexNumber}`, fetcher);
    const gamesResponse = useSWR<Game[], any>(`/games`, fetcher);

    const getFormattedPokedexNumber = (pokemon: Pokemon) => {
        const number = pokemon.pokedexNumber;
        const length = number.toString().length;
        let formattedNumber = "#";
        [...Array(4 - length)].forEach(_ => formattedNumber += "0");
        formattedNumber += number;
        return formattedNumber;
    }

    const getGenerationRomanNumeral = (pokemon: Pokemon) => {
        const number = pokemon.pokedexNumber  || 0;
        let found = false;
        let generationIndex = 0;
        while (!found) {
            if (number <= GENERATION_ENDS[generationIndex]) found = true;
            else generationIndex++;
        }
        return ROMAN_NUMERALS[generationIndex];
    }

    const getChainCompletionPercentage = (evolutionChain : EvolutionChain, user : User) => {
        const result = calculateChainCompletion(evolutionChain, user);
        return `${((result.noCaught / result.noInChain) * 100).toFixed(2)}%`;
    }

    const Badges = ({pokemon, evolutionChain, user} : {pokemon: Pokemon, evolutionChain: EvolutionChain, user : User}) => {
        const badges: React.JSX.Element[] = [];
        if (user?.ownedPokemon.includes(pokemon.pokedexNumber)) badges.push(<Badge colorScheme='green'>Caught</Badge>)
        else badges.push(<Badge colorScheme='gray'>Not caught</Badge>)

        if (canCatch(pokemon, user?.ownedGames)) badges.push(<Badge colorScheme='green'>Can catch</Badge>)
        else badges.push(<Badge colorScheme='gray'>Can't catch</Badge>)

        if (canBeBred(evolutionChain, user)) badges.push(<Badge colorScheme='green'>Can breed</Badge>)
        else badges.push(<Badge colorScheme='gray'>Can't breed</Badge>)

        return (
            <Stack direction='row'>
                {badges}
            </Stack>
        )
    }

    const Page = () => {
        if (pokemonResponse.isLoading || userResponse.isLoading || evolutionChainResponse.isLoading || gamesResponse.isLoading) return <>Loading!</>;
        else if(!pokemonResponse.data || !userResponse.data || !evolutionChainResponse.data || !gamesResponse.data) return <>Error!</>;
        const pokemon = pokemonResponse.data;
        const evolutionChain = evolutionChainResponse.data;
        const user = userResponse.data;
        const games = gamesResponse.data;

        return (
            <Flex direction={"column"} style={{paddingTop: "20px", paddingBottom: "20px"}}>
                <Breadcrumb>
                    <BreadcrumbItem>
                        <BreadcrumbLink href='/'>Home</BreadcrumbLink>
                    </BreadcrumbItem>

                    <BreadcrumbItem isCurrentPage>
                        <BreadcrumbLink href='#'>{pokemon.name}</BreadcrumbLink>
                    </BreadcrumbItem>
                </Breadcrumb>
                <Stack spacing='4'>
                    <Card backgroundColor={"#5dbe62"}>
                        <CardBody>
                            <Flex justifyContent={"space-between"}>
                                <Card>
                                    <CardBody>
                                        <Stack spacing='4'>
                                            <Box>
                                                <Heading size='xl'>{pokemon.name}</Heading>
                                                <Heading size='sm'>{getFormattedPokedexNumber(pokemon)}</Heading>
                                                <Heading size='xs'>Generation {getGenerationRomanNumeral(pokemon)}</Heading>

                                                <Badges pokemon={pokemon} evolutionChain={evolutionChain} user={user}/>
                                            </Box>
                                            <Divider/>
                                            <Box>
                                                <Stat>
                                                    <StatLabel>Evolution Chain Completion</StatLabel>
                                                    <StatNumber>{getChainCompletionPercentage(evolutionChain, user)}</StatNumber>
                                                </Stat>
                                                <Stat>
                                                    <StatLabel>Added to collection</StatLabel>
                                                    <StatNumber>2023-08-01</StatNumber>
                                                </Stat>
                                            </Box>
                                        </Stack>
                                    </CardBody>
                                    <Divider/>
                                    <CardFooter>
                                        <Flex gap={"10px"}>
                                            <Button rightIcon={<ExternalLinkIcon/>}>
                                                <Link
                                                    href={`https://www.serebii.net/pokedex-swsh/${pokemon.name.toLowerCase()}/`}
                                                    target={"_blank"}>Serebii</Link>
                                            </Button>
                                            <Button rightIcon={<ExternalLinkIcon/>}>
                                                <Link
                                                    href={`https://bulbapedia.bulbagarden.net/wiki/${pokemon.name}_(Pok%C3%A9mon)`}
                                                    target={"_blank"}>Bulbapedia</Link>
                                            </Button>
                                        </Flex>
                                    </CardFooter>

                                </Card>
                                <Image src={`/images/description/${params.id}.png`} width="434" height="434"
                                       alt="pokemon"/>
                            </Flex>
                        </CardBody>
                    </Card>

                    <Box>
                        <Encounters pokemon={pokemonResponse.data} games={games} user={user}/>
                    </Box>

                    <Box>
                        <Evolutions evolutionChain={evolutionChain}/>
                    </Box>
                    <Box>
                        <Breeding user={user} pokemon={pokemon} evolutionChain={evolutionChain}/>
                    </Box>
                    <Flex justifyContent={"space-between"}>
                        {pokemon.pokedexNumber > 1 &&
                            (<Flex justifyContent={"start"} flex={1}>
                                <Link href={`/pokemon-details/${pokemon.pokedexNumber - 1}`}>
                                    <Button colorScheme='teal' variant='outline'>
                                        <ArrowBackIcon/>
                                    </Button>
                                </Link>
                            </Flex>)
                        }
                        {pokemon.pokedexNumber < MAX_POKEDEX_NUMBER &&
                            (<Flex justifyContent={"end"} flex={1}>
                                <Link href={`/pokemon-details/${pokemon.pokedexNumber + 1}`}>
                                    <Button colorScheme='teal' variant='outline'>
                                        <ArrowForwardIcon/>
                                    </Button>
                                </Link>
                            </Flex>)
                        }
                    </Flex>
                </Stack>


            </Flex>);
    }

    return <Page/>
}