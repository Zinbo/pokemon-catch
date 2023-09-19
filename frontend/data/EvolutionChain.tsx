export default interface EvolutionChain {
    id: number
    baby: Baby
    evolutions: Evolution[]
    allPokemonInChain: number[]
}

export interface Baby {
    pokedexNumber: number
    item: string
}

interface Evolution {
    from: number
    to: number
    waysToEvolve: EvolutionCriteria[]
}

export interface EvolutionCriteria {
    triggerCriteria: TriggerCriteria[]
    trigger: string
}

interface TriggerCriteria {
    type: string
    value: string
}

