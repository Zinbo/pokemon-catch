import User from "@/data/User";
import Pokemon from "@/data/Pokemon";
import EvolutionChain from "@/data/EvolutionChain";
import {findOwnedPokemonInChain} from "@/lib/PokemonService";
import React from "react";
import {Box, Card, CardBody, CardHeader, Flex, Heading} from "@chakra-ui/react";
import Image from "next/image";

export default function BreedingV2({user, pokemon, evolutionChain}: {
    user: User | undefined,
    pokemon: Pokemon,
    evolutionChain: EvolutionChain
}) {

    if(!user) return <></>;
    if (user.ownedPokemon.includes(pokemon.pokedexNumber)) return <></>;
    const ownedPokemon = findOwnedPokemonInChain(evolutionChain.chain, user);

    const PokemonCard = () => {
        if(!ownedPokemon) return (
            <>Not possible with current collection</>
        )

        return (<Flex>
            <Box><Image src={`/images/list/${ownedPokemon.pokedexNumber}.png`} width="96" height="96"
                        alt="pokemon"/></Box>
            {ownedPokemon.name}
        </Flex>)
    }

    return (
        <Card>
            <CardHeader>
                <Heading size='md'>Breeding V2</Heading>
            </CardHeader>

            <CardBody>
                <PokemonCard/>
            </CardBody>
        </Card>
    )

}