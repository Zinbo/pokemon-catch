import {Grid} from "@chakra-ui/react";
import PokemonGridItem from "@/app/PokemonGridItem";
import User from "@/data/User";
import Pokemon from "@/data/Pokemon";
import Game from "@/data/Game";
import EvolutionChain from "@/data/EvolutionChain";
import {canBeAcquired, canBeBred, canCatch, notOwnedAndCanBeBred, userOwnsPokemon} from "@/lib/PokemonService";
import Filters from "@/app/Filters";

interface Props {
    user: User
    pokemon: Pokemon[]
    games: Game[]
    evolutionChains: EvolutionChain[]
    filters: Filters
}


export default function PokemonGrid({user, pokemon, games, evolutionChains, filters}: Props) {
    return (
        <Grid templateColumns='repeat(8, 1fr)'>
            {pokemon.flatMap((p) => {
                const evolutionChain = evolutionChains.find(e => e.id === p.evolutionChainId);
               if(filters.hideOwned && userOwnsPokemon(p.pokedexNumber, user)) return [];
               if(filters.hideUncatchable && !canBeAcquired(p, evolutionChain, user)) return [];
               if(filters.onlyShowBreedable && !notOwnedAndCanBeBred(p, evolutionChain, user)) return [];
               return <PokemonGridItem pokemon={p} user={user} evolutionChain={evolutionChain}/>;
            })}
        </Grid>
    )
}