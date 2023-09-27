'use client'

import EvolutionChain, {EvolvesTo} from "@/data/EvolutionChain";
import Pokemon from "@/data/Pokemon";
import User from "@/data/User";
import Image from "next/image";
import React from "react";
import {Box, Card, CardBody, CardHeader, Flex, Heading, Text} from "@chakra-ui/react";
import {findOwnedPokemonInChain} from "@/lib/PokemonService";
import {Icon} from "@chakra-ui/icons";
import {HiOutlineArrowLongRight} from "react-icons/hi2";

export default function Breeding({user, pokemon, evolutionChain}: {
    user: User | undefined,
    pokemon: Pokemon,
    evolutionChain: EvolutionChain
}) {

    let toBreedFrom: EvolvesTo|undefined = undefined;

    const getCard = (next: EvolvesTo) => {
        const pokemonCard = (
            <Flex direction={"column"} alignItems={"center"}>
                <Image src={`/images/list/${next.pokedexNumber}.png`} width="96" height="96" alt="pokemon"/>
                <Text>{next.name}</Text>
            </Flex>
        )
        if(!next.waysToEvolve.length) return [pokemonCard];

        const criteria = next.waysToEvolve.map(criteria => `Trigger: ${criteria.trigger}, Conditions: [${criteria.triggerCriteria.map(c => `${c.type}: ${c.value}`).join(", ")}]`).join(" OR ");
        const arrow = (
            <Flex direction={"column"} className={"criteria"} justifyContent={"center"} alignItems={"center"}>
                <Icon boxSize={"4em"} viewBox={"0 0 24 10"} as={HiOutlineArrowLongRight}/>
                <Text>{criteria}</Text>
            </Flex>
        )

        return [arrow, pokemonCard];
    }

    const Column = ({image, name}: { image: React.JSX.Element, name?: string }) => {
        return (
            <Flex direction={"column"} alignItems={"center"}>
                <Box>{image}</Box>
                {name ? name : " "}
            </Flex>
        )
    }

    const Egg = () => <Image id={`eggBreed`} src={`/egg.svg`} width="96" height="96" alt="pokemon"/>;

    const getSteps = (ownedPokemonNumber: number, ownedPokemonName: string, desiredPokemonNumber: number, evolutionChain: EvolutionChain) :  React.JSX.Element[][] => {

        const breedingSteps: React.JSX.Element[][] = [];

        // step 1, if not a baby then from pokemon to egg
        const eggStep: React.JSX.Element[] = [];
        eggStep.push(<Flex direction={"column"} alignItems={"center"}><Image src={`/images/list/${ownedPokemonNumber}.png`} width="96" height="96" alt="pokemon"/><Text>{ownedPokemonName}</Text></Flex>);
        eggStep.push((<Flex direction={"column"} className={"criteria"} justifyContent={"center"} alignItems={"center"}><Icon boxSize={"4em"} viewBox={"0 0 24 10"} as={HiOutlineArrowLongRight}/></Flex>))
        eggStep.push(<Egg/>)

        breedingSteps.push(eggStep);

        const evolveStep: React.JSX.Element[] = [];
        // step 2, from egg to desired pokemon
        evolveStep.push(<Egg/>)
        evolveStep.push((<Flex direction={"column"} className={"criteria"} justifyContent={"center"} alignItems={"center"}><Icon boxSize={"4em"} viewBox={"0 0 24 10"} as={HiOutlineArrowLongRight}/></Flex>))
        if (!getBreedingChain(evolutionChain.chain, desiredPokemonNumber, evolveStep)) return [];

        breedingSteps.push(evolveStep);

        return breedingSteps;
    }

    const calculateSteps = (evolutionChain: EvolutionChain, user: User) :  React.JSX.Element[][]  => {

        // scenarios
        // 1. Pokemon does not have a baby in the chain - simple, show owned pokemon to egg, and then egg to desired pokemon
        // 2. Pokemon desired is a baby pokemon -  simple, show owned pokemon to egg, and then egg to baby
        // 3. Pokemon desired has a baby in the chain, but the user owns another pokemon in the chain that isn't a baby - simple, show owned non-baby pokemon to egg, and then egg to desired pokemon
        // 4. Pokemon desired has a baby in the chain, and the user only owns the baby - show baby to desired pokemon, show desired pokemon to egg, show egg to baby pokemon

        const ownedPokemon = findOwnedPokemonInChain(evolutionChain.chain, user);
        if (!ownedPokemon) return [];
        toBreedFrom = ownedPokemon;
        // scenario 1 and 2
        if (evolutionChain.baby?.pokedexNumber !== ownedPokemon.pokedexNumber) return getSteps(ownedPokemon.pokedexNumber, ownedPokemon.name, pokemon.pokedexNumber, evolutionChain);

        let nextOwnedPokemon: EvolvesTo | null = null;
        for (const evolvesTo of ownedPokemon.evolvesTo) {
            nextOwnedPokemon = findOwnedPokemonInChain(evolvesTo, user);
            if (!!nextOwnedPokemon) break;
        }

        // scenario 3
        if (!!nextOwnedPokemon) {
            toBreedFrom = nextOwnedPokemon;
            return getSteps(nextOwnedPokemon.pokedexNumber, nextOwnedPokemon.name, pokemon.pokedexNumber, evolutionChain);
        }


        // scenario 4
        const fromBabyToDesiredStep: React.JSX.Element[] = [];
        if (!getBreedingChain(evolutionChain.chain, pokemon.pokedexNumber, fromBabyToDesiredStep)) return [];
        const restOfTheSteps = getSteps(pokemon.pokedexNumber, pokemon.name, ownedPokemon.pokedexNumber, evolutionChain);
        restOfTheSteps.unshift(fromBabyToDesiredStep);

        return restOfTheSteps;
    }

    const getBreedingChain = (next: EvolvesTo, toFind: number, chain: React.JSX.Element[]) => {
        chain.push(...getCard(next));

        if (next.pokedexNumber === toFind) {
            return true;
        }
        for (const e of next.evolvesTo) {
            if (getBreedingChain(e, toFind, chain)) return true;
        }
        chain.pop();
        return false;
    }

    const PokemonCard = ({breedingSteps}: {breedingSteps: React.JSX.Element[][]}) => {
        if(!breedingSteps.length) return (
            <CardBody>
                <Text>Not possible with current collection</Text>
            </CardBody>
        )

        return (
            <CardBody>
                <Heading size={"sm"}>Breed from:</Heading>
                <Column
                    image={<Image src={`/images/list/${toBreedFrom?.pokedexNumber}.png`} width="96" height="96"
                                  alt="pokemon"/>} name={toBreedFrom?.name}/>
                <Heading size={"sm"}>Breeding Instructions:</Heading>
                <Flex direction={"column"} justifyContent={"center"} alignItems={"center"}>
                    {breedingSteps.map((step, index) => (
                        <>
                        <Box>Step {index+1}:</Box>
                        <Flex alignItems={"center"}>
                            {step.map(p => p)}
                        </Flex>
                        </>
                    ))}
                </Flex>
            </CardBody>
        )
    }

    const Render = () => {
        if (!user) return <></>;
        if (user.ownedPokemon.includes(pokemon.pokedexNumber)) return <></>;

        return (
            <Card>
                <CardHeader>
                    <Heading size='md'>Breeding</Heading>
                </CardHeader>
                <PokemonCard breedingSteps={calculateSteps(evolutionChain, user)}/>

            </Card>
        )
    }

    return (<Render/>)
}