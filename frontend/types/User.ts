import Game from "@/types/Game";
import Pokemon from "@/types/Pokemon";

export default interface User {
    id: string
    ownedGames: Game[]
    ownedPokemon: OwnedPokemon[]
}

export interface OwnedPokemon {
    pokedexNumber: number
    collectedDate: Date
}