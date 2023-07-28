interface Location {
    name: string
    gameId: number
}

interface Encounter {
    catchRate: number
    location: Location
    method: string
    condition: string
}


interface EncounterDetails {
    bestCatchRate: number
    encounters: Encounter[]
}

export default interface Pokemon {
    pokedexNumber: number
    name: string
    generation: number
    encounterDetails: EncounterDetails
    evolutionChainId: number
}