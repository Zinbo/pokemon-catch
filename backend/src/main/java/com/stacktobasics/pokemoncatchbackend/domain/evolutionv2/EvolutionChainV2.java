package com.stacktobasics.pokemoncatchbackend.domain.evolutionv2;

import com.stacktobasics.pokemoncatchbackend.domain.evolution.Baby;
import lombok.*;
import org.springframework.data.annotation.Id;

@Getter
@Setter
@NoArgsConstructor
@EqualsAndHashCode(of = "id")
@ToString
public class EvolutionChainV2 {
    @Id
    private int id;
    private Baby baby;
    private EvolvesTo chain;
}
