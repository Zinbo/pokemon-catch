import {Baby, EvolutionCriteria} from "@/data/EvolutionChain";

export default interface EvolutionChainV2 {
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