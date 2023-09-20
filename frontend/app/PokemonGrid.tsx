import {Grid} from "@chakra-ui/react";
import PokemonGridItem from "@/app/PokemonGridItem";
import User from "@/data/User";
import Pokemon from "@/data/Pokemon";
import Game from "@/data/Game";
import EvolutionChain from "@/data/EvolutionChain";
import {canBeAcquired, canBeBred, canCatch, notOwnedAndCanBeBred, userOwnsPokemon} from "@/lib/PokemonService";
import Filters from "@/app/Filters";
import {useMemo} from "react";

interface Props {
    user: User
    pokemon: Pokemon[]
    games: Game[]
    evolutionChains: EvolutionChain[]
    filters: Filters
}

interface PokemonWithMeta extends Pokemon {
    owned: boolean
    catchable: boolean
    breedable: boolean
    evolutionChain: EvolutionChain
}


export default function PokemonGrid({user, pokemon, evolutionChains, filters}: Props) {

    const calculatedPokemon : PokemonWithMeta[] = useMemo(() => {
        console.log("Calculating pokemon meta!")
        return pokemon.map((p) => {
            const evolutionChain = (evolutionChains.find(e => e.id === p.evolutionChainId) as EvolutionChain);
            const owned = userOwnsPokemon(p.pokedexNumber, user);
            const catchable = canBeAcquired(p, evolutionChain, user);
            const breedable = notOwnedAndCanBeBred(p, evolutionChain, user);
            return {
                ...p,
                owned,
                catchable,
                breedable,
                evolutionChain
            };
        });
    }, [pokemon, user]);


    const filteredPokemon = useMemo(() => {
        return calculatedPokemon.filter((p) => {
            if (filters.hideOwned && p.owned) return false;
            if (filters.hideUncatchable && !p.catchable) return false;
            return !(filters.onlyShowBreedable && !p.breedable);

        });
    }, [filters]);

    return (
        <Grid templateColumns='repeat(8, 1fr)'>
            {filteredPokemon.map((p) => {
                const evolutionChain = evolutionChains.find(e => e.id === p.evolutionChainId);
                return <PokemonGridItem pokemon={p} user={user} evolutionChain={evolutionChain}/>;
            })}
        </Grid>
    )
}