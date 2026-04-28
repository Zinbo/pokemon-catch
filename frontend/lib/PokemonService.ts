import Pokemon, {Encounter, PokemonWithMeta} from "@/types/Pokemon";
import User from "@/types/User";
import EvolutionChain, {EvolvesTo} from "@/types/EvolutionChain";
import Game from "@/types/Game";

export function userOwnsPokemon(pokedexNumber: number, user: User) {
    return !!user.ownedPokemon.find(o => o.pokedexNumber === pokedexNumber);
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
    let calculation = {noInChain: 1, noCaught: user.ownedPokemon.find(o => (o.pokedexNumber === next.pokedexNumber)) ? 1 : 0};
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

function nodeLeadsToTarget(node: EvolvesTo, targetPokedex: number): boolean {
    if (node.pokedexNumber === targetPokedex) return true;
    return node.evolvesTo.some(child => nodeLeadsToTarget(child, targetPokedex));
}

function findCatchableInEvolutions(evolutions: EvolvesTo[], allPokemon: Pokemon[], ownedGames: Game[]): EvolvesTo | null {
    for (const evo of evolutions) {
        const pokemonData = allPokemon.find(p => p.pokedexNumber === evo.pokedexNumber);
        if (pokemonData && canCatch(pokemonData, ownedGames)) return evo;
        const deeper = findCatchableInEvolutions(evo.evolvesTo, allPokemon, ownedGames);
        if (deeper) return deeper;
    }
    return null;
}

function findCatchableAncestor(node: EvolvesTo, targetPokedex: number, allPokemon: Pokemon[], ownedGames: Game[]): EvolvesTo | null {
    if (node.pokedexNumber === targetPokedex) {
        // Target reached: check if any evolution can be caught and bred back to produce the target
        return findCatchableInEvolutions(node.evolvesTo, allPokemon, ownedGames);
    }
    if (!nodeLeadsToTarget(node, targetPokedex)) return null;
    const pokemonData = allPokemon.find(p => p.pokedexNumber === node.pokedexNumber);
    if (pokemonData && canCatch(pokemonData, ownedGames)) return node;
    for (const child of node.evolvesTo) {
        const result = findCatchableAncestor(child, targetPokedex, allPokemon, ownedGames);
        if (result) return result;
    }
    return null;
}

export function findCatchableAncestorInChain(evolutionChain: EvolutionChain, targetPokedex: number, allPokemon: Pokemon[], ownedGames: Game[]): EvolvesTo | null {
    return findCatchableAncestor(evolutionChain.chain, targetPokedex, allPokemon, ownedGames);
}

export function canCatchThenBreed(pokemon: Pokemon, evolutionChain: EvolutionChain, allPokemon: Pokemon[], user: User): boolean {
    if (userOwnsPokemon(pokemon.pokedexNumber, user)) return false;
    if (canBeAcquired(pokemon, evolutionChain, user)) return false;
    return findCatchableAncestorInChain(evolutionChain, pokemon.pokedexNumber, allPokemon, user.ownedGames) !== null;
}

export function calculateMetaDataForPokemon(pokemon: Pokemon, evolutionChain: EvolutionChain, user: User | null | undefined, allPokemon?: Pokemon[]): PokemonWithMeta {
    if (!user) return {
        ...pokemon,
        owned: true,
        catchable: true,
        breedable: false,
        catchAndBreed: false,
    }

    const owned = userOwnsPokemon(pokemon.pokedexNumber, user);
    const catchable = canBeAcquired(pokemon, evolutionChain, user);
    const breedable = notOwnedAndCanBeBred(pokemon, evolutionChain, user);
    const catchAndBreed = (!owned && !catchable && !!allPokemon)
        ? canCatchThenBreed(pokemon, evolutionChain, allPokemon, user)
        : false;
    return {
        ...pokemon,
        owned,
        catchable,
        breedable,
        catchAndBreed,
    };
}

export function isBestCatchRateInOwnedGames(pokemon: Pokemon, gameId: number, ownedGames: Game[]): boolean {
    const gameEncounters = pokemon.encounterDetails.encounters.filter(e => e.location.gameId === gameId);
    if (!gameEncounters.length) return false;
    const bestInGame = Math.max(...gameEncounters.map(e => e.catchRate));
    const ownedGameIds = new Set(ownedGames.map(g => g.id));
    const bestAcrossOwnedGames = Math.max(...pokemon.encounterDetails.encounters
        .filter(e => ownedGameIds.has(e.location.gameId))
        .map(e => e.catchRate));
    return bestInGame >= bestAcrossOwnedGames;
}

export function calculateMetaDataForAllPokemon(pokemon: Pokemon[], evolutionChains: EvolutionChain[], user: User | null | undefined) {
    return pokemon.map((p) => {
        const evolutionChain = (evolutionChains.find(e => e.id === p.evolutionChainId) as EvolutionChain);
        return calculateMetaDataForPokemon(p, evolutionChain, user, pokemon);
    });
}