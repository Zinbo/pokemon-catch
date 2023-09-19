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
import Evolutions, {calculateChainCompletion} from "@/app/pokemon-details/[id]/Evolutions";
import Breeding, {canBeBred} from "@/app/pokemon-details/[id]/Breeding";
import React, {useEffect, useState} from "react";
import User from "@/data/User";
import {ArrowForwardIcon, ExternalLinkIcon} from "@chakra-ui/icons";
import Encounters, {canCatch} from "@/app/pokemon-details/[id]/Encounters";

const GENERATION_ENDS = [151, 251, 386, 493, 649, 721, 809, 905, 1017];
const ROMAN_NUMERALS = ["I", "II", "III", "VI", "V", "VI", "VII", "VIII", "IX", "X"];

export default function Page({params}: {
    params: {
        id: number
    }
}) {
    const [user, setUser] = useState<null | User>(null);
    const [pokemon, setPokemon] = useState(null);
    const [games, setGames] = useState([]);
    const [evolutionChain, setEvolutionChain] = useState(null);
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(true);

    const getUserDetails = async () => {
        const res = await fetch(`/users/123`);
        if (res.ok) {
            setUser(await res.json());
        } else {
            setError(true);
        }
    }

    const getPokemon = async () => {
        const res = await fetch(`/pokemon/${params.id}`);
        if (res.ok) {
            const pokemon = await res.json();
            setPokemon(pokemon);
            return pokemon;
        } else {
            setError(true);
        }
    }

    const getEvolutionChain = async (id: number) => {
        const res = await fetch(`/evolution-chains/${id}`);
        if (res.ok) {
            setEvolutionChain(await res.json());
        } else {
            setError(true);
        }
    }

    const getGames = async () => {
        const res = await fetch('/games');
        if (res.ok) {
            setGames(await res.json());
        } else {
            setError(true);
        }

    }

    useEffect(() => {
        async function fetchData() {
            const promise = getPokemon().then(p => getEvolutionChain(p.evolutionChainId));
            await Promise.all([getUserDetails(), promise, getGames()]);
            setLoading(false);
        }

        fetchData();
    }, [])

    const getFormattedPokedexNumber = () => {
        const number = pokemon.pokedexNumber;
        const length = number.toString().length;
        let formattedNumber = "#";
        [ ...Array(4-length) ].forEach(_ => formattedNumber += "0");
        formattedNumber += number;
        return formattedNumber;
    }

    const getGenerationRomanNumeral = () => {
        const number = pokemon.pokedexNumber;
        let found = false;
        let generationIndex = 0;
        while(!found) {
            if(number <= GENERATION_ENDS[generationIndex]) found = true;
            else generationIndex++;
        }
        return ROMAN_NUMERALS[generationIndex];
    }

    const getChainCompletionPercentage = () => {
        const result = calculateChainCompletion(evolutionChain, user);
        return `${((result.noCaught/result.noInChain)*100).toFixed(2)}%`;
    }

    const Badges = () => {
        const badges : React.JSX.Element[] = [];
        if(user?.ownedPokemon.includes(pokemon.pokedexNumber)) badges.push(<Badge colorScheme='green'>Caught</Badge>)
        else badges.push(<Badge colorScheme='gray'>Not caught</Badge>)

        if(canCatch(pokemon, user?.ownedGames)) badges.push(<Badge colorScheme='green'>Can catch</Badge>)
        else badges.push(<Badge colorScheme='gray'>Can't catch</Badge>)

        if(canBeBred(evolutionChain, user)) badges.push(<Badge colorScheme='green'>Can breed</Badge>)
        else badges.push(<Badge colorScheme='gray'>Can't breed</Badge>)

        return (
            <Stack direction='row'>
                {badges}
            </Stack>
        )
    }

    const Page = () => {
        if (loading) return <></>;
        else return (
            <Flex direction={"column"} style={{paddingTop: "20px", paddingBottom: "20px"}}>
                <Breadcrumb>
                    <BreadcrumbItem>
                        <BreadcrumbLink href='/'>Home</BreadcrumbLink>
                    </BreadcrumbItem>

                    <BreadcrumbItem isCurrentPage>
                        <BreadcrumbLink href='#'>Bulbasaur</BreadcrumbLink>
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
                                                <Heading size='sm'>{getFormattedPokedexNumber()}</Heading>
                                                <Heading size='xs'>Generation {getGenerationRomanNumeral()}</Heading>

                                                <Badges/>
                                            </Box>
                                            <Divider/>
                                            <Box>
                                                <Stat>
                                                    <StatLabel>Evolution Chain Completion</StatLabel>
                                                    <StatNumber>{getChainCompletionPercentage()}</StatNumber>
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
                                                Serebii
                                            </Button>
                                            <Button rightIcon={<ExternalLinkIcon/>}>
                                                Bulbapedia
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
                        <Encounters pokemon={pokemon} games={games} user={user}/>
                    </Box>

                    <Box>
                        <Evolutions evolutionChain={evolutionChain}/>
                    </Box>
                    <Box>
                        <Breeding user={user} pokemon={pokemon} evolutionChain={evolutionChain}/>
                    </Box>
                    <Flex justifyContent={"flex-end"}>
                        <Button rightIcon={<ArrowForwardIcon/>} colorScheme='teal' variant='outline'>
                            Ivysaur
                        </Button>
                    </Flex>
                </Stack>


            </Flex>);
    }

    return <Page/>
}