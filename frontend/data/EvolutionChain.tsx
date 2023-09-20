export default interface EvolutionChain {
    id: number;
    baby ?: Baby;
    chain: EvolvesTo;
}

export interface EvolvesTo {
    waysToEvolve: EvolutionCriteria[];
    pokedexNumber: number;
    name: string;
    evolvesTo: EvolvesTo[];
}

export interface Baby {
    pokedexNumber: number
    item: string
}

export interface EvolutionCriteria {
    triggerCriteria: TriggerCriteria[]
    trigger: string
}

interface TriggerCriteria {
    type: string
    value: string
}