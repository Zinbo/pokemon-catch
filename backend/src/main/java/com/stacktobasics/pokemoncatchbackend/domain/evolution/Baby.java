package com.stacktobasics.pokemoncatchbackend.domain.evolution;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@NoArgsConstructor
@ToString
public class Baby {
    private int pokedexNumber;
    private String item;

    public Baby(int pokedexNumber, String item) {
        this.pokedexNumber = pokedexNumber;
        this.item = item;
    }
}
