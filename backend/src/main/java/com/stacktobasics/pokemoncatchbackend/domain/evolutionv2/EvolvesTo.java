package com.stacktobasics.pokemoncatchbackend.domain.evolutionv2;

import com.stacktobasics.pokemoncatchbackend.domain.evolution.EvolutionCriteria;
import lombok.Data;

import java.util.List;

@Data
public class EvolvesTo {
    private List<EvolutionCriteria> waysToEvolve;
    private int pokedexNumber;
    private String name;
    private List<EvolvesTo> evolvesTo;
}
