'use client'

import EvolutionChain, {EvolvesTo} from "@/data/EvolutionChain";
import Pokemon from "@/data/Pokemon";
import User from "@/data/User";
import Image from "next/image";
import React from "react";
import {Box, Card, CardBody, CardHeader, Flex, Heading} from "@chakra-ui/react";
import Xarrow from "react-xarrows";
import {findOwnedPokemonInChain} from "@/lib/PokemonService";

export default function Breeding({user, pokemon, evolutionChain}: {
    user: User | undefined,
    pokemon: Pokemon,
    evolutionChain: EvolutionChain
}) {
    const calculateBreedingChain = (evolutionChain: EvolutionChain, user : User) => {
        const ownedPokemon = findOwnedPokemonInChain(evolutionChain.chain, user);
        if (!ownedPokemon) return {breedingChain: [], arrows: []};

        const breedingChain: React.JSX.Element[] = [];
        breedingChain.push(<Column image={<Image id={`startBreed`} src={`/images/list/${ownedPokemon.pokedexNumber}.png`} width="96"
                                                 height="96" alt="pokemon"/>} name={ownedPokemon.name}/>)
        breedingChain.push(<Column image={<Image id={`eggBreed`} src={`/egg.svg`} width="96" height="96" alt="pokemon"/>}/>)
        const arrows: React.JSX.Element[] = [];
        arrows.push(<Xarrow
            start={`startBreed`}
            end={`eggBreed`}
        />)

        if (!getBreedingChain(evolutionChain.chain, pokemon.pokedexNumber, breedingChain, arrows, "egg")) return {
            breedingChain: [],
            arrows: []
        };
        return {breedingChain, arrows}
    }

    const Column = ({image, name} : {image: React.JSX.Element, name ?: string}) => {
        return (
            <Flex direction={"column"} flex={1} alignItems={"center"}>
                <Box>{image}</Box>
                {name ? name : " "}
            </Flex>
        )
    }

    const getBreedingChain = (next: EvolvesTo, toFind: number, chain: React.JSX.Element[], arrows: React.JSX.Element[], prevName: string) => {
        chain.push(<Column image={<Image id={`${next.name}Breed`} src={`/images/list/${next.pokedexNumber}.png`} width="96" height="96"
                        alt="pokemon"/>} name={next.name}/>);
        arrows.push(<Xarrow
            start={`${prevName}Breed`}
            end={`${next.name}Breed`}
            labels={{
                end:
                    <div>{next.waysToEvolve.map(way => `Trigger: ${way.trigger}, Conditions: [${way.triggerCriteria.map(c => `${c.type}: ${c.value}`).join(", ")}]`).join(" OR ")}</div>
            }}
        />)
        // TODO: If the pokemon is a baby, then need to go one step further
        if (next.pokedexNumber === toFind) {
            return true;
        }
        for (const e of next.evolvesTo) {
            if (getBreedingChain(e, toFind, chain, arrows, next.name)) return true;
        }
        chain.pop();
        arrows.pop();
        return false;
    }

    const Render = () => {
        if (!user) return <></>;
        if (user.ownedPokemon.includes(pokemon.pokedexNumber)) return <></>;
        const {breedingChain, arrows} = calculateBreedingChain(evolutionChain, user);

        const chainElements = !breedingChain.length ? <>Not possible with current collection</> : breedingChain.map(p =>
            <Box>{p}</Box>);
        return (
            <Card>
                <CardHeader>
                    <Heading size='md'>Breeding V1</Heading>
                </CardHeader>

                <CardBody>
                    <Flex justifyContent={"space-between"} alignItems={"flex-start"}>
                        {!breedingChain.length && <>Not possible with current collection</>}
                        {breedingChain.map(p => p)}
                        {arrows}
                    </Flex>
                </CardBody>
            </Card>
        )
    }

    return (<Render/>)
}