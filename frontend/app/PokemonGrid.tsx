import {Grid} from "@chakra-ui/react";
import PokemonGridItem from "@/app/PokemonGridItem";
import User from "@/data/User";
import Pokemon from "@/data/Pokemon";
import Game from "@/data/Game";
import EvolutionChain from "@/data/EvolutionChain";

interface Props {
    user: User
    pokemon: Pokemon[]
    games: Game[]
    evolutionChains: EvolutionChain[]
}


export default function PokemonGrid({user, pokemon, games, evolutionChains}: Props) {
    return (
        <Grid templateColumns='repeat(8, 1fr)' border='1px' borderColor='gray.200'>
            {pokemon.map((p) => (
                <PokemonGridItem pokemon={p} user={user} evolutionChain={evolutionChains.find(e => e.id === p.evolutionChainId)}/>
            ))}
        </Grid>
    )
}