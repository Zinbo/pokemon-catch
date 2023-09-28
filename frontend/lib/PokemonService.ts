import Pokemon, {Encounter, PokemonWithMeta} from "@/data/Pokemon";
import User from "@/data/User";
import EvolutionChain, {EvolvesTo} from "@/data/EvolutionChain";
import Game from "@/data/Game";

export function userOwnsPokemon(pokedexNumber: number, user: User) {
    return user.ownedPokemon.includes(pokedexNumber);
}

export function canBeBred(evolutionChain: EvolutionChain, user: User) {
    return (!!findOwnedPokemonInChain(evolutionChain.chain, user));
}

export function findOwnedPokemonInChain(next: EvolvesTo, user: User) {
    if (userOwnsPokemon(next.pokedexNumber, user)) return next;

    if (!next?.evolvesTo?.length) return null;
    let found = null;
    next.evolvesTo.forEach(e => {
        const potential = findOwnedPokemonInChain(e, user);
        if (potential) {
            found = potential;
            return;
        }
    })
    return found;
}

export function calculateChainCompletion(evolutionChain : EvolutionChain, user : User) {
    return calculateCompletion(evolutionChain.chain, user);

}

function calculateCompletion(next : EvolvesTo, user : User) {
    let calculation = {noInChain: 1, noCaught: user.ownedPokemon.includes(next.pokedexNumber) ? 1 : 0};
    if(!next?.evolvesTo?.length) {
        return calculation;
    }
    next.evolvesTo.forEach(e => {
        const childResults = calculateCompletion(e, user);
        calculation.noCaught += childResults.noCaught;
        calculation.noInChain += childResults.noInChain;
    })

    return calculation;
}

export function canCatch(pokemon: Pokemon, ownedGames: Game[]) {
    return (!!pokemon.encounterDetails.encounters.find(e => encounterIsAvailable(e, ownedGames)));
}

export function encounterIsAvailable(encounter : Encounter, ownedGames: Game[]) {
    return (!!ownedGames.find(g => g.id === encounter.location.gameId));
}

export function canBeAcquired(pokemon: Pokemon, evolutionChain: EvolutionChain, user: User) {
    return canCatch(pokemon, user.ownedGames) || canBeBred(evolutionChain, user);
}

export function notOwnedAndCanBeBred(pokemon : Pokemon, evolutionChain: EvolutionChain, user: User) {
    if(userOwnsPokemon(pokemon.pokedexNumber, user)) return false;
    return canBeBred(evolutionChain, user);
}

export function calculateMetaDataForPokemon(pokemon: Pokemon, evolutionChain: EvolutionChain, user: User | null | undefined): PokemonWithMeta {
    if (!user) return {
        ...pokemon,
        owned: true,
        catchable: true,
        breedable: false,
    }

    const owned = userOwnsPokemon(pokemon.pokedexNumber, user);
    const catchable = canBeAcquired(pokemon, evolutionChain, user);
    const breedable = notOwnedAndCanBeBred(pokemon, evolutionChain, user);
    return {
        ...pokemon,
        owned,
        catchable,
        breedable,
    };
}

export function calculateMetaDataForAllPokemon(pokemon: Pokemon[], evolutionChains: EvolutionChain[], user: User | null | undefined) {
    return pokemon.map((p) => {
        const evolutionChain = (evolutionChains.find(e => e.id === p.evolutionChainId) as EvolutionChain);
        return calculateMetaDataForPokemon(p, evolutionChain, user);
    });
}