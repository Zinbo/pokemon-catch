export default interface EvolutionChain {
    id: number
    baby: Baby
    evolutions: Evolution[]
    allPokemonInChain: number[]
}

interface Baby {
    pokedexNumber: number
    item: string
}

interface Evolution {
    from: number
    to: number
    waysToEvolve: EvolutionCriteria[]
}

interface EvolutionCriteria {
    triggerCriteria: TriggerCriteria[]
    trigger: string
}

interface TriggerCriteria {
    type: string
    value: string
}

