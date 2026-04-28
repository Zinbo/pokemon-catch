'use client'

import {Badge, Box, Center, Checkbox, Divider, Flex, Heading, Spinner, Text} from "@chakra-ui/react";
import React, {useEffect, useState} from "react";
import Pokemon, {Encounter, PokemonWithMeta} from "@/types/Pokemon";
import EvolutionChain from "@/types/EvolutionChain";
import User from "@/types/User";
import {calculateMetaDataForAllPokemon, isBestCatchRateInOwnedGames} from "@/lib/PokemonService";
import PokemonImage from "@/app/PokemonImage";
import PokemonAccordionItem from "@/app/PokemonAccordionItem";
import Breeding from "@/app/pokemon-details/[id]/Breeding";
import CatchAndBreed from "@/app/pokemon-details/[id]/CatchAndBreed";

interface Props {
    pokemon: Pokemon[]
    evolutionChains: EvolutionChain[]
}

const getUser = async (): Promise<User> => {
    const response = await fetch('users/123');
    return response.json();
}

export default function PlanPage({pokemon, evolutionChains}: Props) {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        getUser().then(setUser);
    }, []);

    const markAsOwned = async (pokedexNumber: number) => {
        await fetch(`users/123/pokemon/${pokedexNumber}`, {method: 'PUT'});
        setUser(await getUser());
    }

    if (!user) return <Center py={10}><Spinner size="xl"/></Center>;

    const calculatedPokemon = calculateMetaDataForAllPokemon(pokemon, evolutionChains, user);

    const getEvolutionChain = (chainId: number) =>
        evolutionChains.find(e => e.id === chainId)!;

    const getChainPokemon = (chainId: number): PokemonWithMeta[] =>
        calculatedPokemon.filter(p => p.evolutionChainId === chainId);

    const gameEncountersFor = (p: PokemonWithMeta, gameId: number): Encounter[] =>
        p.encounterDetails.encounters
            .filter(e => e.location.gameId === gameId)
            .sort((a, b) => b.catchRate - a.catchRate);

    const isBestInGame = (p: PokemonWithMeta, gameId: number): boolean =>
        isBestCatchRateInOwnedGames(p, gameId, user.ownedGames);

    // Section 1: Breedable
    const toBreed = calculatedPokemon.filter(p => p.breedable && !p.owned);

    // Section 3: Catch-and-breed
    const toCatchAndBreed = calculatedPokemon.filter(p => p.catchAndBreed && !p.owned);

    // Section 4: Unobtainable (GTS)
    const unobtainable = calculatedPokemon.filter(
        p => !p.owned && !p.catchable && !p.catchAndBreed && !p.breedable
    );

    const EncounterDetails = ({encounters}: {encounters: Encounter[]}) => (
        <Box ml={14} mt={1}>
            {encounters.map((enc, i) => (
                <Flex key={i} gap={2} fontSize="sm" color="gray.500" flexWrap="wrap" align="center">
                    <Text>{enc.location.name}</Text>
                    <Text>·</Text>
                    <Text textTransform="capitalize">{enc.method.replace(/-/g, ' ')}</Text>
                    {enc.conditions.length > 0 && (
                        <><Text>·</Text><Text>{enc.conditions.join(', ')}</Text></>
                    )}
                    <Text>·</Text>
                    <Badge colorScheme="green">{enc.catchRate}% catch rate</Badge>
                </Flex>
            ))}
        </Box>
    );

    const PokemonRow = ({p, encounters}: {p: PokemonWithMeta, encounters?: Encounter[]}) => (
        <Box py={2}>
            <Flex align="center" gap={3}>
                <Checkbox onChange={() => markAsOwned(p.pokedexNumber)}/>
                <PokemonImage pokedexNumber={p.pokedexNumber} name={p.name} isOwned={p.owned}
                              canBeAcquired={p.catchable}/>
                <Text fontWeight="medium">
                    #{String(p.pokedexNumber).padStart(4, '0')} {p.name}
                </Text>
            </Flex>
            {encounters && encounters.length > 0 && <EncounterDetails encounters={encounters}/>}
        </Box>
    );

    return (
        <Flex direction="column" gap={10} pb={10}>
            <Heading size="xl">Your Pokémon Catch Plan</Heading>

            {/* Section 1: Breed */}
            <PokemonAccordionItem isVisible={toBreed.length > 0} heading="Pokémon to Breed" headingSize="lg">
                <Flex direction="column" gap={6} mt={4}>
                    {toBreed.map(p => (
                        <Box key={p.pokedexNumber} borderWidth={1} borderRadius="md" p={4}>
                            <PokemonRow p={p}/>
                            <Box mt={2}>
                                <Breeding
                                    user={user}
                                    pokemon={p}
                                    evolutionChain={getEvolutionChain(p.evolutionChainId)}
                                    allPokemonInChain={getChainPokemon(p.evolutionChainId)}
                                />
                            </Box>
                        </Box>
                    ))}
                </Flex>
            </PokemonAccordionItem>

            {/* Section 2: Per owned game */}
            {user.ownedGames.map(game => {
                const bestInGame = calculatedPokemon.filter(p =>
                    !p.owned && !p.breedable &&
                    gameEncountersFor(p, game.id).length > 0 &&
                    isBestInGame(p, game.id)
                );
                const otherInGame = calculatedPokemon.filter(p =>
                    !p.owned && !p.breedable &&
                    gameEncountersFor(p, game.id).length > 0 &&
                    !isBestInGame(p, game.id)
                );
                if (bestInGame.length === 0 && otherInGame.length === 0) return null;

                return (
                    <PokemonAccordionItem key={game.id} isVisible={true} heading={game.name} headingSize="lg">
                        <Flex direction="column" gap={3} mt={4}>
                            <PokemonAccordionItem isVisible={bestInGame.length > 0}
                                                  heading="Best Encounter Rate">
                                <Flex direction="column">
                                    {bestInGame.map((p, i) => (
                                        <Box key={p.pokedexNumber}>
                                            {i > 0 && <Divider/>}
                                            <PokemonRow p={p} encounters={gameEncountersFor(p, game.id)}/>
                                        </Box>
                                    ))}
                                </Flex>
                            </PokemonAccordionItem>
                            <PokemonAccordionItem isVisible={otherInGame.length > 0}
                                                  heading="Other Catchable Pokémon"
                                                  defaultOpen={false}>
                                <Flex direction="column">
                                    {otherInGame.map((p, i) => (
                                        <Box key={p.pokedexNumber}>
                                            {i > 0 && <Divider/>}
                                            <PokemonRow p={p} encounters={gameEncountersFor(p, game.id)}/>
                                        </Box>
                                    ))}
                                </Flex>
                            </PokemonAccordionItem>
                        </Flex>
                    </PokemonAccordionItem>
                );
            })}

            {/* Section 3: Catch and Breed */}
            <PokemonAccordionItem isVisible={toCatchAndBreed.length > 0} heading="Catch & Breed" headingSize="lg">
                <Text color="gray.500" my={4}>
                    These Pokémon can be obtained by first catching an ancestor in one of the games above,
                    then breeding.
                </Text>
                <Flex direction="column" gap={6}>
                    {toCatchAndBreed.map(p => (
                        <Box key={p.pokedexNumber} borderWidth={1} borderRadius="md" p={4}>
                            <PokemonRow p={p}/>
                            <Box mt={2}>
                                <CatchAndBreed
                                    user={user}
                                    pokemon={p}
                                    evolutionChain={getEvolutionChain(p.evolutionChainId)}
                                    allPokemonInChain={getChainPokemon(p.evolutionChainId)}
                                />
                            </Box>
                        </Box>
                    ))}
                </Flex>
            </PokemonAccordionItem>

            {/* Section 4: GTS */}
            {unobtainable.length > 0 && (
                <Box>
                    <Heading size="lg" mb={2}>Obtain via GTS</Heading>
                    <Text color="gray.500" mb={4}>
                        These Pokémon cannot be caught or bred with your current games and collection.
                        Trade for them on the GTS.
                    </Text>
                    <Flex direction="column">
                        {unobtainable.map((p, i) => (
                            <Box key={p.pokedexNumber}>
                                {i > 0 && <Divider/>}
                                <PokemonRow p={p}/>
                            </Box>
                        ))}
                    </Flex>
                </Box>
            )}

            {toBreed.length === 0 && user.ownedGames.length === 0 && toCatchAndBreed.length === 0 && unobtainable.length === 0 && (
                <Text color="gray.500">
                    You have caught everything! Or you may need to add your owned games first.
                </Text>
            )}
        </Flex>
    );
}
