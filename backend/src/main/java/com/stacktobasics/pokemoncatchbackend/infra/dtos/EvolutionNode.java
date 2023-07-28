package com.stacktobasics.pokemoncatchbackend.infra.dtos;

import com.stacktobasics.pokemoncatchbackend.infra.dtos.evolution.EvolvesToDTO;
import lombok.Getter;

@Getter
public class EvolutionNode {
    EvolvesToDTO evolvesToDTO;
    int from;

    public EvolutionNode(EvolvesToDTO evolvesToDTO, int from) {
        this.evolvesToDTO = evolvesToDTO;
        this.from = from;
    }
}
