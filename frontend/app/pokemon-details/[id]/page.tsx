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
    CardFooter, CardHeader,
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
import {createColumnHelper} from "@tanstack/table-core";
import User from "@/data/User";
import {ArrowForwardIcon, ExternalLinkIcon} from "@chakra-ui/icons";
import Encounters from "@/app/pokemon-details/[id]/Encounters";
import CustomTable from "@/components/CustomTable";

type EncounterRow = {
    method: string;
    location: string;
    game: string;
    condition: string;
    chance: number;
};

const data: EncounterRow[] = [
    {
        method: "Receive as gift",
        location: "Cerulean City",
        game: "Yellow",
        condition: "None",
        chance: 100
    },
    {
        method: "Walking in tall grass or a cave",
        location: "Viridian Forest",
        game: "Red",
        condition: "None",
        chance: 40
    },
];

const columnHelper = createColumnHelper<EncounterRow>();

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

    const rootStyle = {display: 'flex', justifyContent: 'center'};
    const rowStyle = {margin: '200px 0', display: 'flex', justifyContent: 'space-between'};
    const boxStyle = {padding: '10px', border: '1px solid black'};

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

    const columns = [
        columnHelper.accessor("method", {
            cell: (info) => info.getValue(),
            header: "Method"
        }),
        columnHelper.accessor("location", {
            cell: (info) => info.getValue(),
            header: "Location"
        }),
        columnHelper.accessor("game", {
            cell: (info) => info.getValue(),
            header: "Game"
        }),
        columnHelper.accessor("condition", {
            cell: (info) => info.getValue(),
            header: "Condition"
        }),
        columnHelper.accessor("chance", {
            cell: (info) => info.getValue() + "%",
            header: "Chance",
            meta: {
                isNumeric: true
            },
        })
    ];

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
                                                <Heading size='sm'>#000{pokemon.pokedexNumber}</Heading>
                                                <Heading size='xs'>Generation I</Heading>

                                                <Stack direction='row'>
                                                    <Badge colorScheme='green'>Caught</Badge>
                                                    <Badge colorScheme='red'>Can Catch</Badge>
                                                    <Badge colorScheme='purple'>Can breed</Badge>
                                                </Stack>
                                            </Box>
                                            <Divider/>
                                            <Box>
                                                <Stat>
                                                    <StatLabel>Generation 1 Completion</StatLabel>
                                                    <StatNumber>80%</StatNumber>
                                                </Stat>
                                                <Stat>
                                                    <StatLabel>Evolution Chain Completion</StatLabel>
                                                    <StatNumber>80%</StatNumber>
                                                    <Progress value={80}/>
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
                        <Encounters pokemon={pokemon} games={games}/>
                    </Box>

                    <Box>
                        <Evolutions evolutionChain={evolutionChain}/>
                    </Box>
                    {/*<Box>
                        <Card>
                            <CardHeader>
                                <Heading size='md'>Evolutions V2</Heading>
                            </CardHeader>

                            <CardBody>
                                <ArcherContainer strokeColor="red" lineStyle={"straight"}>
                                <Flex alignItems={"center"}>
                                    <Flex direction={"column"} flex={1} alignItems={"center"}>
                                        <ArcherElement
                                            id="element2"
                                            relations={[
                                                {
                                                    targetId: 'element3',
                                                    targetAnchor: 'left',
                                                    sourceAnchor: 'right',
                                                    // style: { strokeColor: 'blue', strokeWidth: 1 },
                                                    // label: <Box style={{border: "1px solid black", backgroundColor: "white" }}>Level 20 (greater attack)</Box>,
                                                    label: <Card backgroundColor={"#D3D3D3"}><CardBody padding={"10px"}>Level 20 (greater attack)</CardBody></Card>,
                                                },
                                                {
                                                    targetId: 'element4',
                                                    targetAnchor: 'left',
                                                    sourceAnchor: 'right',
                                                    style: { strokeColor: 'blue', strokeWidth: 1 },
                                                    label: <div style={{ marginTop: '-20px' }}>Level 20 (greater defense)</div>,
                                                },
                                                {
                                                    targetId: 'element5',
                                                    targetAnchor: 'left',
                                                    sourceAnchor: 'right',
                                                    style: { strokeColor: 'blue', strokeWidth: 1 },
                                                    label: <div style={{ marginTop: '-20px' }}>Level 20 (same attack and defense)</div>,
                                                },
                                            ]}
                                        >
                                            <Image src={`/images/list/236.png`} width="96" height="96" alt="pokemon"/>
                                        </ArcherElement>
                                    </Flex>
                                    <Flex direction={"column"} gap={"50px"}  flex={1} alignItems={"center"}>
                                        <ArcherElement id="element3">
                                            <Image src={`/images/list/106.png`} width="96" height="96" alt="pokemon"/>
                                        </ArcherElement>

                                        <ArcherElement id="element4">
                                            <Image src={`/images/list/107.png`} width="96" height="96" alt="pokemon"/>
                                        </ArcherElement>

                                        <ArcherElement id="element5">
                                            <Image src={`/images/list/237.png`} width="96" height="96" alt="pokemon"/>
                                        </ArcherElement>
                                    </Flex>
                                </Flex>
                                </ArcherContainer>
                            </CardBody>
                        </Card>
                    </Box>*/}
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