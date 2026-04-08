import Game from "@/types/Game";
import Pokemon from "@/types/Pokemon";

export type PokemonBankAccess = 'NONE' | 'POKEMON_BANK' | 'POKEMON_BANK_AND_TRANSPORTER';

export default interface User {
    id: string
    ownedGames: Game[]
    ownedPokemon: OwnedPokemon[]
    pokemonBankAccess: PokemonBankAccess
}

export interface OwnedPokemon {
    pokedexNumber: number
    collectedDate: Date
}