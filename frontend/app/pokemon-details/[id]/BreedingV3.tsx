'use client'

import EvolutionChain, {EvolvesTo} from "@/data/EvolutionChain";
import Pokemon from "@/data/Pokemon";
import User from "@/data/User";
import Image from "next/image";
import React from "react";
import {Box, Card, CardBody, CardHeader, Flex, Heading, Text} from "@chakra-ui/react";
import Xarrow from "react-xarrows";
import {findOwnedPokemonInChain} from "@/lib/PokemonService";

export default function Breeding({user, pokemon, evolutionChain}: {
    user: User | undefined,
    pokemon: Pokemon,
    evolutionChain: EvolutionChain
}) {

    let toBreedFrom: EvolvesTo|undefined = undefined;

    const getSteps = (ownedPokemonNumber: number, ownedPokemonName: string, desiredPokemonNumber: number, evolutionChain: EvolutionChain) => {
        const arrows = [];

        const breedingSteps: React.JSX.Element[][] = [];

        // step 1, if not a baby then from pokemon to egg
        const eggStep: React.JSX.Element[] = [];
        eggStep.push(<Column image={<Image id={`startBreed`} src={`/images/list/${ownedPokemonNumber}.png`} width="96"
                                           height="96" alt="pokemon"/>} name={ownedPokemonName}/>)
        eggStep.push(<Column image={<Image id={`eggBreed`} src={`/egg.svg`} width="96" height="96" alt="pokemon"/>}/>)
        arrows.push(<Xarrow
            start={`startBreed`}
            end={`eggBreed`}
        />)

        breedingSteps.push(eggStep);

        const evolveStep: React.JSX.Element[] = [];
        // step 2, from egg to desired pokemon
        evolveStep.push(<Column
            image={<Image id={`egg2Breed`} src={`/egg.svg`} width="96" height="96" alt="pokemon"/>}/>)
        if (!getBreedingChain(evolutionChain.chain, desiredPokemonNumber, evolveStep, arrows, "evolveStep", "egg2")) return {
            breedingSteps: [],
            arrows: []
        };

        breedingSteps.push(evolveStep);

        return {breedingSteps, arrows}
    }

    const calculateSteps = (evolutionChain: EvolutionChain, user: User) => {

        // scenarios
        // 1. Pokemon does not have a baby in the chain - simple, show owned pokemon to egg, and then egg to desired pokemon
        // 2. Pokemon desired is a baby pokemon -  simple, show owned pokemon to egg, and then egg to baby
        // 3. Pokemon desired has a baby in the chain, but the user owns another pokemon in the chain that isn't a baby - simple, show owned non-baby pokemon to egg, and then egg to desired pokemon
        // 4. Pokemon desired has a baby in the chain, and the user only owns the baby - show baby to desired pokemon, show desired pokemon to egg, show egg to baby pokemon


        const ownedPokemon = findOwnedPokemonInChain(evolutionChain.chain, user);
        if (!ownedPokemon) return {breedingSteps: [], arrows: []};
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
        const arrows: React.JSX.Element[] = [];
        const fromBabyToDesiredStep: React.JSX.Element[] = [];
        if (!getBreedingChain(evolutionChain.chain, pokemon.pokedexNumber, fromBabyToDesiredStep, arrows, "fromBabyToDesiredStep")) return {
            breedingSteps: [],
            arrows: []
        };
        const restOfTheSteps = getSteps(pokemon.pokedexNumber, pokemon.name, ownedPokemon.pokedexNumber, evolutionChain);

        restOfTheSteps.breedingSteps.unshift(fromBabyToDesiredStep);
        restOfTheSteps.arrows.push(...arrows);

        return restOfTheSteps;
    }

    const Column = ({image, name}: { image: React.JSX.Element, name?: string }) => {
        return (
            <Flex direction={"column"} flex={1} alignItems={"center"}>
                <Box>{image}</Box>
                {name ? name : " "}
            </Flex>
        )
    }

    const getBreedingChain = (next: EvolvesTo, toFind: number, chain: React.JSX.Element[], arrows: React.JSX.Element[], stepName: string, prevName ?: string) => {
        const name = `${next.name}${stepName}`;
        chain.push(<Column
            image={<Image id={`${name}Breed`} src={`/images/list/${next.pokedexNumber}.png`} width="96" height="96"
                          alt="pokemon"/>} name={next.name}/>);
        if (prevName) {
            arrows.push(<Xarrow
                start={`${prevName}Breed`}
                end={`${name}Breed`}
                labels={{
                    end:
                        <div>{next.waysToEvolve.map(way => `Trigger: ${way.trigger}, Conditions: [${way.triggerCriteria.map(c => `${c.type}: ${c.value}`).join(", ")}]`).join(" OR ")}</div>
                }}
            />)
        }

        if (next.pokedexNumber === toFind) {
            return true;
        }
        for (const e of next.evolvesTo) {
            if (getBreedingChain(e, toFind, chain, arrows, stepName, name)) return true;
        }
        chain.pop();
        arrows.pop();
        return false;
    }

    const PokemonCard = ({breedingSteps, arrows}: {breedingSteps: React.JSX.Element[][], arrows: React.JSX.Element[]}) => {
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
                <Flex direction={"column"}>
                    {breedingSteps.map((step, index) => (
                        <Flex justifyContent={"space-between"} alignItems={"flex-start"}>
                            Step {index + 1}:
                            {step.map(p => p)}
                        </Flex>
                    ))}
                </Flex>
                {arrows}
            </CardBody>
        )
    }

    const Render = () => {
        if (!user) return <></>;
        if (user.ownedPokemon.includes(pokemon.pokedexNumber)) return <></>;
        const {breedingSteps, arrows} = calculateSteps(evolutionChain, user);

        return (
            <Card>
                <CardHeader>
                    <Heading size='md'>Breeding</Heading>
                </CardHeader>
                <PokemonCard breedingSteps={breedingSteps} arrows={arrows}/>

            </Card>
        )
    }

    return (<Render/>)
}