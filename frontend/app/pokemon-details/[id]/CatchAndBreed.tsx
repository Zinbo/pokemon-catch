'use client'

import EvolutionChain, {EvolvesTo} from "@/types/EvolutionChain";
import Pokemon, {PokemonWithMeta} from "@/types/Pokemon";
import User from "@/types/User";
import Image from "next/image";
import React from "react";
import {Card, CardBody, CardHeader, Flex, Heading, Text} from "@chakra-ui/react";
import {canBeBred, canCatch, findCatchableAncestorInChain, userOwnsPokemon} from "@/lib/PokemonService";
import {Icon} from "@chakra-ui/icons";
import {HiOutlineArrowLongRight} from "react-icons/hi2";
import CriteriaArrow from "@/app/pokemon-details/[id]/CriteriaArrow";
import PokemonImage from "@/app/PokemonImage";
import Link from "next/link";

export default function CatchAndBreed({user, pokemon, evolutionChain, allPokemonInChain}: {
    user: User | undefined,
    pokemon: Pokemon,
    evolutionChain: EvolutionChain
    allPokemonInChain: PokemonWithMeta[]
}) {
    const stepNames: string[] = [];

    const getPokemonImage = (pokedexNumber: number) => {
        const p = allPokemonInChain.find(p => p.pokedexNumber === pokedexNumber) as PokemonWithMeta;
        return <PokemonImage pokedexNumber={p.pokedexNumber} name={p.name} isOwned={p.owned}
                             canBeAcquired={p.catchable} catchAndBreed={p.catchAndBreed}/>;
    }

    const getCard = (next: EvolvesTo) => {
        const pokemonCard = (
            <Flex direction={"column"} alignItems={"center"}>
                {getPokemonImage(next.pokedexNumber)}
            </Flex>
        );
        if (!next.waysToEvolve.length) return [pokemonCard];
        const arrow = <CriteriaArrow pokemonEvolution={next}/>;
        return [arrow, pokemonCard];
    }

    const Arrow = () => (
        <Flex direction={"column"} className={"criteria"} justifyContent={"center"} alignItems={"center"}>
            <Icon boxSize={"4em"} viewBox={"0 0 24 10"} as={HiOutlineArrowLongRight}/>
        </Flex>
    );

    const Egg = () => <Image id="eggCatchBreed" src="/images/list/egg.png" width="96" height="96" alt="egg"/>;

    const getBreedingChain = (next: EvolvesTo, toFind: number, chain: React.JSX.Element[]): boolean => {
        const elementsToAdd = getCard(next);
        chain.push(...elementsToAdd);
        if (next.pokedexNumber === toFind) return true;
        for (const e of next.evolvesTo) {
            if (getBreedingChain(e, toFind, chain)) return true;
        }
        elementsToAdd.forEach(_ => chain.pop());
        return false;
    }

    const calculateSteps = (evolutionChain: EvolutionChain, user: User): React.JSX.Element[][] => {
        const ancestor = findCatchableAncestorInChain(
            evolutionChain,
            pokemon.pokedexNumber,
            allPokemonInChain,
            user.ownedGames
        );
        if (!ancestor) return [];

        const catchStep: React.JSX.Element[] = [
            <Flex direction={"column"} alignItems={"center"} key="catch-pokemon">
                <Link href={`/pokemon-details/${ancestor.pokedexNumber}`}>
                    {getPokemonImage(ancestor.pokedexNumber)}
                </Link>
            </Flex>
        ];

        const breedStep: React.JSX.Element[] = [
            <Flex direction={"column"} alignItems={"center"} key="breed-pokemon">
                {getPokemonImage(ancestor.pokedexNumber)}
            </Flex>,
            <Arrow key="breed-arrow"/>,
            <Egg key="breed-egg"/>
        ];

        const evolveStep: React.JSX.Element[] = [<Egg key="evolve-egg"/>];
        evolveStep.push(<Arrow key="evolve-arrow"/>);
        if (!getBreedingChain(evolutionChain.chain, pokemon.pokedexNumber, evolveStep)) return [];

        stepNames.push(
            `Catch ${ancestor.name}`,
            `Breed ${ancestor.name}`,
            `Hatch egg and evolve to ${pokemon.name}`
        );

        return [catchStep, breedStep, evolveStep];
    }

    const PokemonCard = ({steps}: { steps: React.JSX.Element[][] }) => {
        if (!steps.length) return (
            <CardBody>
                <Text>Not possible with current collection</Text>
            </CardBody>
        );

        return (
            <CardBody>
                <Flex direction={"column"} gap={"20px"}>
                    {steps.map((step, index) => (
                        <Flex direction={"column"} justifyContent={"center"} alignItems={"center"} key={index}>
                            <Heading size={"sm"}>Step {index + 1} ({stepNames[index]})</Heading>
                            <Flex alignItems={"center"} gap={"20px"}>
                                {step.map(p => p)}
                            </Flex>
                        </Flex>
                    ))}
                </Flex>
            </CardBody>
        );
    }

    const Render = () => {
        if (!user) return <></>;
        if (userOwnsPokemon(pokemon.pokedexNumber, user)) return <></>;

        const ancestor = findCatchableAncestorInChain(
            evolutionChain,
            pokemon.pokedexNumber,
            allPokemonInChain,
            user.ownedGames
        );
        if (!ancestor) return <></>;

        // Only show if direct catch/breed is not possible
        if (canCatch(pokemon, user.ownedGames) || canBeBred(evolutionChain, user)) return <></>;

        return (
            <Card flex={1}>
                <CardHeader>
                    <Heading size='md'>Catch and Breed</Heading>
                </CardHeader>
                <PokemonCard steps={calculateSteps(evolutionChain, user)}/>
            </Card>
        );
    }

    return <Render/>;
}
