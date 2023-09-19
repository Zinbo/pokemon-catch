import EvolutionChainV2, {EvolvesTo} from "@/data/EvolutionChainV2";
import Pokemon from "@/data/Pokemon";
import User from "@/data/User";
import Image from "next/image";
import React, {useEffect, useState} from "react";
import {Box, Card, CardBody, CardHeader, Flex, Heading, Text} from "@chakra-ui/react";
import Xarrow from "react-xarrows";


export default function Breeding({user, pokemon, evolutionChain}: {
    user: User,
    pokemon: Pokemon,
    evolutionChain: EvolutionChainV2
}) {
    const [arrows, setArrows] = useState<React.JSX.Element[]>([]);
    const [breedingChain, setBreedingChain] = useState<React.JSX.Element[]>([]);

    useEffect(() => {
        const {breedingChain, arrows} = calculateBreedingChain();
        setBreedingChain(breedingChain);
        setArrows(arrows);
    }, [evolutionChain]);

    const calculateBreedingChain = () => {
        const ownedPokemon = findOwnedPokemon(evolutionChain.chain);
        if (!ownedPokemon) return {breedingChain: [], arrows: []};

        const breedingChain: React.JSX.Element[] = [];
        breedingChain.push(<Image id={`startBreed`} src={`/images/list/${ownedPokemon.pokedexNumber}.png`} width="96"
                                  height="96" alt="pokemon"/>)
        breedingChain.push(<Image id={`eggBreed`} src={`/egg.svg`} width="96" height="96" alt="pokemon"/>)
        const arrows: React.JSX.Element[] = [];
        arrows.push(<Xarrow
            start={`startBreed`}
            end={`eggBreed`}
        />)

        if (!getBreedingChain(evolutionChain.chain, pokemon.pokedexNumber, breedingChain, arrows, "egg")) return {breedingChain: [], arrows: []};
        return {breedingChain, arrows}
    }

    const findOwnedPokemon = (next: EvolvesTo) => {
        if (user.ownedPokemon.includes(next.pokedexNumber)) return next;

        if (!next?.evolvesTo?.length) return null;
        let found = null;
        next.evolvesTo.forEach(e => {
            const potential = findOwnedPokemon(e);
            if (potential) {
                found = potential;
                return;
            }
        })
        return found;
    }

    const getBreedingChain = (next: EvolvesTo, toFind: number, chain: React.JSX.Element[], arrows: React.JSX.Element[], prevName: string) => {
        chain.push(<Image id={`${next.name}Breed`} src={`/images/list/${next.pokedexNumber}.png`} width="96" height="96"
                          alt="pokemon"/>);
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
        if (user.ownedPokemon.includes(pokemon.pokedexNumber)) return <></>;

        const chainElements = !breedingChain.length ? <>Not possible with current collection</> : breedingChain.map(p =>
            <Box>{p}</Box>);
        return (
            <Card>
                <CardHeader>
                    <Heading size='md'>Breeding</Heading>
                </CardHeader>

                <CardBody>
                    <Flex justifyContent={"space-between"} alignItems={"center"}>
                        {!breedingChain.length && <>Not possible with current collection</>}
                        {breedingChain.map(p => (
                            <Flex direction={"column"} gap={"50px"} flex={1} alignItems={"center"}>
                                <Box>{p}</Box>
                                Bulbasaur
                            </Flex>
                        ))}
                        {arrows}
                    </Flex>
                </CardBody>
            </Card>
        )
    }

    return (<Render/>)
}