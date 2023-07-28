import Game from "@/data/Game";
import Pokemon from "@/data/Pokemon";

export default interface User {
    id: string
    ownedGames: Game[]
    ownedPokemon: Pokemon[]
}