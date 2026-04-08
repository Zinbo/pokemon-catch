import Game from "@/types/Game";
import Pokemon from "@/types/Pokemon";

export enum BankAccess {
    NONE = "NONE",
    BANK = "BANK",
    BANK_AND_TRANSPORTER = "BANK_AND_TRANSPORTER"
}

export default interface User {
    id: string
    ownedGames: Game[]
    ownedPokemon: OwnedPokemon[]
    pokemonBankAccess: BankAccess
}

export interface OwnedPokemon {
    pokedexNumber: number
    collectedDate: Date
}