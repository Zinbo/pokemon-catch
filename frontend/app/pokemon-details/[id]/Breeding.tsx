'use client'

import EvolutionChain, {EvolvesTo} from "@/types/EvolutionChain";
import Pokemon, {PokemonWithMeta} from "@/types/Pokemon";
import User from "@/types/User";
import Image from "next/image";
import React from "react";
import {Box, Card, CardBody, CardHeader, Flex, Heading, HStack, Stack, Text} from "@chakra-ui/react";
import {findOwnedPokemonInChain, userOwnsPokemon} from "@/lib/PokemonService";
import {Icon} from "@chakra-ui/icons";
import {HiOutlineArrowLongRight} from "react-icons/hi2";
import CriteriaArrow from "@/app/pokemon-details/[id]/CriteriaArrow";
import PokemonImage from "@/app/PokemonImage";

export default function Breeding({user, pokemon, evolutionChain, allPokemonInChain}: {
    user: User | undefined,
    pokemon: Pokemon,
    evolutionChain: EvolutionChain
    allPokemonInChain: PokemonWithMeta[]
}) {

    let toBreedFrom: EvolvesTo | undefined = undefined;

    const stepNames: string[] = [];

    const getPokemonImage = (pokedexNumber: number) => {
        const pokemon = (allPokemonInChain.find(p => p.pokedexNumber === pokedexNumber) as PokemonWithMeta);
        return <PokemonImage pokedexNumber={pokemon.pokedexNumber} name={pokemon.name} isOwned={pokemon.owned}
                             canBeAcquired={pokemon.catchable}/>;

    }

    const Column = ({pokedexNumber}: { pokedexNumber: number }) => {
        return (
            <Flex direction={"column"} alignItems={"center"}>
                {getPokemonImage(pokedexNumber)}
            </Flex>
        )
    }

    const getCard = (next: EvolvesTo) => {
        const pokemonCard = <Column pokedexNumber={next.pokedexNumber}/>
        if (!next.waysToEvolve.length) return [pokemonCard];

        const arrow = <CriteriaArrow pokemonEvolution={next}/>

        return [arrow, pokemonCard];
    }


    const Egg = () => <Image id={`eggBreed`} src={`/images/list/egg.png`} width="96" height="96" alt="pokemon"/>;

    const getSteps = (ownedPokemonNumber: number, ownedPokemonName: string, desiredPokemonNumber: number, evolutionChain: EvolutionChain): React.JSX.Element[][] => {

        const breedingSteps: React.JSX.Element[][] = [];

        // step 1, if not a baby then from pokemon to egg
        const eggStep: React.JSX.Element[] = [];
        eggStep.push(<Flex direction={"column"} alignItems={"center"}>{getPokemonImage(ownedPokemonNumber)}</Flex>);
        eggStep.push((
            <Flex direction={"column"} className={"criteria"} justifyContent={"center"} alignItems={"center"}><Icon
                boxSize={"4em"} viewBox={"0 0 24 10"} as={HiOutlineArrowLongRight}/></Flex>))
        eggStep.push(<Egg/>)

        breedingSteps.push(eggStep);

        const evolveStep: React.JSX.Element[] = [];
        // step 2, from egg to desired pokemon
        evolveStep.push(<Egg/>)
        evolveStep.push((
            <Flex direction={"column"} className={"criteria"} justifyContent={"center"} alignItems={"center"}><Icon
                boxSize={"4em"} viewBox={"0 0 24 10"} as={HiOutlineArrowLongRight}/></Flex>))
        if (!getBreedingChain(evolutionChain.chain, desiredPokemonNumber, evolveStep)) return [];

        breedingSteps.push(evolveStep);

        return breedingSteps;
    }

    const calculateSteps = (evolutionChain: EvolutionChain, user: User): React.JSX.Element[][] => {

        // scenarios
        // 1. Pokemon does not have a baby in the chain - simple, show owned pokemon to egg, and then egg to desired pokemon
        // 2. Pokemon desired is a baby pokemon -  simple, show owned pokemon to egg, and then egg to baby
        // 3. Pokemon desired has a baby in the chain, but the user owns another pokemon in the chain that isn't a baby - simple, show owned non-baby pokemon to egg, and then egg to desired pokemon
        // 4. Pokemon desired has a baby in the chain, and the user only owns the baby - show baby to desired pokemon, show desired pokemon to egg, show egg to baby pokemon

        const ownedPokemon = findOwnedPokemonInChain(evolutionChain.chain, user);
        if (!ownedPokemon) return [];
        toBreedFrom = ownedPokemon;
        // scenario 1 and 2

        if (evolutionChain.baby?.pokedexNumber !== ownedPokemon.pokedexNumber) {
            stepNames.push("Breed egg from owned pokemon", "Hatch egg and evolve to desired pokemon")
            return getSteps(ownedPokemon.pokedexNumber, ownedPokemon.name, pokemon.pokedexNumber, evolutionChain);
        }

        // Owned pokemon is a baby, see if we can find another that isn't a baby
        let nextOwnedPokemon: EvolvesTo | null = null;
        for (const evolvesTo of ownedPokemon.evolvesTo) {
            nextOwnedPokemon = findOwnedPokemonInChain(evolvesTo, user);
            if (!!nextOwnedPokemon) break;
        }

        // scenario 3
        if (!!nextOwnedPokemon) {
            stepNames.push("Breed egg from owned pokemon", "Hatch egg and evolve to desired pokemon")
            toBreedFrom = nextOwnedPokemon;
            return getSteps(nextOwnedPokemon.pokedexNumber, nextOwnedPokemon.name, pokemon.pokedexNumber, evolutionChain);
        }


        // scenario 4
        const fromBabyToDesiredStep: React.JSX.Element[] = [];
        if (!getBreedingChain(evolutionChain.chain, pokemon.pokedexNumber, fromBabyToDesiredStep)) return [];
        const restOfTheSteps = getSteps(pokemon.pokedexNumber, pokemon.name, ownedPokemon.pokedexNumber, evolutionChain);
        restOfTheSteps.unshift(fromBabyToDesiredStep);
        stepNames.push("Evolve baby to desired pokemon", "Breed egg from desired pokemon", "Hatch egg to restore baby pokemon in collection")

        return restOfTheSteps;
    }

    const getBreedingChain = (next: EvolvesTo, toFind: number, chain: React.JSX.Element[]) => {
        const elementsToAdd = getCard(next);
        chain.push(...elementsToAdd);

        if (next.pokedexNumber === toFind) {
            return true;
        }
        for (const e of next.evolvesTo) {
            if (getBreedingChain(e, toFind, chain)) return true;
        }
        elementsToAdd.forEach(_ => chain.pop())
        return false;
    }

    const PokemonCard = ({breedingSteps}: { breedingSteps: React.JSX.Element[][] }) => {
        if (!breedingSteps.length || !toBreedFrom) return (
            <CardBody>
                <Text>Not possible with current collection</Text>
            </CardBody>
        )

        return (
            <CardBody>
                <Flex direction={"column"} gap={"20px"}>
                    {breedingSteps.map((step, index) => (
                        <Flex direction={"column"} justifyContent={"center"} alignItems={"center"}>
                            <Heading size={"sm"}>Step {index + 1} ({stepNames[index]})</Heading>
                            <Flex alignItems={"center"} gap={"20px"} >
                                {step.map(p => p)}
                            </Flex>
                        </Flex>
                    ))}
                </Flex>
            </CardBody>
        )
    }

    const Render = () => {
        if (!user) return <></>;
        if (userOwnsPokemon(pokemon.pokedexNumber, user)) return <></>;

        return (
            <Card flex={1}>
                <CardHeader>
                    <Heading size='md'>Breeding</Heading>
                </CardHeader>
                <PokemonCard breedingSteps={calculateSteps(evolutionChain, user)}/>

            </Card>
        )
    }

    return (<Render/>)
}