import Game from "@/data/Game";
import Pokemon from "@/data/Pokemon";

export default interface User {
    id: string
    ownedGames: Game[]
    ownedPokemon: OwnedPokemon[]
}

export interface OwnedPokemon {
    pokedexNumber: number
    collectedDate: Date
}